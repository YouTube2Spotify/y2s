// Listen for song & artist being added to Spotify. Store data in localstorage 
// for later use
chrome.runtime.onMessage.addListener( (req, sender, sendResponse) => {
  if (req.title) {
    chrome.storage.sync.set({
      addedSongTitle: req.title,
      addedSongArtist: req.artist,
      songAddedTime: Date.now()
    })
  }
});