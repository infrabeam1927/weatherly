const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');
const errorEl = document.getElementById('error');
const lastUpdated = document.getElementById('lastUpdated');
const refreshBtn = document.getElementById('refreshBtn');
const locationBanner = document.getElementById('locationBanner');

function showLocationBanner(text) {
  locationBanner.textContent = text;
  locationBanner.style.display = 'block';
  locationBanner.classList.add('show');
}

function hideLocationBanner() {
  locationBanner.classList.remove('show');
  locationBanner.style.display = 'none';
}

// Obfuscated API key
const part1 = 'aa1d1e34e';         // example - use actual parts of your key
const part2 = '51b6f6cb69275';
const part3 = '758a8c8013';
const API_KEY = part1 + part2 + part3;

// Cache duration: 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

// Prefix keeps per-city cache entries from colliding with keys like
// 'recentCities' or 'darkMode' if a city is ever named the same.
const CACHE_PREFIX = 'weather_';
const cacheKey = (city) => CACHE_PREFIX + city;

let currentCity = '';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim().toLowerCase();
  if (!city) return;

  currentCity = city;
  await loadWeather(city);
});

refreshBtn.addEventListener('click', async () => {
  if (currentCity) {
    await loadWeather(currentCity, true); // force refresh
  }
});

async function loadWeather(city, forceRefresh = false) {
  const key = cacheKey(city);
  const cachedItem = localStorage.getItem(key);
  const now = Date.now();

  if (cachedItem && !forceRefresh) {
    try {
      const parsed = JSON.parse(cachedItem);
      if (now - parsed.timestamp < CACHE_TTL) {
        hideLocationBanner();
        displayWeather(parsed.data);
        showLastUpdated(parsed.timestamp);
        refreshBtn.style.display = 'inline-block';
        return;
      } else {
        localStorage.removeItem(key);
      }
    } catch (err) {
      // Corrupt cache entry - drop it and fall through to a fresh fetch.
      localStorage.removeItem(key);
    }
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();

    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: now
    }));

    hideLocationBanner();
    displayWeather(data);
    showLastUpdated(now);
    errorEl.textContent = '';
    refreshBtn.style.display = 'inline-block';
  } catch (err) {
    display.innerHTML = '';
    lastUpdated.textContent = '';
    refreshBtn.style.display = 'none';
    errorEl.textContent = err.message;
  }
}

function displayWeather(data) {
  display.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>${data.weather[0].main} - ${data.weather[0].description}</p>
    <p>🌡️ Temp: ${data.main.temp}°C</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} m/s</p>
    <div class="suggestion">${getWeatherTip(data.weather[0].main)}</div>
  `;

  if (data.name) {
    updateRecentCities(data.name);
  }

  // Update background based on condition
  setWeatherBackground(data.weather[0].main);
}


function setWeatherBackground(condition) {
  const body = document.body;
  body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'default-weather');

  switch (condition.toLowerCase()) {
    case 'clear':
      body.classList.add('sunny');
      break;
    case 'clouds':
      body.classList.add('cloudy');
      break;
    case 'rain':
    case 'drizzle':
      body.classList.add('rainy');
      break;
    case 'snow':
      body.classList.add('snowy');
      break;
    default:
      body.classList.add('default-weather');
  }
}

function showLastUpdated(timestamp) {
  const date = new Date(timestamp);
  lastUpdated.textContent = `Last updated: ${date.toLocaleTimeString()}`;
}

// 🌙 Dark Mode Toggle
const darkToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkToggle.checked = true;
}
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

// 🔁 Persistent Search History
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
const historyList = document.getElementById("historyList");

function updateRecentCities(city) {
  city = city.trim();
  recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
  recentCities.unshift(city);
  if (recentCities.length > 5) recentCities.pop();
  localStorage.setItem('recentCities', JSON.stringify(recentCities));
  renderCityHistory();
}

function renderCityHistory() {
  historyList.innerHTML = '';
  recentCities.forEach(city => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.addEventListener('click', async () => {
      cityInput.value = city;
      currentCity = city.toLowerCase();
      await loadWeather(currentCity);
    });
    li.appendChild(btn);
    historyList.appendChild(li);
  });
}

// 🗺️ Auto-fetch on page load
window.addEventListener('load', () => {
  renderCityHistory();

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Location weather lookup failed');
        const data = await res.json();

        if (data.name) {
          currentCity = data.name.toLowerCase();
          localStorage.setItem(cacheKey(currentCity), JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }

        showLocationBanner('Showing weather for your current location');
        displayWeather(data);
        showLastUpdated(Date.now());
        refreshBtn.style.display = 'inline-block';
      } catch (err) {
        console.error('Geolocation weather fetch error:', err);
        errorEl.textContent = "Unable to fetch weather for your location.";
      }
    }, (error) => {
      console.warn('Geolocation denied or failed:', error);
    });
  }
});

// 📍 Manual Geolocation Button
const geoBtn = document.getElementById('geoBtn');

geoBtn.addEventListener('click', () => {
  if ('geolocation' in navigator) {
    cityInput.value = "Loading...";

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Location weather lookup failed');
        const data = await res.json();

        if (data.name) {
          cityInput.value = data.name;
          currentCity = data.name.toLowerCase();
          localStorage.setItem(cacheKey(currentCity), JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } else {
          cityInput.value = '';
        }

        showLocationBanner('Showing weather for your current location');
        displayWeather(data);
        showLastUpdated(Date.now());
        refreshBtn.style.display = 'inline-block';
        errorEl.textContent = '';
      } catch (err) {
        console.error('Error fetching weather for location:', err);
        errorEl.textContent = "Unable to fetch weather for your location.";
        cityInput.value = '';
      }
    }, (error) => {
      console.warn('Geolocation failed or denied:', error);
      errorEl.textContent = "Geolocation is not enabled or failed.";
      cityInput.value = '';
    });
  } else {
    errorEl.textContent = "Geolocation is not supported in your browser.";
  }
});
function getWeatherTip(condition) {
  const tips = {
    Rain: "☔ Don’t forget your umbrella!",
    Drizzle: "☔ Light rain – maybe grab a jacket.",
    Thunderstorm: "⛈️ Stay indoors if possible!",
    Snow: "❄️ Bundle up, it’s snowing!",
    Clear: "🌞 Enjoy the sunshine!",
    Clouds: "⛅ Might be a bit gloomy.",
    Mist: "🌫️ Drive safe, visibility is low.",
    Haze: "🌁 Air is a bit hazy, take it easy."
  };

  return tips[condition] || '';
}
