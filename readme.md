# 🌦️ Weathrly – Weather Dashboard Web App

Weathrly is a responsive and accessible weather dashboard built using **Vanilla JavaScript**, **HTML/CSS**, and the **OpenWeatherMap API**. It fetches real-time weather data, displays it dynamically, and caches it locally for a faster and more reliable experience.

<br>

## 🔧 Features

- 🔍 Search weather by city name
- 📡 Fetches real-time weather from OpenWeatherMap
- 🕓 Caches results using `localStorage` to reduce redundant API calls
- ⏱️ Expired data (older than 10 minutes) is automatically refreshed
- 🖥️ Responsive design for desktop, tablet, and mobile
- ⚠️ Handles errors gracefully (e.g., invalid city names)
- 🔄 Refresh button for manual re-fetch
- 🕰 Displays "Last Updated" timestamp

<br>

## 💻 Tech Stack

- **HTML5**
- **CSS3** (with Flexbox + Media Queries)
- **Vanilla JavaScript**
- **OpenWeatherMap API**

<br>

## 🧪 Cross-Browser & Accessibility

- ✅ Tested on Chrome, Firefox, and Edge
- ✅ Mobile and tablet responsiveness verified
- ✅ Achieved **100% Accessibility Score** via Chrome Lighthouse
- ✅ Accessible form inputs, focus states, and color contrast

<br>

## 📦 Setup Instructions

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/weathrly.git
   cd weathrly
   ```

2. Add your [OpenWeatherMap](https://openweathermap.org/api) API key in `script.js`:

   ```js
   const API_KEY = 'your-api-key-here';
   ```

   > ⚠️ This is a static, client-side app, so the key is always visible in
   > the browser's dev tools / page source no matter how it's split across
   > variables — that split is obfuscation, not security. Don't use a key
   > with billing enabled, and see [Known Issues](#-known-issues) below.

3. Open `index.html` in your browser, or serve the folder with any static
   file server.

<br>

## 🚀 Planned Improvements

- 📆 Add multi-day forecast
- 🌐 Add language options (i18n)

<br>

## ✅ Completed

- 📍 Geolocation support
- 🌙 Dark mode toggle

<br>

## ⚠️ Known Issues

- The OpenWeatherMap API key ships in client-side `script.js`. It's split
  into pieces to avoid a plain-text grep match, but that offers no real
  protection — anyone can read it from the browser. Treat it as public,
  avoid a key with billing enabled, and consider proxying requests through
  a small backend for production use.

## 🌐 Live Demo

> 🔗 [Click here to view Weathrly Live](https://infrabeam1927.github.io/weatherly/)

