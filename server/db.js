const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./weather.db');

const dbReady = new Promise((resolve, reject) => {
  db.serialize(() => {
    // 1. Таблица для кэша погоды (используем city_key для всех типов запросов)
    db.run(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        city_key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Таблица для истории поиска
    db.run(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        display_name TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ База данных готова (кэш + история)');
        resolve();
      }
    });
  });
});

module.exports = { db, dbReady };