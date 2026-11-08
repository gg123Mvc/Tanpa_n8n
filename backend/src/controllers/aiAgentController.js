import supabase from '../config/database.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';
import axios from 'axios';
import { getFormattedKnowledgeBase } from './knowledgeBaseController.js';

// Send Message to AI Agent
export const sendMessageToAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    const user = req.user;

    if (!message || message.trim() === '') {
      return errorResponse(res, 'Pesan tidak boleh kosong', ERROR_CODES.VALIDATION_ERROR);
    }

    const startTime = Date.now();
    let aiResponse = "";
    
    // Interceptor: Deteksi otomatis nomor registrasi atau tiket untuk mempercepat respon 
    const msgUpper = message.trim().toUpperCase();
    const ticketMatch = msgUpper.match(/(CMP-\d{8}-\d{5})/);
    const gradMatch = msgUpper.match(/(SPMB-\d{4}-\d{3,4}|REG\d+)/);
    
    const askGrad = msgUpper.match(/(CEK KELULUSAN|HASIL SELEKSI|STATUS KELULUSAN|PENGUMUMAN|LULUS ATAU TIDAK)/);
    const askTicket = msgUpper.match(/(CEK TIKET|STATUS PENGADUAN|CEK PENGADUAN|LACAK PENGADUAN)/);

    if (ticketMatch) {
      aiResponse = JSON.stringify({ action: 'check_ticket', ticket_number: ticketMatch[1] });
    } else if (gradMatch) {
      aiResponse = JSON.stringify({ action: 'check_graduation', registration_number: gradMatch[1] });
    } else if (askTicket) {
      aiResponse = "Silakan masukkan Nomor Tiket Pengaduan Anda.\n\nContoh:\nCMP-20260710-00015";
    } else if (askGrad) {
      aiResponse = "Silakan masukkan Nomor Registrasi Anda.\n\nContoh:\nSPMB-2026-003";
    } else {
      aiResponse = await callNeoXRAI(message, history);
    }

    // Check for JSON action from AI
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const actionData = JSON.parse(jsonMatch[0]);
        if (actionData.action === 'create_complaint') {
          try {
            const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');

            // Get last ticket number for today
            const { data: lastTicket } = await supabase
              .from('complaints')
              .select('ticket_number')
              .like('ticket_number', `CMP-${dateStr}-%`)
              .order('id', { ascending: false })
              .limit(1)
              .maybeSingle();

            let nextNum = 1;
            if (lastTicket) {
              const lastNum = parseInt(lastTicket.ticket_number.split('-')[2]);
              nextNum = lastNum + 1;
            }
            const ticketNumber = `CMP-${dateStr}-${String(nextNum).padStart(5, '0')}`;
            
            const userId = (user && user.userId) ? user.userId : null;
            
            const { error: insertError } = await supabase.from('complaints').insert({
              ticket_number: ticketNumber,
              user_id: userId,
              category: actionData.category || 'Lainnya',
              priority: actionData.priority || 'Low',
              complaint: actionData.complaint || message,
              summary: actionData.summary || 'Pengaduan pengguna',
              status: 'Menunggu'
            });

            if (insertError) throw insertError;
            
            aiResponse = `====================================================\n\nTerima kasih.\n\nPengaduan Anda telah berhasil dicatat.\n\nNomor Tiket:\n${ticketNumber}\n\nKategori:\n${actionData.category || 'Lainnya'}\n\nStatus:\nMenunggu\n\nSilakan simpan nomor tiket tersebut untuk melakukan pengecekan status melalui MAIRA AI.\n\n====================================================`;
          } catch (dbErr) {
            console.error('Failed to create complaint:', dbErr);
            aiResponse = `Mohon maaf.\n\nSaat ini pengaduan belum dapat diproses karena terjadi gangguan sistem.\n\nSilakan mencoba beberapa saat lagi atau menghubungi Admin SPMB.`;
          }
        } else if (actionData.action === 'check_ticket') {
          try {
            const { data: ticket, error } = await supabase
              .from('complaints')
              .select('*')
              .eq('ticket_number', actionData.ticket_number)
              .maybeSingle();

            if (error) throw error;
            
            if (ticket) {
              const dateObj = new Date(ticket.updated_at);
              const pad = (n) => String(n).padStart(2, '0');
              const updatedAt = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
              
              aiResponse = `🎫 STATUS PENGADUAN\n\nNomor Tiket\n${ticket.ticket_number}\n\nStatus\n${ticket.status}\n\nCatatan Admin\n${ticket.admin_note || '-'}\n\nTerakhir Diperbarui\n${updatedAt}`;
            } else {
              aiResponse = `Mohon maaf.\n\nNomor Tiket tidak ditemukan.\n\nSilakan periksa kembali Nomor Tiket Pengaduan Anda.`;
            }
          } catch (dbErr) {
            console.error('Failed to check ticket:', dbErr);
            aiResponse = `Mohon maaf. Saat ini pengecekan status belum dapat diproses karena terjadi gangguan sistem. Silakan mencoba beberapa saat lagi.`;
          }
        } else if (actionData.action === 'check_graduation') {
          try {
            const { data: rows, error } = await supabase
              .from('users')
              .select('registration_number, full_name, registration_status, school_data ( major_choice )')
              .eq('registration_number', actionData.registration_number)
              .maybeSingle();

            if (error) throw error;
            
            if (rows) {
              let statusText = '';
              let messageText = '';
              
              if (rows.registration_status === 'accepted') {
                statusText = '✅ LULUS';
                messageText = 'Selamat. Silakan melakukan daftar ulang sesuai jadwal yang telah ditentukan.';
              } else if (rows.registration_status === 'rejected') {
                statusText = '❌ TIDAK LULUS';
                messageText = 'Terima kasih telah mengikuti proses seleksi. Semoga sukses pada kesempatan berikutnya.';
              } else if (rows.registration_status === 'revision') {
                statusText = '⚠️ PERLU REVISI';
                messageText = 'Dokumen Anda perlu diperbaiki. Silakan login ke dashboard untuk melihat detail revisi.';
              } else {
                statusText = '⏳ DALAM PROSES / BELUM DIVERIFIKASI';
                messageText = 'Pendaftaran Anda sedang dalam antrean pengecekan oleh panitia. Mohon cek kembali secara berkala.';
              }
              
              aiResponse = `🎓 HASIL SELEKSI PMB\n\nNomor Registrasi\n${rows.registration_number}\n\nNama\n${rows.full_name}\n\nProgram\n${rows.school_data?.major_choice || '-'}\n\nStatus\n${statusText}\n\n${messageText}`;
            } else {
              aiResponse = `Mohon maaf.\n\nNomor Registrasi tidak ditemukan.\n\nSilakan periksa kembali Nomor Registrasi Anda.`;
            }
          } catch (dbErr) {
            console.error('Failed to check graduation:', dbErr);
            aiResponse = `Mohon maaf. Saat ini pengecekan kelulusan belum dapat diproses karena terjadi gangguan sistem. Silakan mencoba beberapa saat lagi.`;
          }
        } else if (actionData.action === 'check_route') {
          aiResponse = "📍 **Cek Jarak ke Sekolah**\n\nUntuk menghitung jarak dari lokasi Anda ke sekolah, silakan gunakan fitur **Cek Jarak** yang tersedia di halaman ini.\n\nFitur tersebut akan meminta izin akses lokasi GPS perangkat Anda untuk menentukan titik awal secara akurat.\n\nJarak dan estimasi waktu perjalanan akan dihitung secara otomatis setelah izin diberikan.";
        }
      } catch(e) {
        // Not a valid JSON or not our action format, just continue with original response
      }
    }

    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    // Save to DB only if user is logged in
    if (user && user.userId) {
      const { error: historyError } = await supabase.from('chat_history').insert({
        user_id: user.userId,
        message,
        response: aiResponse,
        message_type: 'ai_agent',
        response_time_ms: responseTimeMs
      });
      if (historyError) console.error('Failed to save chat history:', historyError.message);
    }

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

