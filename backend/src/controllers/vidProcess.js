const express = require("express");
const router = express.Router();
const { matchAudio, likeSpotifyTrack, downloadVideo, convertVideo, searchSpotify } = require("../helpers");
const util = require("util");

let pythonPayload;

// Recognize vid's audio, like song on spotify, return song metadata
router.post("/like_song", async (req, res) => {
	let songInfo;
	let accessToken = req.body.accessToken;
	let vidURL = req.body.videoUrl;
	let videoId = vidURL.split("?v=")[1];

	try {
		const metaDataResult = await downloadVideo(vidURL);

		// If metadata is found, skip the entire audio conversion & audio matching process
		// Instead, use results from searchSpotify()
		if (metaDataResult == 'found metadata') {
			console.log(pythonPayload.title)
			console.log(pythonPayload.artist)
			const songId = await searchSpotify(accessToken, pythonPayload.title, pythonPayload.artist);
			likeSpotifyTrack(accessToken, songId)
				.then( () => {
					res.json(pythonPayload)
				})
		}

		// If no metadata is found, continue on with the normal audio conversion & matching process
		if (metaDataResult == 'no metadata') {
			await convertVideo(videoId);

			matchAudio(vidURL, accessToken)
				.then((response) => {
					songInfo = response;
					likeSpotifyTrack(accessToken, songInfo.spotifyId)
						.then( () => {
							console.log(songInfo);
							res.json(songInfo);
						})
						.catch( error => {
							console.log(error);
							res.json(error);
						})
				})
				.catch((error) => {
					console.log(error);
					res.json(error);
				});
		}

	} catch(error) {
		return res.json(error);
	}

	// matchAudio(vidURL, accessToken)
	// 	.then((res) => {
	// 		songInfo = res;
	// 		likeSpotifyTrack(accessToken, songInfo.spotifyId)
	// 			.then( () => {
	// 				console.log(songInfo);
	// 				res.json(songInfo);
	// 			})
	// 			.catch( error => {
	// 				console.log(error);
	// 				res.json(error);
	// 			})
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		res.json(error);
	// 	});
});

router.post("/python", (req, res) => {
	pythonPayload = req.body
	res.send('data received') // Required because python requests.post expects a response
})

module.exports = router;
