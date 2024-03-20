const express = require("express");
const router = express.Router();
const submission = require('./submission');
router.get("/", (req, res) => {
  res.json({ message: "hello to my api" });
});
router.use('/submission',submission);
module.exports = router;
