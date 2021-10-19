document.addEventListener("DOMContentLoaded", async () => {
	chrome.runtime.onMessage.addListener((message, sender) => {
		if (message.message == 'logged in') {
			removeLoginButton();
		};
	});

	document.getElementById("spotify-login").addEventListener("click", spotifyLogin);

	// Hide any notification badges currently showing
  chrome.action.setBadgeText({ text: ''});

	// Get all data in local storage
	const localStorage = await getLocalStorage();

	// Show detailed error messages if user enabled the show debug setting in options
	if (localStorage.showDebug == true) {
		document.getElementById('debug-message').innerHTML = `Debug info: ${localStorage.error}`
	}

	// Check local storage to see what the latest added song is. Update popup to reflect
	// name and artist of the latest song added to Spotify liked songs. This method is required
	// because chrome extension popups are destroyed when closed and can't update in the bg???
	if (localStorage.addedSongTitle) {
		const currentTime = Date.now();
		const timePassed = (((currentTime - localStorage.songAddedTime) / 1000) / 60).toFixed(1);
		let message = document.createElement('p');
		message.innerHTML = `${localStorage.addedSongTitle} by ${localStorage.addedSongArtist} was added to your liked songs on Spotify ${timePassed} minutes ago!`
		document.getElementById('song-added').appendChild(message);
	} else if (!localStorage.addedSongTitle && !localStorage.error) {
			let message = document.createElement('p');
			message.innerHTML = 'Click the button in the YouTube player to add the current song to your Spotify liked songs list!'
			document.getElementById('song-added').append(message);
	} else{
			let message = document.createElement('p');
			message.innerHTML = 'The last song you attempted to add to Spotify was not found.'
			document.getElementById('song-added').append(message);
	}

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

	// Retrieve all data stored in local storage
	async function getLocalStorage() {
		return new Promise ((resolve, reject) => {
			chrome.storage.sync.get(null, data => {
				resolve(data);
			});
		});
	};

});
