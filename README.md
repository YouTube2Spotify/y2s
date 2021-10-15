# YouTube 2 Spotify

YouTube 2 Spotify saves the currently playing YouTube song into your Spotify library.

[Check out Y2S here.](https://github.com/benchan777/y2s/releases)

## Table of Contents

-   [YouTube 2 Spotify](#spotify-playlist-generator)
    -   [Building](#building)
        -   [Set up base files](#set-up-base-files)
        -   [Create Spotify dev account](#create-spotify-developer-account)
        -   [Set environment variables](#set-environment-variables)
        -   [Run the application](#run-the-application)
    -   [Releases](#releases)
        -   [Backend](#backend)
        -   [Chrome Extension](#chrome-extension)

## Building the backend

1. Set up base files

    ```
    git clone https://github.com/benchan777/y2s.git
    cd backend/y2s
    npm install
    cp .env.sample .env
    ```

1. Create Spotify developer account & app

    - Visit [this](https://developer.spotify.com/dashboard) link and create an app.
    - Enter your Application Name and Application Description and click Create.
    - Click on your newly created app within the dashboard to find your **Client ID** and **Client Secret**.
    - Set redirect uris to your extensions's callback (ex. https://iigamqfeafobbpahkaiiammplhmeegga.chromiumapp.org/callback)

1. Set environment variables

    - Open and edit `.env`
        - `PORT =` Whichever port you want the app to run on
        - `API_KEY =` your AudD api token

1. Run the application!
    - `npm start`

# Releases
## Backend

-   **Current release**: [v0.1-alpha](https://github.com/benchan777/y2s/releases)
-   **Next planned release**:
    - Handle age restricted videos
    - Handle stalled youtube-dl downloads
    - Speed up audio download so song can be added more quickly

## Chrome Extension
-   **Current release**: [v0.1-alpha](https://github.com/benchan777/y2s/releases)
-   **Next planned release**:
    - Fix no notification badge when song is not successfully added
    - Options page to toggle different settings in the extension

### License

`Y2S` is available under the MIT license. See the [LICENSE](https://github.com/benchan777/y2s/blob/main/LICENSE) for more info.
