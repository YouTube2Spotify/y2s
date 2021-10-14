// Listen for song & artist being added to Spotify. Store data in localstorage 
// for later use
chrome.runtime.onMessage.addListener( (req, sender, sendResponse) => {
  if (req.error) {
    chrome.storage.sync.remove(['addedSongTitle', 'addedSongArtist', 'songAddedTime' ], () => {
      chrome.storage.sync.set({ error: 'Song not found' })
      chrome.notifications.create('Song not found', {
        type: 'basic',
        iconUrl: '../images/icon32.png',
        title: 'Song not found',
        message: `Unfortunately, the song could not be found so nothing was added to your liked songs list on Spotify.`
      }, () => {
        console.log('song not found notification sent!')
      })
    });
  };

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