import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';
import axios from 'axios';

// Send Message to AI Agent (100% diproses n8n, tanpa koneksi ke database)
export const sendMessageToAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return errorResponse(res, 'Pesan tidak boleh kosong', ERROR_CODES.VALIDATION_ERROR);
    }

    const startTime = Date.now();

    // Proses pesan chat sepenuhnya melalui webhook n8n
    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      process.env.VITE_N8N_WEBHOOK_URL ||
      'https://sekolahku-sekolahku.t4t2am.easypanel.host/webhook/470d12f5-4c3d-4234-b5bd-7a13e88779f5/chat';

    const aiResponse = await callN8nChatWebhook(message, history, n8nWebhookUrl);

    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    successResponse(res, {
      user_message: message,
      ai_response: aiResponse,
      timestamp: new Date(),
      response_time_ms: responseTimeMs
    }, 'Pesan berhasil dikirim');

  } catch (error) {
    console.error('AI Agent Error:', error);
    const status = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || error.message || 'Gagal memproses pesan';
    errorResponse(res, `Gagal memproses pesan (Status ${status}): ${errorMessage}`, ERROR_CODES.INTERNAL_ERROR);
  }
};

// Call n8n Chat Webhook
const callN8nChatWebhook = async (message, history = [], webhookUrl) => {
  try {
    const payload = {
      action: "sendMessage",
      chatInput: message,
      message: message,
      history: history
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    let data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data?.output) {
      return typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
    }
    if (data?.text) {
      return typeof data.text === 'string' ? data.text : JSON.stringify(data.text);
    }
    if (data?.message) {
      return typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
    }
    if (data?.response) {
      return typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
    }

    return JSON.stringify(data);
  } catch (err) {
    console.error('Gagal memanggil webhook n8n:', err.message);
    throw new Error(`Gagal menghubungi webhook n8n: ${err.message}`);
  }
};

// Get Chat History (Tidak menggunakan database)
export const getChatHistory = async (req, res) => {
  return successResponse(res, [], 'Chat history tidak disimpan di database');
};

// Clear Chat History (Tidak menggunakan database)
export const clearChatHistory = async (req, res) => {
  return successResponse(res, {}, 'Chat history tidak disimpan di database');
};

// Calculate Distance from GPS Coordinates (GPS-only, no manual input, no database)
export const calculateDistanceFromGPS = async (req, res) => {
  try {
    const { userLat, userLon, accuracy } = req.body;

    // Validasi keberadaan koordinat
    if (userLat === undefined || userLat === null || userLon === undefined || userLon === null) {
      return errorResponse(res, 'Koordinat lokasi pengguna tidak tersedia', ERROR_CODES.VALIDATION_ERROR);
    }

    const lat = parseFloat(userLat);
    const lon = parseFloat(userLon);

    // Validasi range koordinat geografis
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return errorResponse(res, 'Koordinat GPS tidak valid', ERROR_CODES.VALIDATION_ERROR);
    }

    // Koordinat sekolah (dapat dikonfigurasi via environment variable)
    const schoolLat = parseFloat(process.env.SCHOOL_LAT) || -6.8133266;
    const schoolLon = parseFloat(process.env.SCHOOL_LON) || 108.6177609;
    const schoolName = process.env.SCHOOL_NAME || 'MA Bina Cendekia';
    const schoolAddress = process.env.SCHOOL_ADDRESS || 'Jl. Raya Madrasah No. 123, Jawa Barat';

    // Hitung jarak garis lurus (Haversine) sebagai referensi tambahan
    const R = 6371; // radius bumi dalam km
    const dLat = (schoolLat - lat) * Math.PI / 180;
    const dLon = (schoolLon - lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(schoolLat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const straightLineKm = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));

    // Hitung rute perjalanan tercepat via OSRM (Profil Driving/Mobil)
    const osrmEndpoints = [
      `https://router.project-osrm.org/route/v1/driving/${lon},${lat};${schoolLon},${schoolLat}?overview=full&geometries=geojson&alternatives=true`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${lon},${lat};${schoolLon},${schoolLat}?overview=full&geometries=geojson&alternatives=true`
    ];

    let routeData = null;

    for (const endpoint of osrmEndpoints) {
      try {
        const routeRes = await axios.get(endpoint, {
          headers: {
            'User-Agent': 'SPMB-MABinaCendekia/1.0 (contact: info@mabinacendekia.sch.id)'
          },
          timeout: 8000
        });

        if (routeRes.data && routeRes.data.code === 'Ok' && Array.isArray(routeRes.data.routes) && routeRes.data.routes.length > 0) {
          // Urutkan rute berdasarkan durasi tercepat
          const sortedRoutes = [...routeRes.data.routes].sort((r1, r2) => r1.duration - r2.duration);
          const fastestRoute = sortedRoutes[0];

          // Format durasi ke format menit atau jam yang informatif
          const totalMinutes = Math.round(fastestRoute.duration / 60);
          let durationFormatted = `${totalMinutes} menit`;
          if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const remainingMins = totalMinutes % 60;
            durationFormatted = remainingMins > 0 ? `${hours} jam ${remainingMins} menit` : `${hours} jam`;
          }

          // Cek rute alternatif jika tersedia
          const alternatives = sortedRoutes.slice(1).map((alt) => ({
            distanceKm: parseFloat((alt.distance / 1000).toFixed(1)),
            durationMinutes: Math.round(alt.duration / 60),
            durationFormatted: Math.round(alt.duration / 60) >= 60
              ? `${Math.floor(Math.round(alt.duration / 60) / 60)} jam ${Math.round(alt.duration / 60) % 60} mnt`
              : `${Math.round(alt.duration / 60)} menit`
          }));

          routeData = {
            type: 'Rute Tercepat',
            profile: 'driving',
            distanceKm: parseFloat((fastestRoute.distance / 1000).toFixed(1)),
            distanceMeters: Math.round(fastestRoute.distance),
            durationMinutes: totalMinutes,
            durationFormatted,
            geometry: fastestRoute.geometry || null,
            mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${schoolLat},${schoolLon}`,
            alternatives
          };

          break;
        }
      } catch (err) {
        console.warn(`Routing endpoint failed (${endpoint.split('//')[1].split('/')[0]}):`, err.message);
      }
    }

    successResponse(res, {
      route: routeData,
      straightLineKm,
      school: {
        name: schoolName,
        address: schoolAddress,
        lat: schoolLat,
        lon: schoolLon
      },
      accuracy: accuracy ? parseFloat(accuracy) : null
    }, routeData ? 'Rute perjalanan berhasil dihitung' : 'Layanan rute jalan tidak tersedia, menampilkan estimasi garis lurus');

  } catch (error) {
    console.error('Calculate Distance Error:', error);
    errorResponse(res, 'Gagal memproses perhitungan rute', ERROR_CODES.INTERNAL_ERROR);
  }
};
