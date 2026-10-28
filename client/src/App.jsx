import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Что-то пошло не так')
      }

      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>🌤️ Погода</h1>

      <form onSubmit={fetchWeather}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Введите город (например, Москва)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Узнать погоду'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {data && (
        <div className="weather-info">
          <h2>
            {data.location.name}, {data.location.country}
          </h2>

          <div className="current">
            <p className="temp">
              {Math.round(data.current.main.temp)}°C
            </p>
            <p>
              Ощущается как {Math.round(data.current.main.feels_like)}°C
            </p>
            <p>Влажность: {data.current.main.humidity}%</p>
            <p>Ветер: {data.current.wind.speed} м/с</p>
          </div>

          <h3>Прогноз на несколько дней</h3>
          <div className="forecast">
            {/* OpenWeatherMap отдаёт прогноз с шагом 3 часа, группируем по дням */}
            {data.daily.list.filter((item, index) => index % 8 === 0).map((item, i) => (
              <div key={i} className="day">
                <p>
                  {new Date(item.dt * 1000).toLocaleDateString('ru-RU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p>{Math.round(item.main.temp)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App