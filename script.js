const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');
const errorEl = document.getElementById('error');
const lastUpdated = document.getElementById('lastUpdated');
const refreshBtn = document.getElementById('refreshBtn');
const geoBtn = document.getElementById('geoBtn');
const locationBanner = document.getElementById('locationBanner');
const loadingIndicator = document.getElementById('loadingIndicator');
const forecastContainer = document.getElementById('forecastContainer');
const submitBtn = form.querySelector('button[type="submit"]');

function showLocationBanner(text) {
  locationBanner.textContent = text;
  locationBanner.style.display = 'block';
  locationBanner.classList.add('show');
}

function hideLocationBanner() {
  locationBanner.classList.remove('show');
  locationBanner.style.display = 'none';
}

function setLoading(isLoading) {
  loadingIndicator.style.display = isLoading ? 'block' : 'none';
  submitBtn.disabled = isLoading;
  refreshBtn.disabled = isLoading;
  geoBtn.disabled = isLoading;
}

// Cache duration: 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

// Prefix keeps per-city cache entries from colliding with keys like
// 'recentCities' or 'darkMode' if a city is ever named the same.
// Units are folded into the key so switching °C/°F doesn't show data
// cached under the other unit.
const CACHE_PREFIX = 'weather_';
const FORECAST_PREFIX = 'forecast_';
const cacheKey = (city) => `${CACHE_PREFIX}${units}_${city}`;
const forecastCacheKey = (city) => `${FORECAST_PREFIX}${units}_${city}`;

const WEATHER_URL = '/api/weather';
const FORECAST_URL = '/api/forecast';

let units = localStorage.getItem('units') === 'imperial' ? 'imperial' : 'metric';
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

  setLoading(true);
  try {
    if (cachedItem && !forceRefresh) {
      try {
        const parsed = JSON.parse(cachedItem);
        if (now - parsed.timestamp < CACHE_TTL) {
          hideLocationBanner();
          displayWeather(parsed.data);
          showLastUpdated(parsed.timestamp);
          refreshBtn.style.display = 'inline-block';
          await loadForecast(city);
          return;
        } else {
          localStorage.removeItem(key);
        }
      } catch (err) {
        // Corrupt cache entry - drop it and fall through to a fresh fetch.
        localStorage.removeItem(key);
      }
    }

    const res = await fetch(
      `${WEATHER_URL}?city=${encodeURIComponent(city)}&units=${units}`
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
    await loadForecast(city);
  } catch (err) {
    display.innerHTML = '';
    lastUpdated.textContent = '';
    refreshBtn.style.display = 'none';
    forecastContainer.innerHTML = '';
    errorEl.textContent = err.message;
  } finally {
    setLoading(false);
  }
}

async function loadForecast(city) {
  const key = forecastCacheKey(city);
  const cachedItem = localStorage.getItem(key);
  const now = Date.now();

  if (cachedItem) {
    try {
      const parsed = JSON.parse(cachedItem);
      if (now - parsed.timestamp < CACHE_TTL) {
        renderForecast(parsed.data);
        return;
      }
      localStorage.removeItem(key);
    } catch (err) {
      localStorage.removeItem(key);
    }
  }

  try {
    const res = await fetch(
      `${FORECAST_URL}?city=${encodeURIComponent(city)}&units=${units}`
    );
    if (!res.ok) throw new Error('Forecast unavailable');
    const data = await res.json();

    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: now
    }));

    renderForecast(data);
  } catch (err) {
    console.error('Forecast fetch error:', err);
    forecastContainer.innerHTML = '';
  }
}

function renderForecast(data) {
  // The 5-day/3-hour API returns ~40 entries; bucket them by calendar
  // date so we can show one card per day.
  const byDate = {};
  data.list.forEach(entry => {
    const date = entry.dt_txt.split(' ')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(entry);
  });

  const tempUnit = units === 'imperial' ? '°F' : '°C';

  forecastContainer.innerHTML = Object.keys(byDate).slice(0, 5).map(date => {
    const entries = byDate[date];
    const temps = entries.map(e => e.main.temp);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));

    // Use the entry closest to midday as representative of the day.
    const midday = entries.reduce((closest, entry) => {
      const hour = Number(entry.dt_txt.split(' ')[1].split(':')[0]);
      const closestHour = Number(closest.dt_txt.split(' ')[1].split(':')[0]);
      return Math.abs(hour - 12) < Math.abs(closestHour - 12) ? entry : closest;
    });

    const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short' });

    return `
      <div class="forecast-card">
        <p class="forecast-day">${dayName}</p>
        <p class="forecast-icon">${getWeatherEmoji(midday.weather[0].main)}</p>
        <p class="forecast-temp">${max}${tempUnit} / ${min}${tempUnit}</p>
        <p class="forecast-desc">${midday.weather[0].main}</p>
      </div>
    `;
  }).join('');
}

function getWeatherEmoji(condition) {
  const emojis = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Haze: '🌁'
  };
  return emojis[condition] || '🌡️';
}

function displayWeather(data) {
  const tempUnit = units === 'imperial' ? '°F' : '°C';
  const windUnit = units === 'imperial' ? 'mph' : 'm/s';

  display.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>${data.weather[0].main} - ${data.weather[0].description}</p>
    <p>🌡️ Temp: ${data.main.temp}${tempUnit}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} ${windUnit}</p>
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

// 🌡️ Unit Toggle (°C / °F)
const unitToggle = document.getElementById('unitToggle');
unitToggle.checked = units === 'imperial';
unitToggle.addEventListener('change', async () => {
  units = unitToggle.checked ? 'imperial' : 'metric';
  localStorage.setItem('units', units);
  if (currentCity) {
    await loadWeather(currentCity, true);
  }
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

      setLoading(true);
      try {
        const res = await fetch(
          `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=${units}`
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
        if (currentCity) await loadForecast(currentCity);
      } catch (err) {
        console.error('Geolocation weather fetch error:', err);
        errorEl.textContent = "Unable to fetch weather for your location.";
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.warn('Geolocation denied or failed:', error);
    });
  }
});

// 📍 Manual Geolocation Button
geoBtn.addEventListener('click', () => {
  if ('geolocation' in navigator) {
    cityInput.value = "Loading...";

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setLoading(true);
      try {
        const res = await fetch(
          `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=${units}`
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
        if (currentCity) await loadForecast(currentCity);
      } catch (err) {
        console.error('Error fetching weather for location:', err);
        errorEl.textContent = "Unable to fetch weather for your location.";
        cityInput.value = '';
      } finally {
        setLoading(false);
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
