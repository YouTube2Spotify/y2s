const express = require("express");
const router = express.Router();
const {
	matchAudio,
	likeSpotifyTrack,
	downloadVideo,
	convertVideo,
	odesli,
} = require("../helpers");
const util = require("util");

// Recognize vid's audio, like song on spotify, return song metadata
router.post("/like_song", async (req, res) => {
	const accessToken = req.body.accessToken;
	const vidURL = req.body.videoUrl;
	const videoId = vidURL.split("?v=")[1];

	try {
		let songInfo = await odesli(vidURL, accessToken);

		// Attempt to find song using Odesli
		if (songInfo.spotifyId) {
			console.log('Song info found with Odesli')
			likeSpotifyTrack(accessToken, songInfo.spotifyId)
				.then( () => {
					res.json(songInfo);
				})
		}

		// If we can't find the song using Odesli, download the audio instead and send it
		// to AudD.io for recognition
		if (songInfo.error) {
			await downloadVideo(vidURL);
			await convertVideo(videoId);
			let songInfo = await matchAudio(vidURL, accessToken);
			await likeSpotifyTrack(accessToken, songInfo.spotifyId);
			res.json(songInfo);
		}
	} catch (error) {
			return res.json(error);
	}
});

module.exports = router;
