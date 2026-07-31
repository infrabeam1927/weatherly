const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';

module.exports = async function handler(req, res) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ message: 'Server is missing OPENWEATHER_API_KEY' });
    return;
  }

  const { city, lat, lon, units = 'metric' } = req.query;

  if (!city && (lat === undefined || lon === undefined)) {
    res.status(400).json({ message: 'Provide either a city or lat & lon' });
    return;
  }

  const params = new URLSearchParams({ appid: apiKey, units });
  if (city) {
    params.set('q', city);
  } else {
    params.set('lat', lat);
    params.set('lon', lon);
  }

  try {
    const upstream = await fetch(`${OPENWEATHER_URL}?${params.toString()}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ message: 'Failed to reach the weather provider' });
  }
};
