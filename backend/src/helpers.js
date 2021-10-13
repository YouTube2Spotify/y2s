require("dotenv").config();
let fs = require("fs");
let ytdl = require("ytdl-core");
const API_KEY = process.env.API_KEY;
const axios = require("axios");
const FormData = require("form-data");
const util = require("util");

const convertVideo = (url) => {
	return new Promise((resolve, reject) => {
		const songPath = "./audio/newvid.webm";

		ytdl.getInfo(url).then((info) => {
			let webm = ytdl.downloadFromInfo(info, { filter: "audioonly" });
			webm.pipe(fs.createWriteStream(songPath));
			console.log("Downloading song");

			webm.on("end", () => {
				console.log("Sending song");
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
						resolve(res.data.result.spotify.id);
					} else {
						reject({ error: "No matching spotify song" });
					}
				});
			});
		});
	});
};

const likeSpotifyTrack = (accessToken, trackId) => {
	options = {
		url: `https://api.spotify.com/v1/me/tracks?ids=${trackId}`,
		method: "put",
		headers: {
			Authorization: "Bearer " + accessToken,
			"Content-Type": "application/json",
		},
		json: true,
	};

	axios(options, (err, res, body) => {
		console.log(res);
	});
};

module.exports = { convertVideo, likeSpotifyTrack };
