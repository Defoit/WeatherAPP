require('dotenv').config(); // Загружаем переменные из .env
const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const GEO_BASE = 'http://api.openweathermap.org/geo/1.0';
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

// 1. Функция поиска координат (Геокодинг)
async function getCoordinates(cityName) {
  const response = await axios.get(`${GEO_BASE}/direct`, {
    params: {
      q: cityName,
      limit: 1,
      appid: API_KEY,
    },
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('Город не найден');
  }

  const { lat, lon, name, country } = response.data[0];
  return { lat, lon, name, country };
}

// 2. Функция получения погоды по координатам
async function getForecast(lat, lon) {
  // Запрашиваем текущую погоду и прогноз на 5 дней (с шагом 3 часа)
  const [currentRes, forecastRes] = await Promise.all([
    axios.get(`${WEATHER_BASE}/weather`, {
      params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'ru' },
    }),
    axios.get(`${WEATHER_BASE}/forecast`, {
      params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'ru' },
    }),
  ]);

  return {
    current: currentRes.data,
    daily: forecastRes.data,
  };
}

module.exports = { getCoordinates, getForecast };