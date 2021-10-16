const express = require("express");
const router = express.Router();
const { matchAudio, likeSpotifyTrack } = require("../helpers");
const util = require("util");

// Recognize vid's audio, like song on spotify, return song metadata
router.post("/like_song", (req, res) => {
	let songInfo;
	let accessToken = req.body.accessToken;
	let vidURL = req.body.videoUrl;
	matchAudio(vidURL, accessToken)
		.then((res) => {
			songInfo = res;
			likeSpotifyTrack(accessToken, songInfo.spotifyId);
		})
		.then(() => {
			console.log(songInfo);
			res.json(songInfo);
		})
		.catch((error) => {
			console.log(error);
			res.json(error);
		});
});

module.exports = router;
