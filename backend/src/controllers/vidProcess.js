const express = require("express");
const router = express.Router();
const { convertVideo, likeSpotifyTrack } = require("../helpers");
const util = require("util");

// Convert youtube vid to audio
router.post("/get_songs", (req, res) => {
	let songInfo;
	let accessToken = req.body.accessToken;
	let vidURL = req.body.videoUrl;
	convertVideo(vidURL)
		.then((res) => {
			songInfo = res;
			likeSpotifyTrack(accessToken, songInfo.spotifyId);
		})
		.then(() => {
			console.log(songInfo);
			res.json(songInfo);
		})
		.catch( error => {
			console.log(error);
			res.json(error);
		});
});

module.exports = router;
