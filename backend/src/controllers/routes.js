require("dotenv").config();
// const request = require("request");
const express = require("express");
const router = express.Router();

// const middleware = require("../middleware");
const { testFunction } = require("../helpers");

router.post("/get_songs", (req, res) => {
  console.log(req.body)
  testFunction();
});

module.exports = router;