let color = '#ffffff';
// const client_id = 'cc9e2365a9c1461ea9a251d446f347d0';
// const response_type = 'code';
// const state = ranString();
// const code_challenge_method = 'S256';
// const scope = 'playlist-modify-private playlist-read-private';
// const redirect_uri = chrome.identity.getRedirectURL();

chrome.runtime.onInstalled.addListener( () => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

// chrome.identity.launchWebAuthFlow({
//   "url": `https://accounts.spotify.com/authorize?response_type=${response_type}` +
//     `&client_id=${client_id}` +
//     `&redirect_uri=${redirect_uri}` +
//     `&scope=${scope}` +
//     `&code_challenge=${state}` +
//     `&code_challenge_method=${code_challenge_method}`
// }, redirectUrl => {
//   console.log(redirectUrl)
// });

// function ranString() {
//   str = "";
//   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   for (let i = 0; i < 45; i++) {
//     str += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return str;
// };