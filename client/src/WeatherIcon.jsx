import React from 'react';

const WeatherIcon = ({ code, isDay = true, size = 80 }) => {
  const getIconType = (code) => {
    if (code >= 200 && code < 300) return 'thunderstorm';
    if (code >= 300 && code < 500) return 'drizzle';
    if (code >= 500 && code < 600) return 'rain';
    if (code >= 600 && code < 700) return 'snow';
    if (code >= 700 && code < 800) return 'mist';
    if (code === 800) return isDay ? 'clear-day' : 'clear-night';
    if (code > 800 && code < 900) return isDay ? 'clouds-day' : 'clouds-night';
    return 'clear-day';
  };

  const type = getIconType(code);

  const icons = {
    'clear-day': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(255, 213, 0, 0.4))' }}>
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7a1" />
            <stop offset="40%" stopColor="#ffd000" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#sunGlow)" />
        <circle cx="50" cy="50" r="22" fill="#ffd000" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect key={i} x="48" y="12" width="4" height="14" rx="2" fill="#ffd000" transform={`rotate(${angle} 50 50)`} />
        ))}
      </svg>
    ),
    'clear-night': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(129, 140, 248, 0.4))' }}>
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="70%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#moonGlow)" />
        <path d="M55 25 A 25 25 0 1 0 75 50 A 22 22 0 1 1 55 25 Z" fill="#e0e7ff" />
      </svg>
    ),
    'clouds-day': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(255,255,255,0.2))' }}>
        <circle cx="40" cy="35" r="18" fill="#ffd000" />
        <path d="M25 70 Q 25 50 45 50 Q 55 35 75 45 Q 90 50 90 70 Z" fill="#f8fafc" />
      </svg>
    ),
    'clouds-night': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(255,255,255,0.1))' }}>
        <path d="M35 30 A 15 15 0 1 0 50 45 A 12 12 0 1 1 35 30 Z" fill="#e0e7ff" />
        <path d="M25 75 Q 25 55 45 55 Q 55 40 75 50 Q 90 55 90 75 Z" fill="#94a3b8" />
      </svg>
    ),
    'rain': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(56, 189, 248, 0.3))' }}>
        <path d="M20 55 Q 20 35 40 35 Q 55 20 75 30 Q 95 35 95 55 Z" fill="#64748b" />
        <line x1="30" y1="65" x2="25" y2="85" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="65" x2="45" y2="85" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <line x1="70" y1="65" x2="65" y2="85" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    'thunderstorm': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(250, 204, 21, 0.4))' }}>
        <path d="M20 50 Q 20 30 40 30 Q 55 15 75 25 Q 95 30 95 50 Z" fill="#475569" />
        <path d="M50 55 L 40 75 L 50 75 L 45 95 L 65 70 L 55 70 L 60 55 Z" fill="#facc15" />
      </svg>
    ),
    'snow': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(255,255,255,0.2))' }}>
        <path d="M20 50 Q 20 30 40 30 Q 55 15 75 25 Q 95 30 95 50 Z" fill="#cbd5e1" />
        <circle cx="35" cy="70" r="4" fill="#fff" />
        <circle cx="50" cy="85" r="4" fill="#fff" />
        <circle cx="65" cy="70" r="4" fill="#fff" />
      </svg>
    ),
    'mist': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 10px 15px rgba(255,255,255,0.1))' }}>
        <line x1="20" y1="40" x2="80" y2="40" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
        <line x1="30" y1="60" x2="70" y2="60" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
        <line x1="20" y1="80" x2="80" y2="80" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
      </svg>
    )
  };

  return icons[type] || icons['clouds-day'];
};

export default WeatherIcon;