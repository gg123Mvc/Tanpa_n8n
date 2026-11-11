import { aiAgentAPI } from './api.js';

// Koordinat resmi sekolah MA Bina Cendekia dari environment variable atau konfigurasi proyek
export const SCHOOL_CONFIG = {
  name: import.meta.env?.VITE_SCHOOL_NAME || 'MA Bina Cendekia',
  address: import.meta.env?.VITE_SCHOOL_ADDRESS || 'Jl. Raya Madrasah No. 123, Jawa Barat',
  lat: parseFloat(import.meta.env?.VITE_SCHOOL_LAT) || -6.8133266,
  lon: parseFloat(import.meta.env?.VITE_SCHOOL_LON) || 108.6177609
};

/**
 * Hitung jarak garis lurus menggunakan formula Haversine (hanya sebagai estimasi pelengkap)
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Format durasi detik ke bentuk teks yang mudah dipahami
 */
export const formatDuration = (seconds) => {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return 'Kurang dari 1 menit';
  if (totalMinutes < 60) return `${totalMinutes} menit`;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  return remainingMins > 0 ? `${hours} jam ${remainingMins} menit` : `${hours} jam`;
};

/**
 * Panggil layanan routing OSRM langsung dari browser (digunakan sebagai fallback atau saat di GitHub Pages)
 */
const fetchDirectOSRMRoute = async (userLat, userLon) => {
  const endpoints = [
    `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${SCHOOL_CONFIG.lon},${SCHOOL_CONFIG.lat}?overview=full&geometries=geojson&alternatives=true`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${userLon},${userLat};${SCHOOL_CONFIG.lon},${SCHOOL_CONFIG.lat}?overview=full&geometries=geojson&alternatives=true`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
        // Urutkan rute berdasarkan durasi tercepat
        const sorted = [...data.routes].sort((a, b) => a.duration - b.duration);
        const fastest = sorted[0];

        const alternatives = sorted.slice(1).map((alt) => ({
          distanceKm: parseFloat((alt.distance / 1000).toFixed(1)),
          durationMinutes: Math.round(alt.duration / 60),
          durationFormatted: formatDuration(alt.duration)
        }));

        return {
          type: 'Rute Tercepat',
          profile: 'driving',
          distanceKm: parseFloat((fastest.distance / 1000).toFixed(1)),
          distanceMeters: Math.round(fastest.distance),
          durationMinutes: Math.round(fastest.duration / 60),
          durationFormatted: formatDuration(fastest.duration),
          geometry: fastest.geometry || null,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${SCHOOL_CONFIG.lat},${SCHOOL_CONFIG.lon}`,
          alternatives
        };
      }
    } catch (err) {
      console.warn('Direct OSRM fetch error:', err.message);
    }
  }

  return null;
};

/**
 * Fungsi utama untuk menghitung rute perjalanan:
 * 1. Prioritaskan endpoint backend Node.js (/api/ai-agent/calculate-distance)
 * 2. Jika backend gagal atau rute kosong, otomatis fallback ke OSRM browser
 * 3. Jika rute jalan tidak dapat dihitung, sediakan estimasi garis lurus dengan penandaan jelas
 */
export const calculateRouteAndDistance = async (userLat, userLon, accuracy) => {
  const straightLineKm = calculateHaversineDistance(
    userLat,
    userLon,
    SCHOOL_CONFIG.lat,
    SCHOOL_CONFIG.lon
  );

  let routeData = null;
  let backendError = null;

  // 1. Coba lewat backend API terlebih dahulu
  try {
    const response = await aiAgentAPI.calculateDistance(userLat, userLon, accuracy);
    if (response.data?.success && response.data?.data) {
      const serverData = response.data.data;
      if (serverData.route) {
        return {
          route: serverData.route,
          straightLineKm: serverData.straightLineKm ?? straightLineKm,
          school: serverData.school || SCHOOL_CONFIG,
          accuracy: accuracy || serverData.accuracy || null,
          source: 'backend'
        };
      }
    }
  } catch (err) {
    backendError = err;
    console.warn('Backend distance API failed, attempting direct OSRM fallback:', err.message);
  }

  // 2. Fallback: panggil OSRM langsung dari browser (Kompatibel GitHub Pages & server offline)
  try {
    routeData = await fetchDirectOSRMRoute(userLat, userLon);
  } catch (err) {
    console.error('All routing providers failed:', err);
  }

  return {
    route: routeData, // Akan bernilai null jika seluruh layanan routing jalan gagal
    straightLineKm,
    school: SCHOOL_CONFIG,
    accuracy: accuracy || null,
    source: routeData ? 'direct_osrm' : 'fallback_straight_line',
    backendError: backendError?.message || null
  };
};
