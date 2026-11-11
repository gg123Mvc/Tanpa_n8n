import React, { useState, useCallback } from 'react';
import {
  FiX,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
  FiExternalLink,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiInfo
} from 'react-icons/fi';
import { calculateRouteAndDistance, SCHOOL_CONFIG } from '../../utils/routingService';
import RouteMap from './RouteMap';

// Status enum untuk state machine
const STATUS = {
  IDLE: 'idle',                     // Belum mulai - tampilkan tombol Izinkan Lokasi
  LOCATING: 'locating',             // GPS aktif, mencari koordinat perangkat
  CALCULATING: 'calculating',       // Menghubungi OSRM & menghitung rute perjalanan tercepat
  SUCCESS: 'success',               // Rute jalan berhasil ditemukan
  ROUTING_FAILED: 'routing_failed', // GPS berhasil tapi rute jalan tidak dapat dihitung
  ERROR: 'error'                    // GPS error (izin ditolak, tidak tersedia, timeout)
};

// Terjemahkan kode error GeolocationPositionError ke pesan ramah pengguna
const getGPSErrorMessage = (error) => {
  if (!error) return 'GPS tidak dapat memperoleh koordinat. Silakan coba lagi.';
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return 'Anda belum memberikan izin akses lokasi. Fitur cek jarak memerlukan akses lokasi perangkat untuk menentukan rute tercepat dari lokasi Anda ke sekolah. Silakan berikan izin lokasi di browser Anda.';
    case 2: // POSITION_UNAVAILABLE
      return 'Layanan lokasi perangkat tidak tersedia atau dinonaktifkan. Pastikan GPS perangkat Anda telah diaktifkan lalu coba lagi.';
    case 3: // TIMEOUT
      return 'Waktu pencarian lokasi habis. Sinyal GPS mungkin lemah di lokasi Anda. Silakan coba lagi di tempat yang lebih terbuka.';
    default:
      return 'Browser tidak dapat memperoleh koordinat GPS. Pastikan perangkat dan browser mendukung fitur lokasi.';
  }
};