// Call NeoXR GPT-4 API
const callNeoXRAI = async (message, history = []) => {
  const apiKey = process.env.API_NEOXR;
  if (!apiKey) {
    throw new Error('API_NEOXR tidak ditemukan dalam konfigurasi environment (.env)');
  }
  const url = "https://api.neoxr.eu/api/gpt4";

  let historyText = "";
  if (Array.isArray(history) && history.length > 0) {
    historyText = "\n\nRiwayat Percakapan Sebelumnya:\n" + history.map(h => {
      const aiTruncated = h.ai ? (h.ai.length > 250 ? h.ai.substring(0, 250) + '...' : h.ai) : '';
      return `User: ${h.user}\nMAIRA AI: ${aiTruncated}`;
    }).join("\n");
  }

  const knowledgeBaseText = await getFormattedKnowledgeBase();

  const systemPrompt = `Nama Anda adalah MAIRA AI (Madrasah AI Response Assistant), asisten virtual resmi MA Bina Cendekia.
Tugas utama Anda adalah memberikan layanan informasi dan menerima pengaduan terkait Sistem Penerimaan Murid Baru (SPMB).

=========================================================
ATURAN UMUM
=========================================================
1. Jawab:
${knowledgeBaseText}
2. JANGAN buat info di luar Knowledge Base.
3. Gunakan bahasa sopan & profesional.
4. Jika ada keluhan/error (PENGADUAN), ikuti aturan di bawah.
=========================================================
PRIORITAS PERINTAH (TIDAK BOLEH PAKAI KNOWLEDGE BASE)
=========================================================
1. Cek Kelulusan
2. Cek Status Pengaduan
3. Jarak/Rute
4. Buat Pengaduan

=========================================================
=========================================================
IDENTIFIKASI & PENANGANAN PENGADUAN
=========================================================
Pesan keluhan/error sistem (misal: gagal login/daftar, web error, kritik) = PENGADUAN.
AI menentukan otomatis: Category, Priority (High/Medium/Low), dan Summary.
JANGAN MINTA pengguna mengisi format JSON/kategori. HANYA minta info kurang (misal No. Registrasi).
Jika lengkap, AI merespons HANYA dengan JSON internal (tanpa teks lain):
{
    "action":"create_complaint",
    "category":"Upload Dokumen",
    "priority":"Medium",
    "complaint":"<pesan pengguna>",
    "summary":"<ringkasan singkat>"
}

=========================================================
=========================================================
DETEKSI NOMOR REGISTRASI (CEK KELULUSAN)
=========================================================
Nomor Registrasi format SPMB-XXXX-XXX atau REGXXXX.
Jika pengguna menyebut No. Registrasi ATAU meminta cek kelulusan + nomornya, AI WAJIB merespons HANYA dengan JSON:
{
    "action":"check_graduation",
    "registration_number":"<nomor>"
}
JANGAN jawab dengan Knowledge Base atau teks lain.
Jika minta cek tanpa nomor, minta nomor registrasinya.

=========================================================
PENGECEKAN STATUS PENGADUAN
=========================================================
Nomor Tiket format CMP-XXXX.
Jika ada kata "cek tiket", "status pengaduan" ATAU menyebut Nomor Tiket, AI WAJIB merespons HANYA dengan JSON:
{
   "action":"check_ticket",
   "ticket_number":"<nomor>"
}
Jika minta cek tanpa nomor tiket, minta nomornya.

=========================================================
PENGECEKAN JARAK DAN RUTE KE SEKOLAH
=========================================================
Jika pengguna bertanya tentang jarak, rute, atau lokasi ke sekolah (misal: "berapa jarak ke sekolah?", "cek jarak saya ke sekolah", "rute dari tempat saya ke sekolah"), AI WAJIB merespons dengan teks panduan berikut:

"📍 Untuk mengecek jarak dari lokasi Anda ke sekolah, silakan gunakan fitur **Cek Jarak** yang tersedia di halaman ini. Fitur tersebut menggunakan GPS perangkat Anda untuk menentukan lokasi secara akurat, lalu menghitung jarak dan estimasi waktu perjalanan ke MA Bina Cendekia secara otomatis. Cukup klik tombol **Cek Jarak** dan berikan izin akses lokasi ketika diminta."

AI DILARANG KERAS:
- Meminta pengguna memasukkan nama desa, kecamatan, atau lokasi secara manual.
- Mengaku sudah mengetahui lokasi pengguna sebelum GPS berhasil memperoleh koordinat.
- Memberikan hasil jarak atau estimasi waktu tanpa data koordinat GPS nyata.
- Menawarkan lokasi patokan manual sebagai alternatif.
=========================================================
PRIORITAS ACTION & Knowledge Base
=========================================================
1. No Tiket (CMP-xxxx) → check_ticket
2. No Registrasi (SPMB-xxxx / REGxxxx) → check_graduation
3. Jarak/Rute → Arahkan ke fitur Cek Jarak GPS (teks panduan, BUKAN JSON)
4. Pengaduan → create_complaint
5. Selain itu → Knowledge Base
=========================================================
${historyText}

Tanya: ${message}`;

  try {
    const response = await axios.get(url, {
      params: {
        q: systemPrompt,
        apikey: apiKey
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 30000 
    });

    let text = '';
    if (response.data && response.data.status) {
      if (typeof response.data.data === 'object' && response.data.data.message) {
        text = response.data.data.message;
      } else if (typeof response.data.data === 'string') {
        text = response.data.data;
      }
    }

    if (!text) {
      console.error('NeoXR Invalid Response Format:', JSON.stringify(response.data));
      throw new Error('Format respons AI tidak valid atau kosong');
    }
    
    return String(text);
  } catch (err) {
    console.error('NeoXR API Call Error:', err.message);
    throw err;
  }
};

// Get Chat History
export const getChatHistory = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || !user.userId) {
      return successResponse(res, [], 'Guest history empty');
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('user_id, message, response, message_type, created_at, response_time_ms')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    successResponse(res, data || [], 'Chat history berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Clear Chat History
export const clearChatHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      return successResponse(res, {}, 'Guest chat history cleared');
    }

    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', user.userId);

    if (error) throw error;

    successResponse(res, {}, 'Chat history berhasil dihapus');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Calculate Distance from GPS Coordinates (GPS-only, no manual input)
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
    // Gunakan daftar endpoint dengan fallback untuk keandalan maksimal
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

          // Berhasil mengambil rute dari endpoint, hentikan iterasi endpoint fallback
          break;
        }
      } catch (err) {
        console.warn(`Routing endpoint failed (${endpoint.split('//')[1].split('/')[0]}):`, err.message);
      }
    }

    successResponse(res, {
      route: routeData, // null jika layanan routing gagal / rute jalan tidak ditemukan
      straightLineKm,   // estimasi garis lurus sebagai data pelengkap/fallback
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
