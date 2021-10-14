require("dotenv").config();
let fs = require("fs");
let ytdl = require("ytdl-core");
const API_KEY = process.env.API_KEY;
const axios = require("axios");
const FormData = require("form-data");
const util = require("util");

const convertVideo = (url, accessToken) => {
	return new Promise((resolve, reject) => {
		const songPath = "./audio/newvid.webm";
		// let startTime = Date.now();
		// let endTime;
		// let chunkSize;

		ytdl.getInfo(url).then((info) => {
			let webm = ytdl.downloadFromInfo(info, {
				filter: "audioonly",
				quality: "lowest",
			});
			webm.pipe(fs.createWriteStream(songPath));
			console.log("Downloading...");

			// webm.on("progress", (a, b, c) => {
			// 	console.log(a, b, c);
			// });

			webm.on("end", () => {
				// endTime = Date.now();
				// let elapsedTime = endTime - startTime;
				// console.log(`${elapsedTime / 1000} secs, chunk: ${chunkSize}`);

				console.log("Sending...");
				var data = new FormData();
				data.append("file", fs.createReadStream(songPath));
				data.append("api_token", API_KEY);
				data.append("return", "spotify");

				var config = {
					method: "post",
					url: "https://api.audd.io/",
					headers: {
						...data.getHeaders(),
					},
					data: data,
				};

				axios(config).then((res) => {
					if (res.data.result != null) {
						console.log(res.data.result);
						// If song is recognized

						if (res.data.result.spotify) {
							// If API returns spotify data
							console.log("API returned spotify id");
							resolve({
								title: res.data.result.title,
								artist: res.data.result.artist,
								spotifyId: res.data.result.spotify.id,
							});
						} else {
							// If API returns no spotify data
							console.log("API did not return spotify id, searching spotify w/ song data");
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
						reject({ error: "No matching spotify song" });
					}
				});
			});
		});
	});
};

const likeSpotifyTrack = (accessToken, trackId) => {
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
	});
};

const searchSpotify = (accessToken, title, artist) => {
	return new Promise((resolve, reject) => {
		let options = {
			url: `https://api.spotify.com/v1/search/?q=track:${title} artist:${artist}&type=track`,
			method: "get",
			headers: {
				Authorization: "Bearer " + accessToken,
			},
			json: true,
		};

		axios(options)
			.then((res) => {
				console.log(res.data);
				console.log(res.data.tracks.items[0].id);
				resolve(res.data.tracks.items[0].id);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

module.exports = { convertVideo, likeSpotifyTrack };
