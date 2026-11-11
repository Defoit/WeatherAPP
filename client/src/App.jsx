import { useState, useEffect, useRef } from 'react'
import './App.css'
import WeatherIcon from './WeatherIcon'
import MapPicker from './MapPicker'
import WeatherEffects from './WeatherEffects'

function App() {
  const [city, setCity] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [showMap, setShowMap] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  
  const searchWrapperRef = useRef(null)

  // Загрузка истории поиска
  const loadHistory = () => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setHistory(data) })
      .catch(err => console.error('Ошибка загрузки истории:', err))
  }

  useEffect(() => { loadHistory() }, [])

  // Закрытие выпадающего списка истории по клику вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowHistory(false)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearHistory = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/history', { method: 'DELETE' })
      setHistory([])
      setShowHistory(false)
    } catch (err) { console.error(err) }
  }

  // Поиск по названию
  const fetchWeather = async (e) => {
    if (e) e.preventDefault()
    if (!city.trim()) return
    setLoading(true); setError(''); setData(null); setShowHistory(false)
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Город не найден')
      setData(result); setShowMap(false); loadHistory()
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // Поиск по координатам (карта или геолокация)
  const fetchWeatherByCoords = async (lat, lon, isHistory = false) => {
    setLoading(true); setError(''); setData(null); setShowHistory(false)
    try {
      const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Ошибка при получении погоды')
      setData(result); setShowMap(false)
      if (!isHistory) loadHistory()
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // Клик по истории
  const handleHistoryClick = (item) => {
    setShowHistory(false)
    if (item.lat && item.lon) {
      fetchWeatherByCoords(item.lat, item.lon, true)
    } else {
      setCity(item.display_name)
      setTimeout(() => document.getElementById('search-btn')?.click(), 100)
    }
  }

  // Определение геолокации
  const handleGeolocation = () => {
    if (!navigator.geolocation) return setError('Геолокация не поддерживается')
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { setLoading(false); setError('Не удалось получить местоположение') },
      { timeout: 10000 }
    )
  }

  // --- УМНЫЙ ФОН (ДЕНЬ/НОЧЬ + ПОГОДА) ---
  const getBackgroundClass = () => {
    if (!data) return 'bg-default';
    
    const code = data.current.weather[0].id;
    const isDay = data.current.weather[0].icon.includes('d');
    const timeSuffix = isDay ? 'day' : 'night';

    if (code >= 200 && code < 600) return `bg-rain-${timeSuffix}`; // Дождь/Гроза
    if (code >= 600 && code < 700) return `bg-snow-${timeSuffix}`; // Снег
    if (code > 800) return `bg-clouds-${timeSuffix}`;             // Облачно
    return `bg-clear-${timeSuffix}`;                              // Ясно
  }

  return (
    <div className={`app ${getBackgroundClass()}`}>
      {data && <WeatherEffects weatherCode={data.current.weather[0].id} />}

      <div className="glass-container">
        
        <header className="header">
          <div>
            <h1>Погода</h1>
            <p>Узнайте прогноз в любом городе мира</p>
          </div>
        </header>

        <div className="desktop-grid">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="controls-panel">
            <div className="toggle-group">
              <button className={`toggle-btn ${!showMap ? 'active' : ''}`} onClick={() => setShowMap(false)}>По названию</button>
              <button className={`toggle-btn ${showMap ? 'active' : ''}`} onClick={() => setShowMap(true)}>На карте</button>
            </div>

            {showMap ? (
              <div className="map-container">
                <p className="map-hint">Кликните на карту</p>
                <MapPicker onLocationSelect={fetchWeatherByCoords} />
              </div>
            ) : (
              <form onSubmit={fetchWeather} className="search-form">
                <div className="search-input-wrapper" ref={searchWrapperRef}>
                  <input
                    type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    onFocus={() => setShowHistory(true)} placeholder="Введите город..."
                  />
                  {showHistory && history.length > 0 && (
                    <div className="history-dropdown">
                      <div className="history-header">
                        <span>Недавние</span>
                        <button onClick={clearHistory}>Очистить</button>
                      </div>
                      {history.map((item, i) => (
                        <div key={i} className="history-item" onClick={() => handleHistoryClick(item)}>
                          <span>{item.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="geo-btn" onClick={handleGeolocation} title="Моё местоположение">📍</button>
                <button id="search-btn" type="submit" disabled={loading}>{loading ? '...' : 'Поиск'}</button>
              </form>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="weather-panel">
            {error && <div className="error-message">{error}</div>}
            
            {data ? (
              <div className="current-weather">
                <div className="location">
                  <h2>{data.location.name}</h2>
                  <span>{data.location.country}</span>
                </div>
                <div className="main-temp">
                  <div className="icon-wrapper">
                    <WeatherIcon code={data.current.weather[0].id} isDay={data.current.weather[0].icon.includes('d')} size={150} />
                  </div>
                  <div className="temp-text">
                    <span className="temp-value">{Math.round(data.current.main.temp)}°</span>
                    <span className="description">
                      {data.current.weather[0].description.charAt(0).toUpperCase() + data.current.weather[0].description.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="details">
                  <div className="detail-item"><span className="label">Ощущается</span><span className="value">{Math.round(data.current.main.feels_like)}°</span></div>
                  <div className="detail-item"><span className="label">Влажность</span><span className="value">{data.current.main.humidity}%</span></div>
                  <div className="detail-item"><span className="label">Ветер</span><span className="value">{data.current.wind.speed} м/с</span></div>
                </div>
              </div>
            ) : (
               <div className="current-weather" style={{ opacity: 0.5 }}>
                  <h2>Здесь появится погода</h2>
                  <p style={{ marginTop: '10px' }}>Введите город или кликните на карту</p>
               </div>
            )}
          </div>

          {/* НИЖНЯЯ ПАНЕЛЬ (Прогноз) */}
          {data && (
            <div className="forecast-section">
              <h3>Прогноз на 5 дней</h3>
              <div className="forecast-list">
                {data.daily.list.filter((_, index) => index % 8 === 0).map((item, i) => (
                  <div key={i} className="forecast-card">
                    <p className="date">{new Date(item.dt * 1000).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}</p>
                    <WeatherIcon code={item.weather[0].id} isDay={item.weather[0].icon.includes('d')} size={50} />
                    <p className="forecast-temp">{Math.round(item.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App