require("dotenv").config();
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const AUDDIO_API_KEY = process.env.AUDDIO_API_KEY;
const axios = require("axios");
const FormData = require("form-data");
const { spawn } = require("child_process");

// console.log(`Source code directory: ${__dirname}`);
// console.log(`Working directory: ${process.cwd()}`);

const matchAudio = (url, accessToken) => {
	let videoId = url.split("?v=")[1];
	let videoPath = `./audio/${videoId}.mp4`;
	let audioPath = `./audio/${videoId}.mp3`;

	return new Promise((resolve, reject) => {
		var data = new FormData();
		data.append("file", fs.createReadStream(audioPath));
		data.append("api_token", AUDDIO_API_KEY);
		data.append("return", "spotify");

		var config = {
			method: "post",
			url: "https://api.audd.io/",
			headers: {
				...data.getHeaders(),
			},
			data: data,
		};

		// Send payload
		axios(config).then((res) => {
			// Delete webm and mp3
			fs.unlinkSync(videoPath);
			fs.unlinkSync(audioPath);

			if (res.data.result != null) {
				// audd.io recognizes song
				console.log(res.data.result);

				if (res.data.result.spotify) {
					// audd.io returns spotify data
					console.log("Auddio returned spotify id");
					resolve({
						title: res.data.result.title,
						artist: res.data.result.artist,
						spotifyId: res.data.result.spotify.id,
					});
				} else {
					// audd.io does not return spotify data
					console.log("Auddio did not return spotify id, searching spotify w/ song data");
					searchSpotify(accessToken, res.data.result.title, res.data.result.artist)
						.then((spotifyId) => {
							resolve({
								title: res.data.result.title,
								artist: res.data.result.artist,
								spotifyId: spotifyId,
							});
						})
						.catch((err) => {
							reject(err);
						});
				}
			} else {
				// audd.io does not recognize song
				console.log("No Auddio match.");

				// Should change this message to say that audd.io failed to recognize the song
				reject({ error: "No matching spotify song" });
			}
		});
	});
};

const likeSpotifyTrack = (accessToken, trackId) => {
	return new Promise((resolve, reject) => {
		let options = {
			url: `https://api.spotify.com/v1/me/tracks?ids=${trackId}`,
			method: "put",
			headers: {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json",
			},
			json: true,
		};
	
		axios(options).then(() => {
			console.log("Song liked.");
			resolve();
		});
	})
};

const searchSpotify = (accessToken, title, artist) => {
	// Multiple artists separated by ; or /
	let artistList = artist.split(/[\/\;]/);

	return new Promise((resolve, reject) => {
		for (let i = 0; i < artistList.length; i++) {
			// Handle non-alphabet symbols in title/artist names
			let query = encodeURI(`track:${title} artist:${artistList[i]}`);

			let options = {
				url: `https://api.spotify.com/v1/search?query=${query}&type=track&limit=1`,
				method: "get",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				json: true,
			};

			axios(options)
				.then((res) => {
					if (res.data.tracks.total != 0) {
						console.log(`Found title for ${artistList[i]}`);
						resolve(res.data.tracks.items[0].id);
					} else {
						reject({ error: "Manual spotify search returned no results" });
					}
				})
				.catch((err) => {
					reject(err);
				});
		}
	});
};

const downloadVideo = (url) => {
	return new Promise((resolve, reject) => {
		console.log("Downloading video...");
		let processVideo = spawn("python3", [`${__dirname}/downloadVideo.py`, url]);

		processVideo.stdout.on("data", (data) => {
			if (data.toString() == 'noMetadata\n') {
				resolve('no metadata')
			} else if (data.toString() == 'metadataFound\n') {
				resolve('found metadata')
			}
		});

		processVideo.stderr.on("data", (data) => console.log(data.toString()));
	});
};

const convertVideo = (videoId) => {
	return new Promise((resolve, reject) => {
		ffmpeg(`./audio/${videoId}.mp4`)
			.duration(24)
			.format("mp3")
			.save(`./audio/${videoId}.mp3`)
			.on("error", (err) => {
				console.log(err);
				reject({ error: `Error converting ${videoId}.mp4` });
			})
			.on("start", () => console.log("Converting..."))
			.on("end", () => {
				console.log("Conversion complete.");
				resolve();
			});
	});
};

// searchSpotify(
// 	"BQA3nnC5J40RMvyuEy_mIFZvtuc874-W6cdp0tJVQFhQxRBssXX3goL2nkSEXDuFDQ1EkX5yAduROs2M4w6nplPjwNS_sE-Ha-3ERLgim5UQPY0_yrb_OHaKdeBoxk-2bpZx9j8ftzJxKV1701j_Iy5Txn2_G8VKolYct6Vqf5qv4dvfUUBwuGURDhTtYbr7Mecx4_Y",
// 	"test",
// 	"Test"
// )
// 	.then(() => console.log("hi"))
// 	.catch((err) => console.log(err));
module.exports = { matchAudio, likeSpotifyTrack, downloadVideo, convertVideo, searchSpotify };
