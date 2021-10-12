require("dotenv").config();
let fs = require("fs");
let ytdl = require("ytdl-core");
const API_KEY = process.env.API_KEY;
const axios = require("axios");
const FormData = require("form-data");
const util = require("util");
const { resolve } = require("path");

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
					if (res.data.status == "success") {
						resolve({ songUri: res.data.result.spotify.uri });
					} else {
						reject({ error: "No matching spotify song" });
					}
				});
			});
		});
	});
};

module.exports = { convertVideo };
