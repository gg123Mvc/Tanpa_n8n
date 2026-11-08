import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiInfo, FiBook, FiAward, FiSmartphone, FiGlobe, FiUser, FiUpload, FiClock, FiMessageSquare, FiChevronRight, FiX } from 'react-icons/fi';
import { dashboardAPI } from '../utils/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await dashboardAPI.getAnnouncements();
        if (response.data.success) {
          // Limit to 3 for landing page
          setAnnouncements(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-islamic-pattern">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo_ma.jpg" alt="Logo" className="w-12 h-12 rounded-full shadow-xl shadow-emerald-900/10" />
            <div>
              <h1 className="text-xl font-extrabold text-emerald-900 leading-none">MA Bina Cendekia</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mt-1">Islamic Secondary School</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-xs font-bold text-emerald-900 uppercase tracking-widest">
            <a href="#tentang" className="hover:text-emerald-600 transition-colors">Tentang Kami</a>
            <a href="#jurusan" className="hover:text-emerald-600 transition-colors">Program Studi</a>
            <a href="#berita" className="hover:text-emerald-600 transition-colors">Berita</a>
            <a href="#alur" className="hover:text-emerald-600 transition-colors">Alur Pendaftaran</a>
            <a href="#kontak" className="hover:text-emerald-600 transition-colors">Hubungi Kami</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-3 text-emerald-700 font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 rounded-2xl transition-all"
            >
              Masuk
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn-primary !py-3 !px-6 text-xs uppercase tracking-widest"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              PENDAFTARAN SISWA BARU TA 2026/2027 TELAH DIBUKA
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-emerald-950 mb-8 leading-[1.1] tracking-tight">
              Membangun Generasi <br />
              <span className="text-emerald-700 italic">Qur'ani & Modern</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg">
              Kami menggabungkan kurikulum nasional yang progresif dengan pendalaman ilmu agama Islam untuk mencetak pemimpin masa depan yang kompeten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary group"
              >
                Mulai Pendaftaran <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-secondary">
                <FiGlobe /> Lihat Profil Sekolah
              </button>
            </div>
          </div>

          <div className="relative group animate-fadeIn" style={{ animationDelay: '0.2s' }}>
             <div className="absolute inset-0 bg-emerald-600 rounded-[3rem] rotate-3 group-hover:rotate-1 transition-transform duration-500 -z-10 opacity-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1577891772427-b5604b28461c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
               alt="Students" 
               className="rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 border-8 border-white object-cover aspect-video lg:aspect-square"
             />
             <div className="absolute -bottom-10 -left-10 glass p-8 rounded-[2.5rem] shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="text-4xl font-black text-emerald-900">A+</div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Akreditasi Sekolah</div>
             </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="bg-emerald-900 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { val: '98%', label: 'Lulus PTN/Luar Negeri' },
            { val: '15:1', label: 'Rasio Guru & Murid' },
            { val: '25+', label: 'Ekstrakurikuler' },
            { val: '500+', label: 'Hafidz Al-Qur\'an' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl font-black text-white">{stat.val}</div>
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section id="alur" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-emerald-950 mb-4">Kemudahan Pendaftaran</h2>
          <p className="text-gray-500 font-medium">Portal pendaftaran kami dirancang untuk mempermudah orang tua & siswa.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { 
              num: '01', 
              icon: <FiUser />, 
              title: 'Registrasi Akun', 
              desc: 'Buat akun dengan WhatsApp dan Email aktif untuk akses portal pendaftaran.' 
            },
            { 
              num: '02', 
              icon: <FiBook />, 
              title: 'Lengkapi Data', 
              desc: 'Isi biodata, data orang tua, dan riwayat akademik Anda dengan sistem simpan otomatis.' 
            },
            { 
              num: '03', 
              icon: <FiUpload />, 
              title: 'Unggah Berkas', 
              desc: 'Lampirkan scan dokumen seperti KK, Ijazah, dan Pas Foto langsung dari ponsel Anda.' 
            },
          ].map((step, i) => (
            <div key={i} className="group p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-emerald-100 shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-emerald-700 group-hover:text-white transition-all duration-500 shadow-sm">
                  {step.icon}
                </div>
                <div className="text-5xl font-black text-emerald-50/50 group-hover:text-emerald-50 transition-colors">{step.num}</div>
              </div>
              <h3 className="text-xl font-bold text-emerald-950 mb-4">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* News & Announcements Section */}
      <section id="berita" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                Informasi Terkini
              </div>
              <h2 className="text-4xl font-black text-emerald-950 mb-4">Berita & Pengumuman</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Dapatkan informasi terbaru mengenai proses pendaftaran, jadwal ujian, dan berita seputar MA Bina Cendekia.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-emerald-700 font-bold text-sm group"
            >
              Lihat Semua Berita <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-[2.5rem]"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                </div>
              ))
            ) : announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="group cursor-pointer" onClick={() => setSelectedAnn(ann)}>
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-6 shadow-lg">
                    {ann.thumbnail ? (
                      <img 
                        src={ann.thumbnail} 
                        alt={ann.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-emerald-900 items-center justify-center text-emerald-400 ${ann.thumbnail ? 'hidden' : 'flex'}`}>
                      <FiMessageSquare size={48} className="opacity-20" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                        Berita
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <span className="flex items-center gap-1.5"><FiClock size={12} /> {new Date(ann.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h3 className="text-xl font-black text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="font-bold text-gray-400">Belum ada berita terbaru.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* News Detail Modal */}
      {selectedAnn && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-8 border-b flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl">Berita Terkini</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FiClock /> {new Date(selectedAnn.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedAnn(null)} 
                className="w-10 h-10 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 sm:p-12">
              {selectedAnn.thumbnail && (
                <img src={selectedAnn.thumbnail} alt={selectedAnn.title} className="w-full h-auto rounded-[2.5rem] mb-10 shadow-xl" />
              )}
              <h2 className="text-3xl sm:text-5xl font-black text-emerald-950 mb-8 leading-tight">{selectedAnn.title}</h2>
              <div className="prose prose-emerald max-w-none">
                <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedAnn.content}
                </p>
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t flex justify-center shrink-0">
              <button 
                onClick={() => setSelectedAnn(null)}
                className="px-10 py-4 bg-emerald-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-800 transition-all"
              >
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-emerald-800 rounded-[4rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-8">Bergabunglah di Gelombang Utama!</h2>
            <p className="text-emerald-100 mb-12 text-lg font-medium">Dapatkan beasiswa pendaftaran khusus bagi pendaftar 100 pertama.</p>
            <button 
              onClick={() => navigate('/register')}
              className="px-10 py-5 bg-white text-emerald-900 rounded-3xl font-black text-lg shadow-xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-100"
            >
              Mulai Pendaftaran Online
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
             <div className="flex items-center gap-3 mb-6">
                <img src="/logo_ma.jpg" alt="Logo" className="w-10 h-10 rounded-full" />
                <span className="font-black text-emerald-950">MA BINA CENDEKIA</span>
             </div>
             <p className="text-sm text-gray-400 font-medium leading-relaxed">
               Jl. Raya Madrasah No. 123, <br />
               Kecamatan Cendekia, Jawa Barat. <br />
               info@binacendekia.sch.id
             </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="font-bold text-emerald-950">Tautan</div>
              <ul className="text-sm text-gray-400 space-y-2 font-medium">
                <li>Beranda</li>
                <li>Profil</li>
                <li>Fasilitas</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="font-bold text-emerald-950">Bantuan</div>
              <ul className="text-sm text-gray-400 space-y-2 font-medium">
                <li>FAQ</li>
                <li>Kontak</li>
                <li>Panduan</li>
              </ul>
            </div>
          </div>
          <div className="space-y-6">
             <div className="font-bold text-emerald-950">Ikuti Kami</div>
             <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 hover:bg-emerald-700 hover:text-white transition-all cursor-pointer">IG</div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 hover:bg-emerald-700 hover:text-white transition-all cursor-pointer">FB</div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 hover:bg-emerald-700 hover:text-white transition-all cursor-pointer">YT</div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
