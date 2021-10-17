<div align="center">
  <img src="./frontend/images/icon128.png" />
  <h1>YouTube 2 Spotify</h1>
  <i>YouTube 2 Spotify saves the currently playing YouTube song into your Spotify library.</i>

  <br/>
  <a href="https://github.com/benchan777/y2s/releases">Check out the Y2S extension here</a>
</div>

-----

## Table of Contents

-   [YouTube 2 Spotify](#spotify-playlist-generator)
    -   [Run Backend Locally](#running-the-backend-locally)
        -   Set up base files
        -   Install Python3 is installed
        -   Install ffmpeg
        -   Create Spotify [dev](https://developer.spotify.com/dashboard/) account
        -   Obtain [AudD](https://audd.io/) API key
        -   Set environment variables
        -   Run the application
    -   [Releases](#releases)
        -   [Backend](#backend)
        -   [Chrome Extension](#chrome-extension)

# Running the backend locally

1. Set up base files

    ```
    git clone https://github.com/benchan777/y2s.git
    cd backend/y2s
    npm install
    cp .env.sample .env
    ```

1. Ensure Python3 is installed (necessary for YouTubeDL)

    - Install required python dependency: `pip3 install pytube`

1. Install ffmpeg (needed to convert audio file obtained from YouTubeDL to a format suitable for recognition by AudD's API)

    - For MacOS: `brew install ffmpeg`

1. Create Spotify developer account & app

    - Visit [this](https://developer.spotify.com/dashboard) link and click **CREATE AN APP**.
    - Enter your Application Name and Application Description and click **Create**.
    - Click on your newly created app within the dashboard to find your **Client ID** and **Client Secret**.
    - Set redirect uris to your extensions's callback (ex. https://iigamqfeafobbpahkaiiammplhmeegga.chromiumapp.org/callback)
        - The ID preceding `chromiumapp.org` must match your extension's unique ID.
        - You can obtain the ID of your extension by going to the extensions page in your Chrome browser. The developer mode toggle on the upper right of the page must be enabled to view extension IDs.

1. Obtain an API key from [AudD](https://dashboard.audd.io/)

1. Set environment variables

    - Open and edit `.env`
        - `PORT=` Whichever port you want the app to run on
        - `AUDDIO_API_KEY=` your AudD api token

1. Run the application!
    - `npm start`

# Releases
## Backend

-   **Current release**: [v1.0-stable](https://github.com/benchan777/y2s/releases)
-   **Release Notes**:
    - Use pytube rather than node-youtube-dl to significantly increase audio download speed
    - Entire process of downloading audio, recognizing the song, and adding the song to Spotify now takes ~3 seconds rather than 15-20+ seconds

## Chrome Extension
-   **Current release**: [v1.0-stable](https://github.com/benchan777/y2s/releases)
-   **Release Notes**:
    - Added notification badge when song is not found and not added to Spotify liked list
    - Fixed issue with a wrong error message being displayed on the popup when user isn't logged in
-   **Next planned release**:
    - Options page to toggle different settings in the extension

### License

`Y2S` is available under the MIT license. See the [LICENSE](https://github.com/benchan777/y2s/blob/main/LICENSE) for more info.
