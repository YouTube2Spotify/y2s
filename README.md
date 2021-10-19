<div align="center">
  <img src="./frontend/images/icon128.png" />
  <h1>YouTube 2 Spotify (Y2S)</h1>
  <i>YouTube 2 Spotify saves the currently playing YouTube song into your Spotify library.</i>

  <br/>
  <a href="https://github.com/YouTube2Spotify/y2s/releases">Get the extension here</a>
</div>

---

## Table of Contents

- [Run Backend Locally](#running-the-backend-locally)
  - Set up base files
  - Install Python3
  - Install ffmpeg
  - Create Spotify dev account
  - Obtain AudD.io API key
  - Set environment variables
  - Run the application
- [Installing Chrome Extension](#installing-the-chrome-extension)
- [Releases](#releases)
  - [Backend](#backend)
  - [Chrome Extension](#chrome-extension)

# Running the backend locally

Note: These steps are listed for developmental purposes. It is not necessary to run the backend locally on your machine in order for the Chrome extension to function as the extension is already connected to our backend server.

1. Set up base files

   ```
   $ git clone https://github.com/YouTube2Spotify/y2s.git
   $ cd backend
   $ npm install
   $ cp .env.sample .env
   ```

1. Install python3 (for `pytube`)

   - Install required python dependency: `pip3 install pytube`

1. Install ffmpeg (for converting pytube vid files to mp3s for AudD.io's API)

   - For MacOS: `brew install ffmpeg`

1. Create Spotify developer account & app

   - Visit [this](https://developer.spotify.com/dashboard) link and click **CREATE AN APP**.
   - Enter your Application Name and Application Description and click **Create**.
   - Click on your newly created app within the dashboard to find your **Client ID** and **Client Secret**.
   - Set redirect uris to your extension's callback (ex. https://iigamqfeafobbpahkaiiammplhmeegga.chromiumapp.org/callback)
     - The ID preceding `chromiumapp.org` must match your extension's unique ID.
     - You can obtain the ID of your extension by going to the extensions page in your Chrome browser. The developer mode toggle on the upper right of the page must be enabled to view extension IDs.

1. Obtain an API key from [AudD](https://dashboard.audd.io/)

1. Set environment variables

   - Open and edit `.env`
     - `PORT=` Whichever port you want the app to run on
     - `AUDDIO_API_KEY=` your AudD api key
     - `ODESLI_API_KEY=` your Odesli api key, if you have one

1. Run the application!

   - `npm start`

1. **(OPTIONAL)** See step 5 of [Installing the Chrome extension](#installing-the-chrome-extension) if you want to connect the Chrome extension to your local backend server

# Installing the Chrome extension

1. Go to `chrome://extensions/` in Chrome's URL bar

1. Enable developer mode on the upper right hand corner of the page

1. Click **Load unpacked** on the upper left hand corner of the page after enabling developer mode

1. Navigate to the root of the extension's folder (`/frontend`) and load the extension

1. **(OPTIONAL)** If you are running the backend server locally and want to connect the extension to it, change the URL in the fetch request of `getMusic()` located in `/frontend/js/background.js` to your development server's local address

# Releases

## **Backend**

**Current release**: [v1.1.0-stable](https://github.com/YouTube2Spotify/y2s/releases/tag/v1.1.0)

**Release Notes**:

- Adds Odesli API integration

**Past releases**:

- [v1.0.0-stable](https://github.com/YouTube2Spotify/y2s/releases)

## **Chrome Extension**

**Current release**: [v1.1.0-stable](https://github.com/YouTube2Spotify/y2s/releases/tag/v1.1.0)

**Release Notes**:

- Adds options menu
- Enable/disable debug messages

**Past releases**:

- [v1.0.0-stable](https://github.com/YouTube2Spotify/y2s/releases)

---

### **Powered by**

- [AudD.io](https://audd.io/)
- [Odesli](https://odesli.co/)
- [PyTube](https://github.com/pytube/pytube)
- [Spotify](https://developer.spotify.com/)

### License

`Y2S` is available under the MIT license. See the [LICENSE](https://github.com/YouTube2Spotify/y2s/blob/main/LICENSE) for more info.
