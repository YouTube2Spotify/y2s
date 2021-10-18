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
	let accessToken = req.body.accessToken;
	let vidURL = req.body.videoUrl;
	let videoId = vidURL.split("?v=")[1];

	try {
		const odesliData = await odesli(vidURL);

		// Attempt to find song using Odesli
		if (odesliData.spotifyId) {
			console.log('Song info found with Odesli')
			likeSpotifyTrack(accessToken, odesliData.spotifyId)
				.then( () => {
					res.json(odesliData);
				})
		}

		// If we can't find the song using Odesli, download the audio instead and send it
		// to AudD.io for recognition
		if (odesliData.error) {
			await downloadVideo(vidURL);
			await convertVideo(videoId);
			const songInfo = await matchAudio(vidURL, accessToken);
			await likeSpotifyTrack(accessToken, songInfo.spotifyId);
			res.json(songInfo);
		}
	} catch (error) {
			return res.json(error);
	}
});

module.exports = router;
