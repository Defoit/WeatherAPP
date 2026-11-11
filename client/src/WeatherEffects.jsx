import React, { useMemo } from 'react';

function WeatherEffects({ weatherCode }) {
  const type = useMemo(() => {
    if (weatherCode >= 200 && weatherCode < 600) return 'rain';
    if (weatherCode >= 600 && weatherCode < 700) return 'snow';
    return null;
  }, [weatherCode]);

  const particles = useMemo(() => {
    if (!type) return [];
    return Array.from({ length: type === 'rain' ? 50 : 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * (type === 'rain' ? 1 : 3) + (type === 'rain' ? 0.5 : 2)}s`,
      animationDelay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [type]);

  if (!type) return null;

  return (
    <div className={`weather-effects ${type}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${type}`}
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default WeatherEffects;