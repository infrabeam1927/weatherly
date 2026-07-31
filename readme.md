# 🌦️ Weathrly – Weather Dashboard Web App

Weathrly is a responsive and accessible weather dashboard built using **Vanilla JavaScript**, **HTML/CSS**, and the **OpenWeatherMap API**, deployed on **Vercel**. It fetches real-time weather data through a small serverless proxy, displays it dynamically, and caches it locally for a faster and more reliable experience.

<br>

## 🔧 Features

- 🔍 Search weather by city name
- 📡 Fetches real-time weather from OpenWeatherMap
- 📆 5-day forecast
- 🌡️ °C / °F unit toggle
- ⏳ Loading indicator while a request is in flight
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
- **Vercel Serverless Functions** (`/api/weather`, `/api/forecast`) proxying the OpenWeatherMap API

<br>

## 🧪 Cross-Browser & Accessibility

- ✅ Tested on Chrome, Firefox, and Edge
- ✅ Mobile and tablet responsiveness verified
- ✅ Achieved **100% Accessibility Score** via Chrome Lighthouse
- ✅ Accessible form inputs, focus states, and color contrast

<br>

## 📦 Setup Instructions

Weather requests go through two Vercel serverless functions (`/api/weather`,
`/api/forecast`) that hold the OpenWeatherMap key server-side, so you need
the [Vercel CLI](https://vercel.com/docs/cli) to run the app locally with
those functions available.

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/weathrly.git
   cd weathrly
   ```

2. Install the Vercel CLI if you don't already have it:

   ```bash
   npm install -g vercel
   ```

3. Get an API key from [OpenWeatherMap](https://openweathermap.org/api) and
   set it as a local environment variable:

   ```bash
   vercel env add OPENWEATHER_API_KEY development
   ```

   (When deploying, set the same variable under Project Settings →
   Environment Variables in the Vercel dashboard.)

4. Run the app locally, which serves the static files and the `/api`
   functions together:

   ```bash
   vercel dev
   ```

<br>

## 🚀 Planned Improvements

- 🌐 Add language options (i18n)

<br>

## ✅ Completed

- 📍 Geolocation support
- 🌙 Dark mode toggle
- 📆 Multi-day forecast
- 🌡️ °C / °F unit toggle
- 🔐 OpenWeatherMap key moved server-side behind Vercel functions

## 🌐 Live Demo

> This app now depends on the `/api/weather` and `/api/forecast` serverless
> functions, so it needs to be deployed on Vercel (with `OPENWEATHER_API_KEY`
> set in the project's environment variables) rather than served as static
> files — the previous GitHub Pages link will no longer return live weather
> data. Deploy your own copy from the [Vercel dashboard](https://vercel.com/new)
> by importing this repository.

