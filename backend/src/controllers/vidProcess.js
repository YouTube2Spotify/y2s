const express = require("express");
const router = express.Router();
const { testFunction } = require("../helpers");
const util = require("util");

router.post("/get_songs", (req, res) => {
	console.log(req);
	console.log(`Body contents inspected: ${util.inspect(req.body.videoUrl)}`);
});

module.exports = router;
