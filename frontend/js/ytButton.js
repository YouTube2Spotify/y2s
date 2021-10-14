// Check if we're on a video page before inserting the button
if (document.URL.includes("youtube.com/watch")) {
	addButton();
}

document.addEventListener("yt-navigate-start", (event) => {
	if (document.URL.includes("youtube.com/watch")) {
		addButton();
	}
});

// Add button to YouTube player
function addButton() {
	// Prevent duplicate buttons being generated if one already exists
	if (document.getElementById("suggest-music-button") !== null) {
		return;
	}
	let ytRightControls = document.getElementsByClassName("ytp-right-controls")[0];
	let suggestMusic = document.createElement("button");
	suggestMusic.title = "Save to Spotify";
	suggestMusic.style.verticalAlign = "top";
	let img = document.createElement("img");
	img.id = "spotify-button-img";
	img.src = chrome.runtime.getURL("/images/icon128.png");
	suggestMusic.className = "ytp-suggest-button ytp-button";
	suggestMusic.id = "suggest-music-button";
	suggestMusic.onclick = getMusic;
	ytRightControls.insertBefore(
		suggestMusic,
		ytRightControls.getElementsByClassName("ytp-fullscreen-button")[0]
	);
	document.getElementById("suggest-music-button").appendChild(img);
}

async function getMusic() {
	const accessTokenTime = await getLocalValue("timeStamp");
	const timeDifference = await elapsedTime(accessTokenTime.timeStamp);

	// Generate new tokens if 50 min has elapsed since generation of last access token
	if (timeDifference > 3000) {
		const refreshToken = await getLocalValue("refreshToken");
		const newToken = await getNewTokens(refreshToken.refreshToken);

		// Store refreshed access token in database
		chrome.storage.sync.set(
			{
				refreshToken: newToken.refresh_token,
				accessToken: newToken.access_token,
				timeStamp: Date.now(),
			},
			() => {
				console.log("new access token stored successfully");
			}
		);
	}

	const accessToken = await getLocalValue("accessToken");
	const data = { videoUrl: document.URL, accessToken: accessToken.accessToken };

	fetch(`http://localhost:3000/api/like_song`, {
		method: "POST",
		mode: "cors",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			chrome.runtime.sendMessage(data, (res) => {
				console.log("Track data sent to extension.");
			});
		})
		.catch((error) => {
			console.log(error);
		});
}

// Retrieve data stored in local storage. Find item by key
async function getLocalValue(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(key, (data) => {
			resolve(data);
		});
	});
}

// Get time difference between current time and time the last accessToken was generated
async function elapsedTime(tokenTimestamp) {
	return new Promise((resolve, reject) => {
		const curentTime = Date.now();
		const timeDifference = (curentTime - tokenTimestamp) / 1000;
		resolve(timeDifference);
	});
}

// Generate new accessToken & refreshToken when old accessToken has expired
// Refresh tokens obtained using PKCE auth flow can be exchanged for an access token only
// once, so a new refresh token must be generated and stored each time
async function getNewTokens(refreshToken) {
	return new Promise((resolve, reject) => {
		const grant_type = "refresh_token";
		const client_id = "cc9e2365a9c1461ea9a251d446f347d0";

		const queryString =
			"https://accounts.spotify.com/api/token" +
			`?client_id=${client_id}` +
			`&grant_type=${grant_type}` +
			`&refresh_token=${refreshToken}`;

		fetch(queryString, {
			method: "POST",
			mode: "cors",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		})
			.then((response) => response.json())
			.then((data) => {
				// console.log(data)
				resolve(data);
			})
			.catch((error) => {
				reject(error);
			});
	});
}
