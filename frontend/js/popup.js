document.addEventListener('DOMContentLoaded', () => {
  let authToken;

  document.getElementById('spotify-login').addEventListener('click', spotifyLogin)

  async function spotifyLogin() {
    const response_type = 'code';
    const client_id = 'cc9e2365a9c1461ea9a251d446f347d0';
    const redirect_uri = chrome.identity.getRedirectURL();
    const scope = 'playlist-modify-private playlist-read-private';
    const state = ranString();
    const code_verifier = ranString();
    const code_challenge = await challenge_from_verifier(code_verifier)
    const code_challenge_method = 'S256';

    let url = `https://accounts.spotify.com/authorize?response_type=${response_type}` +
      `&client_id=${client_id}` +
      `&redirect_uri=${redirect_uri}` +
      `&scope=${scope}` +
      `&code_challenge=${code_challenge}` +
      `&code_challenge_method=${code_challenge_method}`

    chrome.identity.launchWebAuthFlow({
      "url": url,
      'interactive': true
    }, redirectUrl => {
      const url = new URL(redirectUrl);
      const params = new URLSearchParams(url.search);
      authToken = params.get('code');

      if (authToken === null) {
        console.log('failed to retrieve auth token')
      } else {
        const queryString = `https://accounts.spotify.com/api/token` +
          `?client_id=${client_id}` +
          `&grant_type=authorization_code` +
          `&code=${authToken}` +
          `&redirect_uri=${redirect_uri}` +
          `&code_verifier=${code_verifier}`

        fetch(queryString, {
          method: 'POST',
          mode: 'cors',
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then( response => response.json())
        .then( data => {
          chrome.storage.sync.set({
            refreshToken: data.refresh_token,
            accessToken: data.access_token,
            timeStamp: Date.now()
          }, () => {
            console.log('data stored locally')
          })
        })
        .catch( error => {
          console.log(error);
        })
      };
    });
  };

  function ranString() {
    str = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 56; i++) {
      str += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    return str;
  };

  function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  };
  
  function base64urlencode(hash) {
    let str = "";
    const bytes = new Uint8Array(hash);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      str += String.fromCharCode(bytes[i]);
    };
    return btoa(str)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };
  
  async function challenge_from_verifier(verifier) {
    let hashedString = await sha256(verifier);
    let base64encoded = base64urlencode(hashedString);
    return base64encoded;
  };

});
