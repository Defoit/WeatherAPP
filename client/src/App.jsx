import { useState } from 'react'
import './App.css'
import WeatherIcon from './WeatherIcon'
import MapPicker from './MapPicker' // Импортируем карту

function App() {
  const [city, setCity] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Новое состояние: показывать карту или нет
  const [showMap, setShowMap] = useState(false)

  // Функция для поиска по названию города
  const fetchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Город не найден')

      setData(result)
      setShowMap(false) // Прячем карту, если искали по городу
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Новая функция: поиск по координатам, полученным с карты
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Ошибка при получении погоды')

      setData(result)
      setShowMap(false) // Прячем карту после выбора точки
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getBackgroundClass = () => {
    if (!data) return 'bg-default';
    const isDay = data.current.weather[0].icon.includes('d');
    return isDay ? 'bg-day' : 'bg-night';
  }

  return (
    <div className={`app ${getBackgroundClass()}`}>
      <div className="glass-container">
        <header className="header">
          <h1>Погода</h1>
          <p>Узнайте прогноз в любом городе мира</p>
        </header>

        {/* Переключатель между поиском и картой */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            className={`toggle-btn ${!showMap ? 'active' : ''}`} 
            onClick={() => setShowMap(false)}
          >
            По названию
          </button>
          <button 
            className={`toggle-btn ${showMap ? 'active' : ''}`} 
            onClick={() => setShowMap(true)}
          >
            На карте
          </button>
        </div>

        {/* Условный рендеринг: либо форма, либо карта */}
        {showMap ? (
          <div style={{ marginBottom: '30px' }}>
            <p style={{ textAlign: 'center', marginBottom: '10px', opacity: 0.8 }}>
              Кликните на карту, чтобы узнать погоду в этой точке
            </p>
            <MapPicker onLocationSelect={fetchWeatherByCoords} />
          </div>
        ) : (
          <form onSubmit={fetchWeather} className="search-form">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Введите город..."
            />
            <button type="submit" disabled={loading}>
              {loading ? '...' : 'Поиск'}
            </button>
          </form>
        )}

        {error && <div className="error-message">{error}</div>}
        {loading && showMap && <p style={{ textAlign: 'center' }}>Загрузка погоды...</p>}

        {/* Блок с результатами (остается без изменений) */}
        {data && (
          <div className="weather-content">
            <div className="current-weather">
              <div className="location">
                <h2>{data.location.name}</h2>
                <span>{data.location.country}</span>
              </div>
              
              <div className="main-temp">
                <div className="icon-wrapper">
                  <WeatherIcon 
                    code={data.current.weather[0].id} 
                    isDay={data.current.weather[0].icon.includes('d')} 
                    size={140} 
                  />
                </div>
                <div className="temp-text">
                  <span className="temp-value">{Math.round(data.current.main.temp)}°</span>
                  <span className="description">
                    {data.current.weather[0].description.charAt(0).toUpperCase() + data.current.weather[0].description.slice(1)}
                  </span>
                </div>
              </div>

              <div className="details">
                <div className="detail-item">
                  <span className="label">Ощущается</span>
                  <span className="value">{Math.round(data.current.main.feels_like)}°</span>
                </div>
                <div className="detail-item">
                  <span className="label">Влажность</span>
                  <span className="value">{data.current.main.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ветер</span>
                  <span className="value">{data.current.wind.speed} м/с</span>
                </div>
              </div>
            </div>

            <div className="forecast-section">
              <h3>Прогноз на 5 дней</h3>
              <div className="forecast-list">
                {data.daily.list.filter((_, index) => index % 8 === 0).map((item, i) => (
                  <div key={i} className="forecast-card">
                    <p className="date">
                      {new Date(item.dt * 1000).toLocaleDateString('ru-RU', {
                        weekday: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <WeatherIcon 
                      code={item.weather[0].id} 
                      isDay={item.weather[0].icon.includes('d')} 
                      size={45} 
                    />
                    <p className="forecast-temp">{Math.round(item.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App