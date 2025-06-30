
const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');
const errorEl = document.getElementById('error');

// Obfuscated API key (split into parts)
const part1 = 'aa1d1e34e';         // example - use actual parts of your key
const part2 = '51b6f6cb69275';
const part3 = '758a8c8013';
const API_KEY = part1 + part2 + part3;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  // Check localStorage cache
  const cached = localStorage.getItem(city.toLowerCase());
  if (cached) {
    const cachedData = JSON.parse(cached);
    displayWeather(cachedData);
    return;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!res.ok) throw new Error('City not found');
    const data = await res.json();

    // Cache result
    localStorage.setItem(city.toLowerCase(), JSON.stringify(data));
    displayWeather(data);
    errorEl.textContent = '';
  } catch (err) {
    display.innerHTML = '';
    errorEl.textContent = err.message;
  }
});

function displayWeather(data) {
  display.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>${data.weather[0].main} - ${data.weather[0].description}</p>
    <p>🌡️ Temp: ${data.main.temp}°C</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} m/s</p>
  `;
}