const DistanceChecker = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [gpsError, setGpsError] = useState(null);
  const [result, setResult] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setErrorMessage('');
    setGpsError(null);
    setResult(null);
    setUserCoords(null);
    setIsRefreshing(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleRequestGPS = useCallback(() => {
    // Hindari request ganda jika sedang berjalan
    if (isRefreshing) return;

    // Pastikan browser mendukung Geolocation API
    if (!navigator.geolocation) {
      setErrorMessage('Browser Anda tidak mendukung fitur lokasi GPS. Gunakan browser modern seperti Chrome, Firefox, Safari, atau Edge terbaru.');
      setStatus(STATUS.ERROR);
      return;
    }

    setIsRefreshing(true);
    setStatus(STATUS.LOCATING);
    setErrorMessage('');
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      // Sukses: koordinat GPS diperoleh
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Validasi ketat koordinat sebelum dikirim ke perhitungan rute
        if (
          latitude === null ||
          latitude === undefined ||
          longitude === null ||
          longitude === undefined ||
          isNaN(latitude) ||
          isNaN(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          setErrorMessage('GPS memberikan koordinat yang tidak valid. Silakan coba lagi.');
          setStatus(STATUS.ERROR);
          setIsRefreshing(false);
          return;
        }

        const currentCoords = {
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : null
        };
        setUserCoords(currentCoords);

        setStatus(STATUS.CALCULATING);

        try {
          // Hitung rute tercepat via OSRM (Backend dengan fallback client-side)
          const calculationResult = await calculateRouteAndDistance(
            currentCoords.lat,
            currentCoords.lon,
            currentCoords.accuracy
          );

          setResult(calculationResult);

          if (calculationResult.route) {
            // Rute jalan berhasil ditemukan
            setStatus(STATUS.SUCCESS);
          } else {
            // Layanan routing gagal menemukan rute jalan
            setStatus(STATUS.ROUTING_FAILED);
          }
        } catch (apiErr) {
          console.error('Routing calculation error:', apiErr);
          setErrorMessage('Terjadi gangguan saat menghubungkan ke layanan rute. Silakan coba beberapa saat lagi.');
          setStatus(STATUS.ERROR);
        } finally {
          setIsRefreshing(false);
        }
      },
      // Gagal: izin ditolak, sinyal tidak ada, atau timeout
      (error) => {
        setGpsError(error);
        setErrorMessage(getGPSErrorMessage(error));
        setStatus(STATUS.ERROR);
        setIsRefreshing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,      // 15 detik batas timeout GPS
        maximumAge: 0        // Selalu ambil posisi GPS terbaru, jangan cache
      }
    );
  }, [isRefreshing]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="distance-checker-title"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
              <FiNavigation size={20} className="text-white" />
            </div>
            <div>
              <h2 id="distance-checker-title" className="font-bold text-lg leading-tight">
                Cek Jarak & Rute ke Sekolah
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5">Navigasi berbasis GPS & Jaringan Jalan</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {/* 1. STATE: IDLE (Tampilkan penjelasan dan tombol Izinkan Lokasi) */}
          {status === STATUS.IDLE && (
            <div className="text-center py-2">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-emerald-100">
                <FiMapPin size={36} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Izinkan Akses Lokasi</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 px-2">
                Sistem akan menghitung jarak perjalanan aktual melalui jaringan jalan dan estimasi waktu tercepat menuju sekolah menggunakan GPS perangkat Anda.
              </p>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mb-6 text-left">
                <p className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">Lokasi Tujuan Sekolah:</p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <FiMapPin size={16} />
                  </div>
                  <div>
                    <p className="text-emerald-950 text-sm font-bold">{SCHOOL_CONFIG.name}</p>
                    <p className="text-emerald-700 text-xs mt-0.5">{SCHOOL_CONFIG.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  id="distance-checker-cancel-btn"
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  id="distance-checker-allow-btn"
                  className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <FiNavigation size={16} />
                  Izinkan Lokasi
                </button>
              </div>
            </div>
          )}

          {/* 2. STATE: LOCATING / CALCULATING (Animasi Loading) */}
          {(status === STATUS.LOCATING || status === STATUS.CALCULATING) && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="w-20 h-20 border-4 border-emerald-100 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiNavigation size={22} className="text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {status === STATUS.LOCATING ? 'Mendapatkan Lokasi GPS...' : 'Menghitung Rute Tercepat...'}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                {status === STATUS.LOCATING
                  ? 'GPS sedang mencari koordinat perangkat Anda dengan akurasi tinggi...'
                  : 'Menganalisis jaringan jalan dan memilih rute perjalanan tercepat ke MA Bina Cendekia...'}
              </p>
            </div>
          )}

          {/* 3. STATE: SUCCESS (Rute jalan berhasil dihitung) */}
          {status === STATUS.SUCCESS && result && result.route && (
            <div className="space-y-4">
              {/* Badge Status */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <FiCheckCircle size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-sm">Rute Berhasil Ditemukan</h3>
                    <p className="text-emerald-700 text-xs">Jalur jalan tercepat menuju sekolah</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-200/60 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                  🚗 {result.route.type || 'Rute Tercepat'}
                </span>
              </div>

              {/* Data Sekolah / Tujuan */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Tujuan</p>
                <div className="flex items-center gap-2">
                  <FiMapPin size={15} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-bold text-sm">{result.school?.name || SCHOOL_CONFIG.name}</p>
                    <p className="text-gray-500 text-xs">{result.school?.address || SCHOOL_CONFIG.address}</p>
                  </div>
                </div>
              </div>

              {/* Kartu Metrik Jarak & Estimasi Waktu */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-emerald-800 mb-1">
                    {result.route.distanceKm} <span className="text-base font-bold">km</span>
                  </div>
                  <p className="text-emerald-700 text-xs font-bold">Jarak Perjalanan</p>
                  <p className="text-emerald-600 text-[10px]">melalui jaringan jalan</p>
                </div>
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-blue-800 mb-1">
                    {result.route.durationMinutes} <span className="text-base font-bold">mnt</span>
                  </div>
                  <p className="text-blue-700 text-xs font-bold">Estimasi Waktu</p>
                  <p className="text-blue-600 text-[10px]">
                    {result.route.durationFormatted || 'perjalanan kendaraan'}
                  </p>
                </div>
              </div>

              {/* Peta Interaktif Leaflet */}
              {userCoords && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <FiCompass size={13} className="text-emerald-600" />
                      Peta Jalur Rute
                    </span>
                    <span className="text-[10px] text-gray-500">Garis hijau: Rute Tercepat</span>
                  </div>
                  <RouteMap
                    userLat={userCoords.lat}
                    userLon={userCoords.lon}
                    schoolLat={result.school?.lat || SCHOOL_CONFIG.lat}
                    schoolLon={result.school?.lon || SCHOOL_CONFIG.lon}
                    schoolName={result.school?.name || SCHOOL_CONFIG.name}
                    routeGeometry={result.route.geometry}
                  />
                </div>
              )}

              {/* Rute Alternatif (Jika ada) */}
              {result.route.alternatives && result.route.alternatives.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 border border-gray-100">
                  <span className="font-semibold text-gray-700">Rute Alternatif: </span>
                  {result.route.alternatives.map((alt, idx) => (
                    <span key={idx} className="inline-block mr-2">
                      Jalur {idx + 2} ({alt.distanceKm} km, ~{alt.durationFormatted})
                    </span>
                  ))}
                </div>
              )}

              {/* Informasi Teknis & Akurasi */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 space-y-1.5 text-xs">
                {result.straightLineKm !== undefined && (
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Jarak garis lurus (estimasi)</span>
                    <span className="font-semibold text-gray-700">{result.straightLineKm} km</span>
                  </div>
                )}
                {userCoords?.accuracy && (
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Akurasi GPS perangkat</span>
                    <span className="font-semibold text-gray-700">±{Math.round(userCoords.accuracy)} meter</span>
                  </div>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3 pt-1">
                {result.route.mapsUrl && (
                  <a
                    href={result.route.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="distance-checker-maps-btn"
                    className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    <FiExternalLink size={15} />
                    Buka di Google Maps
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  disabled={isRefreshing}
                  id="distance-checker-refresh-btn"
                  className="py-3 px-5 border-2 border-emerald-600 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <FiRefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  Cek Ulang
                </button>
              </div>
            </div>
          )}

          {/* 4. STATE: ROUTING_FAILED (Layanan routing jalan gagal, tampilkan garis lurus dengan label jelas) */}
          {status === STATUS.ROUTING_FAILED && result && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">Rute Jalan Belum Berhasil Dihitung</h3>
                    <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                      Layanan routing OSRM tidak dapat menemukan jalur jalan atau sedang tidak dapat diakses saat ini. Jarak di bawah merupakan estimasi garis lurus, <strong>bukan jarak perjalanan melalui jalan raya</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimasi Garis Lurus Berlabel Jelas */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-amber-800 mb-1">
                  {result.straightLineKm} <span className="text-base font-bold">km</span>
                </div>
                <p className="text-amber-800 text-xs font-bold">Jarak Garis Lurus (estimasi)</p>
                <p className="text-amber-600 text-[10px] mt-0.5">Bukan jarak perjalanan aktual melalui jalan</p>
              </div>

              {/* Peta garis lurus jika koordinat tersedia */}
              {userCoords && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-xs font-bold text-gray-700">Perkiraan Arah Lokasi</span>
                    <span className="text-[10px] text-amber-700 font-medium">Garis putus-putus: Garis Lurus</span>
                  </div>
                  <RouteMap
                    userLat={userCoords.lat}
                    userLon={userCoords.lon}
                    schoolLat={result.school?.lat || SCHOOL_CONFIG.lat}
                    schoolLon={result.school?.lon || SCHOOL_CONFIG.lon}
                    schoolName={result.school?.name || SCHOOL_CONFIG.name}
                    isStraightLineOnly={true}
                  />
                </div>
              )}

              {userCoords?.accuracy && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-600">
                  <span>Akurasi GPS perangkat</span>
                  <span className="font-semibold text-gray-800">±{Math.round(userCoords.accuracy)} meter</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  id="distance-checker-close-failed-btn"
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  disabled={isRefreshing}
                  id="distance-checker-retry-failed-btn"
                  className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <FiRefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* 5. STATE: ERROR (GPS Izin Ditolak / Tidak Tersedia / Timeout) */}
          {status === STATUS.ERROR && (
            <div className="text-center py-2">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
                <FiAlertTriangle size={36} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {gpsError?.code === 1 ? 'Izin Lokasi Ditolak' : 'Lokasi Tidak Dapat Diperoleh'}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 px-2">
                {errorMessage}
              </p>

              {/* Panduan jika izin ditolak */}
              {gpsError?.code === 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-left">
                  <p className="text-amber-900 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                    <FiInfo size={14} className="text-amber-700" />
                    Cara Mengaktifkan Akses Lokasi:
                  </p>
                  <ul className="text-amber-800 text-xs space-y-1 list-disc list-inside">
                    <li>Klik ikon gembok/setelan di sebelah kiri kolom URL browser</li>
                    <li>Ubah izin &quot;Lokasi&quot; menjadi &quot;Izinkan&quot; / &quot;Allow&quot;</li>
                    <li>Muat ulang halaman lalu klik tombol Coba Lagi di bawah</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  id="distance-checker-cancel-error-btn"
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  disabled={isRefreshing}
                  id="distance-checker-retry-error-btn"
                  className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <FiRefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DistanceChecker;
