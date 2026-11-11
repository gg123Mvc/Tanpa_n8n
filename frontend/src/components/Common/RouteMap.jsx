import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const RouteMap = ({
  userLat,
  userLon,
  schoolLat,
  schoolLon,
  schoolName = 'MA Bina Cendekia',
  routeGeometry = null,
  isStraightLineOnly = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Pastikan instansi sebelumnya dibersihkan jika ada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Inisialisasi peta Leaflet
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // Tambahkan layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marker Lokasi Pengguna (Pulse circle emerald)
    const userMarkerIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 30px; height: 30px; background: rgba(16, 185, 129, 0.4); border-radius: 50%;"></div>
          <div style="position: relative; width: 14px; height: 14px; background: #047857; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

    // Marker Lokasi Sekolah (Pin icon madrasah)
    const schoolMarkerIcon = L.divIcon({
      className: 'school-location-marker',
      html: `
        <div style="width: 34px; height: 34px; background: #065f46; border: 3px solid #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(6,95,70,0.4); color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    const userMarker = L.marker([userLat, userLon], { icon: userMarkerIcon })
      .addTo(map)
      .bindPopup('<div style="font-weight: 600; font-size: 12px; color: #047857;">Lokasi Anda</div>');

    const schoolMarker = L.marker([schoolLat, schoolLon], { icon: schoolMarkerIcon })
      .addTo(map)
      .bindPopup(`<div style="font-weight: 700; font-size: 12px; color: #065f46;">${schoolName}</div>`);

    let polyline;

    if (routeGeometry && routeGeometry.coordinates && routeGeometry.coordinates.length > 0) {
      // Koordinat GeoJSON OSRM adalah [lon, lat], konversi ke [lat, lon] untuk Leaflet
      const routeLatLngs = routeGeometry.coordinates.map(([lon, lat]) => [lat, lon]);

      // Garis rute utama tercepat (Emerald solid polyline)
      polyline = L.polyline(routeLatLngs, {
        color: '#059669',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [35, 35] });
    } else {
      // Fallback: Garis lurus jika rute jalan tidak tersedia
      polyline = L.polyline(
        [
          [userLat, userLon],
          [schoolLat, schoolLon]
        ],
        {
          color: '#d97706',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.85
        }
      ).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [35, 35] });
    }

    // Refresh ukuran peta setelah animasi render selesai agar tile tidak abu-abu
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLon, schoolLat, schoolLon, schoolName, routeGeometry, isStraightLineOnly]);

  return (
    <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-emerald-100 shadow-inner bg-emerald-50/50">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute bottom-2 right-2 z-20 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] text-gray-500 shadow-xs pointer-events-none">
        OpenStreetMap & OSRM
      </div>
    </div>
  );
};

export default RouteMap;
