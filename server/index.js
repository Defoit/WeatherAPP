const express = require('express');
const cors = require('cors');
const weatherService = require('./services/weather');
const { db, dbReady } = require('./db'); // Импортируем и db, и dbReady

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/weather', (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'Укажите город' });

  const normalizedCity = city.toLowerCase();

  // 1. Проверяем кэш в базе данных
  db.get(
    "SELECT * FROM weather_cache WHERE city = ? AND cached_at > datetime('now', '-1 day')",
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

      // 2. Если данных нет — идем в OpenWeatherMap
      console.log(`[API] Запрашиваем свежие данные для ${city}`);
      try {
        const location = await weatherService.getCoordinates(city);
        const weatherData = await weatherService.getForecast(location.lat, location.lon);

        const responseData = {
          location: { name: location.name, country: location.country },
          current: weatherData.current,
          daily: weatherData.daily,
        };

        // 3. Сохраняем результат в базу
        db.run(
          "INSERT OR REPLACE INTO weather_cache (city, data, cached_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
          [normalizedCity, JSON.stringify(responseData)],
          (saveErr) => {
            if (saveErr) console.error('Ошибка сохранения в кэш:', saveErr);
          }
        );

        // 4. Отдаем пользователю
        res.json(responseData);

      } catch (apiError) {
        console.error('Ошибка API:', apiError.message);
        res.status(500).json({ error: apiError.message || 'Ошибка сервера' });
      }
    }
  );
});

// Запускаем сервер ТОЛЬКО после того, как база данных готова
dbReady.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Не удалось запустить сервер из-за ошибки БД:', err);
});
// Новый эндпоинт для получения погоды по координатам
app.get('/api/weather/coords', (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Укажите координаты' });

  // Создаем ключ для кэша на основе координат (округляем, чтобы избежать лишних записей)
  const cacheKey = `coords_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;

  // Проверяем кэш
  db.get(
    "SELECT * FROM weather_cache WHERE city = ? AND cached_at > datetime('now', '-1 day')",
    [cacheKey],
    async (err, row) => {
      if (err) return res.status(500).json({ error: 'Ошибка БД' });

      if (row) {
        console.log(`[КЭШ] Отдаем данные для координат ${lat}, ${lon} из базы`);
        return res.json(JSON.parse(row.data));
      }

      console.log(`[API] Запрашиваем свежие данные для координат ${lat}, ${lon}`);
      try {
        const weatherData = await weatherService.getForecast(parseFloat(lat), parseFloat(lon));
        
        // OpenWeatherMap по координатам не возвращает название города так же, как при поиске по имени.
        // Мы можем попробовать получить его через обратное геокодирование, но для простоты оставим "Выбранная точка".
        const responseData = {
          location: { name: 'Выбранная точка', country: `${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}` },
          current: weatherData.current,
          daily: weatherData.daily,
        };

        // Сохраняем в кэш
        db.run(
          "INSERT OR REPLACE INTO weather_cache (city, data, cached_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
          [cacheKey, JSON.stringify(responseData)]
        );

        res.json(responseData);
      } catch (apiError) {
        res.status(500).json({ error: apiError.message });
      }
    }
  );
});