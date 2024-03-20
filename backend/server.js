require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 5000;
const routes = require("./routes/index");


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", routes);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
module.exports = app;
