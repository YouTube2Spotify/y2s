const express = require("express");
const router = express.Router();
const { convertVideo, likeSpotifyTrack } = require("../helpers");
const util = require("util");

// Recognize vid's audio, like song on spotify, return song metadata
router.post("/like_song", (req, res) => {
	let songInfo;
	let accessToken = req.body.accessToken;
	let vidURL = req.body.videoUrl;
	convertVideo(vidURL, accessToken)
		.then((res) => {
			songInfo = res;
			likeSpotifyTrack(accessToken, songInfo.spotifyId);
		})
		.then(() => {
			console.log(songInfo);
			res.json(songInfo);
		})
		.catch((error) => console.log(error));
});

module.exports = router;
