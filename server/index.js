const express = require('express');
const cors = require('cors');
const weatherService = require('./services/weather');
const { db, dbReady } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. ПОИСК ПО НАЗВАНИЮ ГОРОДА
// ==========================================
app.get('/api/weather', (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'Укажите город' });

  const normalizedCity = city.toLowerCase();

  db.get(
    "SELECT * FROM weather_cache WHERE city_key = ? AND cached_at > datetime('now', '-1 hour')",
    [normalizedCity],
    async (err, row) => {
      if (err) {
        console.error('Ошибка БД:', err);
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }

      if (row) {
        console.log(`[КЭШ] Отдаем данные для ${city} из базы`);
        return res.json(JSON.parse(row.data));
      }

      console.log(`[API] Запрашиваем свежие данные для ${city}`);
      try {
        const location = await weatherService.getCoordinates(city);
        const weatherData = await weatherService.getForecast(location.lat, location.lon);

        const responseData = {
          location: { name: location.name, country: location.country },
          current: weatherData.current,
          daily: weatherData.daily,
        };

        // Сохраняем в кэш
        db.run(
          "INSERT OR REPLACE INTO weather_cache (city_key, data, cached_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
          [normalizedCity, JSON.stringify(responseData)]
        );

        // Сохраняем в историю
        db.run(
          "INSERT INTO search_history (display_name, lat, lon) VALUES (?, ?, ?)",
          [`${location.name}, ${location.country}`, location.lat, location.lon]
        );

        res.json(responseData);
      } catch (apiError) {
        console.error('Ошибка API:', apiError.message);
        res.status(500).json({ error: apiError.message || 'Ошибка сервера' });
      }
    }
  );
});

// ==========================================
// 2. ПОИСК ПО КООРДИНАТАМ (КАРТА)
// ==========================================
app.get('/api/weather/coords', (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Укажите координаты' });

  const cacheKey = `coords_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;

  db.get(
    "SELECT * FROM weather_cache WHERE city_key = ? AND cached_at > datetime('now', '-1 hour')",
    [cacheKey],
    async (err, row) => {
      if (err) {
        console.error('Ошибка БД:', err);
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }

      if (row) {
        console.log(`[КЭШ] Отдаем данные для координат ${lat}, ${lon}`);
        return res.json(JSON.parse(row.data));
      }

      console.log(`[API] Запрашиваем свежие данные для ${lat}, ${lon}`);
      try {
        const weatherData = await weatherService.getForecast(parseFloat(lat), parseFloat(lon));
        const locationName = await weatherService.getLocationName(parseFloat(lat), parseFloat(lon));
        
        const responseData = {
          location: { 
            name: locationName.name, 
            country: locationName.country || `${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}` 
          },
          current: weatherData.current,
          daily: weatherData.daily,
        };

        // Сохраняем в кэш
        db.run(
          "INSERT OR REPLACE INTO weather_cache (city_key, data, cached_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
          [cacheKey, JSON.stringify(responseData)]
        );

        // Сохраняем в историю
        db.run(
          "INSERT INTO search_history (display_name, lat, lon) VALUES (?, ?, ?)",
          [`${locationName.name}, ${locationName.country}`, lat, lon]
        );

        res.json(responseData);
      } catch (apiError) {
        console.error('Ошибка API:', apiError.message);
        res.status(500).json({ error: apiError.message || 'Ошибка сервера' });
      }
    }
  );
});

// ==========================================
// 3. ИСТОРИЯ ПОИСКА
// ==========================================
app.get('/api/history', (req, res) => {
  db.all("SELECT * FROM search_history ORDER BY searched_at DESC LIMIT 5", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/history', (req, res) => {
  db.run("DELETE FROM search_history", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Запуск сервера
dbReady.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Не удалось запустить сервер из-за ошибки БД:', err);
});