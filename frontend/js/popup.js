document.addEventListener("DOMContentLoaded", async () => {
	chrome.runtime.onMessage.addListener((message, sender) => {
		if (message.message == 'logged in') {
			removeLoginButton();
		};
	});

	document.getElementById("spotify-login").addEventListener("click", spotifyLogin);

	// Hide any notification badges currently showing
  chrome.action.setBadgeText({ text: ''});

	// Check local storage to see what the latest added song is. Update popup to reflect
	// name and artist of the latest song added to Spotify liked songs. This method is required
	// because chrome extension popups are destroyed when closed and can't update in the bg???
	const newSong = await getLocalValue('addedSongTitle')
	if (newSong.addedSongTitle) {
		const newSongArtist = await getLocalValue('addedSongArtist');
		const timeStored = await getLocalValue('songAddedTime');
		const currentTime = Date.now();
		const timePassed = (((currentTime - timeStored.songAddedTime) / 1000) / 60).toFixed(1);
		let songAdded = document.createElement('p');
		songAdded.innerHTML = `${newSong.addedSongTitle} by ${newSongArtist.addedSongArtist} was added to your liked songs on Spotify ${timePassed} minutes ago!`
		document.getElementById('song-added').appendChild(songAdded);
	} else {
		let songNotFound = document.createElement('p');
		songNotFound.innerHTML = 'The last song you attempted to add to Spotify was not found.'
		document.getElementById('song-added').append(songNotFound);
	};

	chrome.storage.sync.get('refreshToken', data => {
		// If refresh token already exists, remove Spotify login button from extension
		// and display logged in message.
		if (data.refreshToken) {
			document.getElementById('spotify-login').style.display = 'none';
			let loggedInMessage = document.createElement('p');
			loggedInMessage.innerHTML = 'You are logged in to Spotify!'
			document.getElementById('login-flow').appendChild(loggedInMessage);
		};
	});

	// Call authentication flow function in background.js
	function spotifyLogin() {
		const payload = {
			message: 'spotify login',
		};

		chrome.runtime.sendMessage(payload)
	};

	// Remove login button after user has logged in
	function removeLoginButton() {
		document.getElementById('spotify-login').style.display = 'none';
		let loggedInMessage = document.createElement('p');
		loggedInMessage.innerHTML = 'You are logged in to Spotify!'
		document.getElementById('login-flow').appendChild(loggedInMessage);
	};

	// Retrieve data stored in local storage. Find item by key
	async function getLocalValue(key) {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(key, (data) => {
				resolve(data);
			});
		});
	};

});
