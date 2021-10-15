require("dotenv").config();
let fs = require("fs");
let ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const API_KEY = process.env.API_KEY;
const axios = require("axios");
const FormData = require("form-data");
const util = require("util");

const convertVideo = (url, accessToken) => {
	let videoId = url.split("?v=")[1];
	return new Promise((resolve, reject) => {
		const webmPath = `./audio/${videoId}.webm`;
		const audioPath = `./audio/${videoId}.mp3`;
		let startTime = Date.now();

		ytdl.getInfo(url).then((info) => {
			let webm = ytdl.downloadFromInfo(info, {
				filter: "audioonly",
				quality: "lowest",
			});
			webm.pipe(fs.createWriteStream(webmPath));
			console.log("Downloading...");

			webm.on("end", () => {
				let endTime = Date.now();
				let elapsedTime = endTime - startTime;
				console.log(`${elapsedTime / 1000} secs`);

				// Convert webm to mp3
				ffmpeg(webmPath)
					.duration(24)
					.format("mp3")
					.save(audioPath)
					.on("error", (err) => console.log(`Error converting: ${err.message}`))
					.on("start", () => console.log("Converting..."))
					.on("end", () => {
						console.log("Conversion complete. Sending audio.");

						// Construct audd.io payload
						var data = new FormData();
						data.append("file", fs.createReadStream(audioPath));
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

						// Send payload
						axios(config).then((res) => {
							// Delete webm and mp3
							fs.unlinkSync(webmPath);
							fs.unlinkSync(audioPath);
							console.log(`Audd.io: ${res.data}`);

							if (res.data.result != null) {
								// audd.io recognizes song
								console.log(res.data.result);

								if (res.data.result.spotify) {
									// audd.io returns spotify data
									console.log("API returned spotify id");
									resolve({
										title: res.data.result.title,
										artist: res.data.result.artist,
										spotifyId: res.data.result.spotify.id,
									});
								} else {
									// audd.io does not return spotify data
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
								// audd.io does not recognize song
								reject({ error: "No matching spotify song" });
							}
						});
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
	// Artist name may have ; /
	let artistList = artist.split(/[\/\;]/);
	console.log(`Artist List: ${artistList}`);

	return new Promise((resolve, reject) => {
		for (let i = 0; i < artistList.length; i++) {
			let options = {
				url: `https://api.spotify.com/v1/search/?q=track:${title} artist:${artistList[i]}&type=track&limit=1`,
				method: "get",
				headers: {
					Authorization: "Bearer " + accessToken,
				},
				json: true,
			};

			axios(options)
				.then((res) => {
					if (res.data.tracks.total != 0) {
						console.log(`Found title for ${artistList[i]}`);
						resolve(res.data.tracks.items[0].id);
					}
				})
				.catch((err) => {
					reject(err);
				});
		}
	});
};

module.exports = { convertVideo, likeSpotifyTrack };
