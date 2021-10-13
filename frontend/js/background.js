// Listen for song & artist being added to Spotify. Store data in localstorage 
// for later use
chrome.runtime.onMessage.addListener( (req, sender, sendResponse) => {
  if (req.title) {
    chrome.storage.sync.set({
      addedSongTitle: req.title,
      addedSongArtist: req.artist,
      songAddedTime: Date.now()
    })

    chrome.notifications.create('Song added!', {
    	type: 'basic',
    	iconUrl: '../images/icon32.png',
    	title: 'Song added to Spotify!',
    	message: `${req.title} by ${req.artist} has been added to your liked songs on Spotify!`
    }, () => {
    	console.log('notification sent!')
    })
  }
});