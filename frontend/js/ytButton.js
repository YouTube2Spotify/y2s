// Check if we're on a video page before inserting the button
if(document.URL.includes('youtube.com/watch')) {
  addButton();
};

document.addEventListener('yt-navigate-start', event => {
  if(document.URL.includes('youtube.com/watch')) {
    addButton();
  };
});

// Add button to YouTube player
function addButton() {
  let ytRightControls = document.getElementsByClassName('ytp-right-controls')[0]
  let suggestMusic = document.createElement('button')
  suggestMusic.className = 'ytp-suggest-button ytp-button'
  suggestMusic.id = 'suggest-music-button';
  suggestMusic.onclick = getMusic;
  suggestMusic.innerHTML = "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 36 36\" version=\"1.1\">"+
	"<use class=\"ytp-svg-shadow\" xlink:href=\"#ytp-svg-zoom\"></use>"+
	"<path id=\"ytp-svg-zoom\" d=\"M25,18h-2v3h-3v2h5V18z M13,15h3v-2h-5v5h2V15z "+
	"M27,9H9c-1.1,0-2,0.9-2,2v14c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V11C29,9.9,28.1,9,27,9z "+
	"M27,25H9V11h18V25z\" class=\"ytp-svg-fill\"></path></svg>"
  ytRightControls.insertBefore(suggestMusic, ytRightControls.getElementsByClassName('ytp-fullscreen-button')[0])
};

function getMusic() {
  data = { videoUrl: document.URL }
  console.log(data)

  fetch('http://localhost:3000/get_songs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
  .then( response => {
    console.log(response)
  })
  .catch( error => {
    console.log(error)
  })
};