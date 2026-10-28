const sqlite3 = require('sqlite3').verbose();

// Создаем/открываем базу данных
const db = new sqlite3.Database('./weather.db');

// Оборачиваем создание таблицы в Promise, чтобы дождаться его завершения
const dbReady = new Promise((resolve, reject) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS weather_cache (
      city TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы:', err);
      reject(err);
    } else {
      console.log('База данных готова, таблица weather_cache существует');
      resolve();
    }
  });
});

module.exports = { db, dbReady };