import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Исправление для стандартных иконок Leaflet в React (часто ломаются из-за путей)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapPicker({ onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Инициализация карты, если она еще не создана
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([55.75, 37.62], 10); // Центр на Москве

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_4x5u_1_2eb862526fc351e2e6d0b00c', {
        attribution: '© OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Обработчик клика по карте
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Ставим маркер в место клика
        L.marker([lat, lng]).addTo(map);
        
        // Вызываем колбэк из родительского компонента
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      });

      mapInstanceRef.current = map;
    }

    // Очистка при размонтировании компонента
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onLocationSelect]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '250px', width: '100%', borderRadius: '16px', zIndex: 0 }} 
    />
  );
}

export default MapPicker;