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

function getMusic() {
	const payload = {
		message: 'get music',
		url: document.URL
	};

	chrome.runtime.sendMessage(payload);
};
