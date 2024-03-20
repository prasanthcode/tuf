const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const Redis = require("redis");
const axios = require("axios");
const redisClient = Redis.createClient({
  password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
const DEFAULT_EXPIRATION = 3600;
redisClient.on("error", (error) => console.error(`Error : ${error}`));
redisClient.connect();

// Create a connection pool
const pool = mysql.createPool({
  // host: "sql.freedb.tech",
  // user: "freedb_prasanth",
  // password: "U$haDU$&wycfQq8",
  // database: "freedb_prasanthDB",
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
});

// Use pool.getConnection() to get a connection from the pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }
  console.log("Connected to MySQL database");

  // Release the connection back to the pool after use
  connection.release();
});

router.post("/", async (req, res) => {
  const { username, language, input, code } = req.body;
  const base64Code = Buffer.from(code, "utf-8").toString("base64");
  const base64Input = Buffer.from(input, "utf-8").toString("base64");

  try {
    const submissionResponse = await submitToJudge0(
      language,
      base64Code,
      base64Input
    );

    const token = submissionResponse.data.token;
    const stdout = await waitForSubmissionResult(token);

    const submissionResult = await saveSubmissionToDatabase(
      username,
      language,
      input,
      code,
      stdout,
      token
    );

    invalidateCache();

    res.status(201).json({ message: "Submission inserted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});

router.get("/", async (req, res) => {
  try {
    const value = await redisClient.get("results");
    if (value != null) {
      return res.json(JSON.parse(value));
    } else {
      pool.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting MySQL connection: ", err);
          res.status(500).json({ error: "Failed to get MySQL connection" });
          return;
        }

        connection.query("SELECT * FROM submissions ORDER BY created_at DESC", (error, results) => {
          connection.release(); // Release the connection after query execution
          if (error) {
            console.error("Error executing query: ", error);
            res.status(500).json({ error: "Failed to execute query" });
            return;
          }

          redisClient.setEx(
            "results",
            DEFAULT_EXPIRATION,
            JSON.stringify(results)
          );

          res.json(results);
        });
      });
    }
  } catch (err) {
    return res.status(404).json({ message: "Data not found in redis" });
  }
});
async function submitToJudge0(language, base64Code, base64Input) {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions",
    params: {
      base64_encoded: "true",
      fields: "*",
    },
    headers: {
      "content-type": "application/json",
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    data: {
      language_id: parseInt(language),
      source_code: base64Code,
      stdin: base64Input,
    },
  };

  return await axios.request(options);
}

async function waitForSubmissionResult(token) {
  const options = {
    method: "GET",
    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
    params: {
      base64_encoded: "true",
      fields: "stdout,status",
    },
    headers: {
      "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
  };

  let stdout = null;
  let status = "Processing";

  while (status === "Processing" || status === "In Queue") {
    const response = await axios.request(options);
    stdout = response.data.stdout;
    status = response.data.status.description;
    console.log("Status:", status);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every 1 second
  }

  return stdout ? Buffer.from(stdout, "base64").toString("utf-8") : null;
}

async function saveSubmissionToDatabase(
  username,
  language,
  input,
  code,
  stdout,
  token
) {
  const sql =
    "INSERT INTO submissions (username, code_language, input, program_code, created_at, judge_token,stdout) VALUES (?, ?, ?, ?, ?,?,?)";
  const values = [username, language, input, code, new Date(), token, stdout];

  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        console.error("Error getting MySQL connection: ", error);
        reject(error);
        return;
      }

      connection.query(sql, values, (queryError, results) => {
        connection.release(); // Release the connection after query execution
        if (queryError) {
          console.error(
            "Error inserting submission into database: ",
            queryError
          );
          reject(queryError);
          return;
        }

        resolve(results);
      });
    });
  });
}

function invalidateCache() {
  redisClient.del("results", (err, result) => {
    if (err) {
      console.error("Error invalidating cache:", err);
    } else {
      console.log("Cache invalidated successfully");
    }
  });
}
module.exports = router;
