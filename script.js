const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');
const errorEl = document.getElementById('error');
const lastUpdated = document.getElementById('lastUpdated');
const refreshBtn = document.getElementById('refreshBtn');

// Obfuscated API key
const part1 = 'aa1d1e34e';         // example - use actual parts of your key
const part2 = '51b6f6cb69275';
const part3 = '758a8c8013';
const API_KEY = part1 + part2 + part3;

// Cache duration: 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

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
  const cachedItem = localStorage.getItem(city);
  const now = Date.now();

  if (cachedItem && !forceRefresh) {
    const parsed = JSON.parse(cachedItem);
    if (now - parsed.timestamp < CACHE_TTL) {
      displayWeather(parsed.data);
      showLastUpdated(parsed.timestamp);
      refreshBtn.style.display = 'inline-block';
      return;
    } else {
      localStorage.removeItem(city);
    }
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();

    localStorage.setItem(city, JSON.stringify({
      data: data,
      timestamp: now
    }));

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
  `;
}

function showLastUpdated(timestamp) {
  const date = new Date(timestamp);
  lastUpdated.textContent = `Last updated: ${date.toLocaleTimeString()}`;
}
const darkToggle = document.getElementById('darkModeToggle');

// Apply previously saved mode
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkToggle.checked = true;
}

// Toggle dark mode and save preference
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});
