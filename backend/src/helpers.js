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
				// console.log(res.data.result);

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
	});
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
			resolve();
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

const odesli = (url, accessToken) => {
	return new Promise((resolve, reject) => {
		let data;
		const query = encodeURI(url.split('&')[0]);
		const platform = 'youtube';

		let options = {
			url: `https://api.song.link/v1-alpha.1/links?url=${query}&platform=${platform}`,
			method: 'GET',
			json: true
		};

		axios(options)
			.then( response => {
				if (response.data.linksByPlatform.spotify) {
					const uniqueId = response.data.linksByPlatform.spotify.entityUniqueId;

					data = {
						title: response.data.entitiesByUniqueId[uniqueId].title,
						artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						spotifyId: response.data.entitiesByUniqueId[uniqueId].id
					};

					resolve(data);

				// If data not found in Spotify, check yandex
				// The below checks do not return spotify id's. Therefore, we must run searchSpotify()
				} else if (response.data.linksByPlatform.yandex) {
						const uniqueId = response.data.linksByPlatform.yandex.entityUniqueId;

						data = {
							title: response.data.entitiesByUniqueId[uniqueId].title,
							artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						};

						searchSpotify(accessToken, data.title, data.artist)
							.then( id => {
								data.spotifyId = id;
								resolve(data);
							})
							.catch( err => {
								reject(err);
							})

				// If data not found in Spotify & yandex, check pandora
				}	else if (response.data.linksByPlatform.pandora) {
						const uniqueId = response.data.linksByPlatform.pandora.entityUniqueId;

						data = {
							title: response.data.entitiesByUniqueId[uniqueId].title,
							artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						};

						searchSpotify(accessToken, data.title, data.artist)
							.then( id => {
								data.spotifyId = id;
								resolve(data);
							})
							.catch( err => {
								reject(err);
							})
				}	else if (response.data.linksByPlatform.amazonMusic) {
						const uniqueId = response.data.linksByPlatform.amazonMusic.entityUniqueId;

						data = {
							title: response.data.entitiesByUniqueId[uniqueId].title,
							artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						};

						searchSpotify(accessToken, data.title, data.artist)
							.then( id => {
								data.spotifyId = id;
								resolve(data);
							})
							.catch( err => {
								reject(err);
							})
				} else if (response.data.linksByPlatform.deezer) {
						const uniqueId = response.data.linksByPlatform.deezer.entityUniqueId;

						data = {
							title: response.data.entitiesByUniqueId[uniqueId].title,
							artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						};

						searchSpotify(accessToken, data.title, data.artist)
							.then( id => {
								data.spotifyId = id;
								resolve(data);
							})
							.catch( err => {
								reject(err);
							})
				} else if (response.data.linksByPlatform.tidal) {
						const uniqueId = response.data.linksByPlatform.tidal.entityUniqueId;

						data = {
							title: response.data.entitiesByUniqueId[uniqueId].title,
							artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						};

						searchSpotify(accessToken, data.title, data.artist)
							.then( id => {
								data.spotifyId = id;
								resolve(data);
							})
							.catch( err => {
								reject(err);
							})
				}	else if (response.data.linksByPlatform.napster) {
						const uniqueId = response.data.linksByPlatform.napster.entityUniqueId;

						data = {
							title: response.data.entitiesByUniqueId[uniqueId].title,
							artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						};

						searchSpotify(accessToken, data.title, data.artist)
							.then( id => {
								data.spotifyId = id;
								resolve(data);
							})
							.catch( err => {
								reject(err);
							})
				}	else {
						resolve({ error: 'Spotify data not found'});

						// let promises = [];

						// for (const provider in response.data.linksByPlatform) {
						// 	promises.push(new Promise((resolve, reject) => {
						// 		if (whitelisted.includes(provider)) {
						// 			console.log(provider)

						// 			console.log(response.data.linksByPlatform[platform])
						// 			const uniqueId = response.data.linksByPlatform[platform].entityUniqueId;
	
						// 			data = {
						// 				title: response.data.entitiesByUniqueId[uniqueId].title,
						// 				artist: response.data.entitiesByUniqueId[uniqueId].artistName,
						// 			};
	
						// 			searchSpotify(accessToken, data.title, data.artist)
						// 				.then( id => {
						// 					data.spotifyId = id;
						// 					resolve(data);
						// 				})
						// 				.catch( err => {
						// 					reject(err);
						// 				})
						// 		} else {
						// 				resolve({ error: 'Spotify data not found'});
						// 		}
						// 	}))
						// }
						// Promise.all(promises).then(result => {
						// 	console.log(result)
						// })
				}
			})
			.catch( error => {
				reject(error);
			})
	});
};

module.exports = { matchAudio, likeSpotifyTrack, downloadVideo, convertVideo, odesli };
