import axios from "axios";
import React, { useEffect, useState } from "react";
import moment from "moment";

export default function Submission() {
  const [submissions, setSubmissions] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://submission-chi.vercel.app/submission`);
     
        setSubmissions(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getLanguageName = (codeLanguage) => {
    switch (codeLanguage) {
      case "54":
        return "C++";
      case "62":
        return "Java";
      case "93":
        return "JavaScript";
      case "71":
        return "Python";
      default:
        return "Unknown";
    }
  };
  return submissions ? (
    <div className="table_container">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Language</th>
            <th>Stdin</th>
            <th>Source Code</th>
            <th>Stdout</th>
            <th>Submission Time</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((item) => (
            <tr key={item.id}>
              <td>{item.username}</td>
              <td>{getLanguageName(item.code_language)}</td>
              <td>{item.input}</td>
              <td>
                {item.program_code.length <= 100
                  ? item.program_code
                  : `${item.program_code.slice(0, 100)}...`}
              </td>

              <td>{item.stdout}</td>
              <td>
                {item.created_at
                  ? moment(item.created_at).format("YYYY-MM-DD HH:mm:ss")
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="loading-state">
      <div className="loading"></div>
    </div>
  );
}
