document.addEventListener('DOMContentLoaded', () => {
  const redirect_uri = chrome.identity.getRedirectURL();

  document.getElementById('spotify-login').addEventListener('click', () => {
    const response_type = 'code';
    const client_id = 'cc9e2365a9c1461ea9a251d446f347d0';
    const redirect_uri = chrome.identity.getRedirectURL();
    const scope = 'playlist-modify-private playlist-read-private';
    const state = ranString();
    const code_challenge_method = 'S256';

    let url = `https://accounts.spotify.com/authorize?response_type=${response_type}` +
      `&client_id=${client_id}` +
      `&redirect_uri=${redirect_uri}` +
      `&scope=${scope}` +
      `&code_challenge=${state}` +
      `&code_challenge_method=${code_challenge_method}`

    chrome.identity.launchWebAuthFlow({
      "url": url,
      'interactive': true
    }, redirectUrl => {
      const url = new URL(redirectUrl);
      console.log(url)
      const params = new URLSearchParams(url.search);
      console.log(params.get('code'))
    });
  });

  function ranString() {
    str = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 45; i++) {
      str += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return str;
  };

});

