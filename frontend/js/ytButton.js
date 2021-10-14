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

function getMusic() {
	loginCheck()
	.then( data => {
		if (Object.keys(data).length === 0) {
			alert('You must give us access to your Spotify account before we can add songs to your liked list! Please log in from the extension button in your browser.');
			return
		};

		const payload = {
			message: 'get music',
			url: document.URL
		};

		chrome.runtime.sendMessage(payload);
	})

};

// Ensure user is logged in before allowing button click. This is done by checking
// for the existence of a refresh token
function loginCheck() {
	return new Promise( (resolve, reject) => {
		chrome.storage.sync.get('refreshToken', data => {
			resolve(data);
		})
	})
};