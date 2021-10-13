const express = require("express");
const router = express.Router();
const { convertVideo } = require("../helpers");
const util = require("util");

// Convert youtube vid to audio
router.post("/get_songs", (req, res) => {
	let accessToken = req.body.accessToken;
	let vidURL = req.body.videoUrl;
	convertVideo(vidURL).then((res) => console.log(res)).catch(error => console.log(error))
});

module.exports = router;
