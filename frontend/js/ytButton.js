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
	if (document.getElementById('suggest-music-button') !== null) {
		return
	}
	let ytRightControls = document.getElementsByClassName("ytp-right-controls")[0];
	let suggestMusic = document.createElement("button");
	suggestMusic.className = "ytp-suggest-button ytp-button";
	suggestMusic.id = "suggest-music-button";
	suggestMusic.onclick = getMusic;
	suggestMusic.innerHTML =
		'<svg width="100%" height="100%" viewBox="0 0 36 36" version="1.1">' +
		'<use class="ytp-svg-shadow" xlink:href="#ytp-svg-zoom"></use>' +
		'<path id="ytp-svg-zoom" d="M25,18h-2v3h-3v2h5V18z M13,15h3v-2h-5v5h2V15z ' +
		"M27,9H9c-1.1,0-2,0.9-2,2v14c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V11C29,9.9,28.1,9,27,9z " +
		'M27,25H9V11h18V25z" class="ytp-svg-fill"></path></svg>';
	ytRightControls.insertBefore(
		suggestMusic,
		ytRightControls.getElementsByClassName("ytp-fullscreen-button")[0]
	);
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

	fetch(`http://localhost:3000/api/vidProcess/get_songs`, {
		method: "POST",
		mode: "cors",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => {
			return response.json();
		})
		.then( data => {
			chrome.runtime.sendMessage(data, res => {
				console.log('Track data sent to extension.')
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
