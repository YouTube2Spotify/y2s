chrome.runtime.onMessage.addListener((message, sender) => {
	if (message.message == "get music") {
		getMusic(message.url);
	}

	if (message.message == "spotify login") {
		spotifyLogin();
	}
});

async function getMusic(url) {
	const { accessTokenTimestamp } = await getLocalValue("accessTokenTimestamp");
	const elapsedTime = (Date.now() - accessTokenTimestamp) / 1000;

	// Generate new tokens if 50 min has elapsed since generation of last access token
	if (elapsedTime > 3000) {
		const { refreshToken } = await getLocalValue("refreshToken");
		const newToken = await getNewTokens(refreshToken);

		// Store refreshed access token in database
		chrome.storage.sync.set({
				refreshToken: newToken.refresh_token,
				accessToken: newToken.access_token,
				accessTokenTimestamp: Date.now(),
			}, () => {
				console.log("new access token stored successfully");
			}
		);
	}

	const { accessToken } = await getLocalValue("accessToken");
	const data = { videoUrl: url, accessToken: accessToken };

	fetch(`https://y2s.main.benchan.tech/api/like_song`, {
		method: "POST",
		mode: "cors",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.error) {
				songNotFound(data);
			}

			if (data.title) {
				songAdded(data);
			}
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
				resolve(data);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

// When song is found and added successfully to Spotify, the data is stored in local storage.
// This is used so that the information can be viewed on the chrome extension popup.
function songAdded(data) {
	chrome.storage.sync.remove(["error"], () => { // Remove any existing error messages
		chrome.storage.sync.set({
			addedSongTitle: data.title,
			addedSongArtist: data.artist,
			songAddedTime: Date.now()
		}, () => {
			// Send notification to desktop
			chrome.notifications.create(
				'', {
					type: "basic",
					iconUrl: "../images/icon128.png",
					title: "Song added to Spotify!",
					message: `${data.title} by ${data.artist} has been added to your liked songs on Spotify!`,
				}, () => {
					// Show notification badge
					chrome.action.setBadgeBackgroundColor({ color: "red" });
					chrome.action.setBadgeText({ text: "1" });
				}
			);
		})
	});
}

// Delete song info from local storage if song is not successfully added to Spotify. This
// will trigger the chrome popup to notify the user that the song was not found and therefore
// unable to be added.
function songNotFound(data) {
	chrome.storage.sync.remove(["addedSongTitle", "addedSongArtist", "songAddedTime"], () => { // Remove previously added tracks history
		chrome.storage.sync.set({ error: data.error }, () => {
			chrome.notifications.create(
				'', {
					type: "basic",
					iconUrl: "../images/icon128.png",
					title: "Song not found",
					message: `Unfortunately, the song could not be found so nothing was added to your liked songs list on Spotify.`,
				}, () => {	
					// Show notification badge
					chrome.action.setBadgeBackgroundColor({ color: "red" });
					chrome.action.setBadgeText({ text: "1" });
				}
			);
		})
	});
}

// *******************************************
// **          AUTHENTICATION FLOW          **
// *******************************************
async function spotifyLogin() {
	const response_type = "code";
	const client_id = "cc9e2365a9c1461ea9a251d446f347d0";
	const redirect_uri = chrome.identity.getRedirectURL();
	const scope = "playlist-modify-private playlist-read-private user-library-modify";
	const state = ranString();
	const code_verifier = ranString();
	const code_challenge = await challenge_from_verifier(code_verifier);
	const code_challenge_method = "S256";

	let url =
		`https://accounts.spotify.com/authorize?response_type=${response_type}` +
		`&client_id=${client_id}` +
		`&redirect_uri=${redirect_uri}` +
		`&scope=${scope}` +
		`&code_challenge=${code_challenge}` +
		`&code_challenge_method=${code_challenge_method}`;

	chrome.identity.launchWebAuthFlow({
			url: url,
			interactive: true,
		}, (redirectUrl) => {
			const url = new URL(redirectUrl);
			const params = new URLSearchParams(url.search);
			let authToken = params.get("code");

			if (authToken === null) {
				console.log("failed to retrieve auth token");
			} else {
				const queryString =
					`https://accounts.spotify.com/api/token` +
					`?client_id=${client_id}` +
					`&grant_type=authorization_code` +
					`&code=${authToken}` +
					`&redirect_uri=${redirect_uri}` +
					`&code_verifier=${code_verifier}`;

				fetch(queryString, {
					method: "POST",
					mode: "cors",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
				})
					.then((response) => response.json())
					.then((data) => {
						chrome.storage.sync.set({
								refreshToken: data.refresh_token,
								accessToken: data.access_token,
								accessTokenTimestamp: Date.now(),
							}, () => {
								const payload = {
									message: "logged in",
								};

								chrome.runtime.sendMessage(payload);
							}
						);
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	);
}

function ranString() {
	str = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < 56; i++) {
		str += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return str;
}

function sha256(plain) {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(hash) {
	let str = "";
	const bytes = new Uint8Array(hash);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		str += String.fromCharCode(bytes[i]);
	}
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function challenge_from_verifier(verifier) {
	let hashedString = await sha256(verifier);
	let base64encoded = base64urlencode(hashedString);
	return base64encoded;
}
