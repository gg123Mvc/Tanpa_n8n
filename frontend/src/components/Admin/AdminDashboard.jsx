import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  FiUsers, FiCheckCircle, FiClock, FiAlertCircle, 
  FiBarChart2, FiMessageSquare, FiLogOut, FiEye, 
  FiSearch, FiDownload, FiMenu, FiX, FiFile, FiImage, FiExternalLink,
  FiPlus, FiEdit3, FiTrash2, FiDatabase, FiTag
} from 'react-icons/fi';
import KnowledgeBase from './KnowledgeBase';
import ComplaintsTab from './ComplaintsTab';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : (import.meta.env.PROD ? '' : 'http://localhost:5000');

const DOC_LABELS = {
  photo: 'Pas Foto',
  family_card: 'Kartu Keluarga',
  birth_certificate: 'Akta Kelahiran',
  report_card: 'Rapor',
  diploma: 'Ijazah / SKL',
};

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({ id: null, title: '', content: '', thumbnail: '' });
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [applicantToRevise, setApplicantToRevise] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchApplicants();
    if (activeTab === 'announcements') fetchAnnouncements();
  }, [statusFilter, activeTab]);

  const fetchAnnouncements = async () => {
    setAnnouncementLoading(true);
    try {
      const response = await adminAPI.getAnnouncements();
      if (response.data.success) setAnnouncements(response.data.data);
    } catch (error) {
      toast.error('Gagal mengambil pengumuman');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleOpenAnnModal = (ann = null) => {
    if (ann) {
      setAnnForm({ id: ann.id, title: ann.title, content: ann.content, thumbnail: ann.thumbnail || '' });
    } else {
      setAnnForm({ id: null, title: '', content: '', thumbnail: '' });
    }
    setShowAnnModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const uploadToast = toast.loading('Mengunggah gambar...');
    try {
      const response = await adminAPI.uploadAnnouncementImage(formData);
      if (response.data.success) {
        const fullUrl = `${BACKEND_URL}/${response.data.data.filePath}`;
        setAnnForm({ ...annForm, thumbnail: fullUrl });
        toast.success('Gambar berhasil diunggah', { id: uploadToast });
      }
    } catch (error) {
      toast.error('Gagal mengunggah gambar', { id: uploadToast });
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (annForm.id) {
        await adminAPI.updateAnnouncement(annForm.id, annForm);
        toast.success('Artikel diperbarui');
      } else {
        await adminAPI.createAnnouncement(annForm);
        toast.success('Artikel berhasil dipublikasikan');
      }
      setShowAnnModal(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Gagal menyimpan artikel');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Yakin ingin menghapus artikel ini?')) return;
    try {
      const response = await adminAPI.deleteAnnouncement(id);
      if (response.data.success) {
        toast.success('Artikel berhasil dihapus');
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error('Gagal menghapus artikel');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.data.success) setStats(response.data.data);
    } catch (error) {
      toast.error('Gagal mengambil statistik');
    }
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getApplicants({ search, status: statusFilter });
      if (response.data.success) setApplicants(response.data.data.applicants);
    } catch (error) {
      toast.error('Gagal mengambil data pendaftar');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await adminAPI.getApplicantDetail(id);
      if (response.data.success) setSelectedApplicant(response.data.data);
    } catch (error) {
      toast.error('Gagal mengambil detail pendaftar');
    }
  };

  const handleUpdateStatus = async (id, status, providedMessage = null) => {
    if (status === 'revision' && !providedMessage) {
      setApplicantToRevise(id);
      setRevisionMessage('');
      setRevisionModalOpen(true);
      return;
    }
    try {
      const response = await adminAPI.updateStatus(id, { status, message: providedMessage });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchApplicants();
        fetchStats();
        if (selectedApplicant?.user?.id === id) handleViewDetail(id);
        setRevisionModalOpen(false);
      }
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const exportCSV = () => {
    const headers = ['No. Reg', 'Nama', 'Email', 'Status', 'Jurusan'];
    const rows = applicants.map(a => [a.registration_number, a.full_name, a.email, a.registration_status, a.major_choice]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "data_pendaftar_pmb.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <FiBarChart2 /> },
    { id: 'applicants', label: 'Daftar Pendaftar', icon: <FiUsers /> },
    { id: 'announcements', label: 'Pengumuman', icon: <FiMessageSquare /> },
    { id: 'complaints', label: 'Pengaduan AI', icon: <FiTag /> },
    { id: 'knowledgebase', label: 'Knowledge Base AI', icon: <FiDatabase /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed lg:relative z-50 h-full transition-all duration-300 bg-emerald-950 text-white flex flex-col flex-shrink-0 overflow-hidden ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-0'}`}>
        <div className="p-8 border-b border-emerald-900">
          <div className="flex items-center gap-4">
            <img src="/logo_ma.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-emerald-800" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Admin Panel</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1">MA Bina Cendekia</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-emerald-300 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-emerald-900">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
          >
            <FiLogOut className="text-lg" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-emerald-950 capitalize">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistem SPMB 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-emerald-950">Administrator</p>
              <p className="text-[10px] text-emerald-600 font-bold">admin@madrasah.id</p>
            </div>
            <div className="w-10 h-10 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-900/20">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              {stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Pendaftar" value={stats.total} icon={<FiUsers />} color="emerald" />
                  <StatCard title="Menunggu Verifikasi" value={stats.pending} icon={<FiClock />} color="amber" />
                  <StatCard title="Diterima" value={stats.accepted} icon={<FiCheckCircle />} color="green" />
                  <StatCard title="Perlu Revisi" value={stats.revision} icon={<FiAlertCircle />} color="orange" />
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />)}
                </div>
              )}

              {/* Distribution */}
              {stats && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-black text-emerald-950 mb-6">Distribusi Pilihan Jurusan</h3>
                  {stats.majors?.length > 0 ? (
                    <div className="space-y-5">
                      {stats.majors.map((m, i) => {
                        const pct = stats.total > 0 ? Math.round((m.count / stats.total) * 100) : 0;
                        const colors = ['bg-emerald-600', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'];
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-sm text-emerald-950">{m.major_choice}</span>
                              <span className="text-xs font-black text-emerald-600">{m.count} Siswa ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div className={`${colors[i % colors.length]} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Belum ada data distribusi jurusan.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* APPLICANTS TAB */}
          {activeTab === 'applicants' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <form onSubmit={(e) => { e.preventDefault(); fetchApplicants(); }} className="relative w-full max-w-sm">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, atau nomor reg..."
                    style={{ padding: '0.75rem 1rem 0.75rem 3rem', border: '2px solid #f3f4f6', borderRadius: '1rem', width: '100%', background: '#f9fafb' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
                <div className="flex gap-3">
                  <select
                    style={{ padding: '0.75rem 1rem', border: '2px solid #f3f4f6', borderRadius: '1rem', background: '#f9fafb', fontWeight: 700, fontSize: '0.8rem' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="accepted">Diterima</option>
                    <option value="revision">Revisi</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                  <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition">
                    <FiDownload /> Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['No. Registrasi', 'Nama Pendaftar', 'Jurusan', 'Status', 'Aksi'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-12 text-gray-400">Memuat data...</td></tr>
                    ) : applicants.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-12 text-gray-400">Tidak ada data pendaftar</td></tr>
                    ) : applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-5 font-mono text-xs font-bold text-gray-400">{app.registration_number}</td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-emerald-950">{app.full_name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{app.email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black">
                            {app.major_choice || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5"><StatusBadge status={app.registration_status} /></td>
                        <td className="px-6 py-5">
                          <button onClick={() => handleViewDetail(app.id)} className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all">
                            <FiEye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-emerald-950">Kelola Berita & Pengumuman</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Publikasikan artikel untuk calon siswa</p>
                </div>
                <button
                  onClick={() => handleOpenAnnModal()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-2xl font-bold text-sm hover:bg-emerald-800 transition shadow-lg shadow-emerald-900/20"
                >
                  <FiPlus /> Buat Artikel Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcementLoading ? (
                  <div className="col-span-full text-center py-20 text-gray-400 font-bold">Memuat artikel...</div>
                ) : announcements.length === 0 ? (
                  <div className="col-span-full bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                    <FiMessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold text-gray-400">Belum ada artikel yang diterbitkan.</p>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                      {/* Thumbnail Preview */}
                      <div className="aspect-video bg-emerald-50 relative overflow-hidden">
                        {ann.thumbnail ? (
                          <img src={ann.thumbnail} alt={ann.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200">
                            <FiImage size={48} className="mb-2 opacity-50" />
                            <span className="text-[10px] font-black uppercase tracking-widest">No Thumbnail</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => handleOpenAnnModal(ann)}
                            className="w-9 h-9 bg-white/90 backdrop-blur-md text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white shadow-lg transition-all"
                            title="Edit"
                          >
                            <FiEdit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="w-9 h-9 bg-white/90 backdrop-blur-md text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-lg transition-all"
                            title="Hapus"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-md">Berita</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <FiClock size={10} /> {new Date(ann.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <h4 className="font-black text-emerald-950 text-lg mb-3 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-1">
                          {ann.content}
                        </p>
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest flex items-center gap-1.5">
                            <FiUsers size={12} /> {ann.creator_name || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* KNOWLEDGE BASE TAB */}
          {activeTab === 'knowledgebase' && (
            <KnowledgeBase />
          )}

          {/* COMPLAINTS TAB */}
          {activeTab === 'complaints' && (
            <ComplaintsTab />
          )}
        </main>
      </div>

      {/* Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">Editor Artikel</h2>
                <p className="text-[10px] sm:text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Buat konten berita yang menarik</p>
              </div>
              <button onClick={() => setShowAnnModal(false)} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAnnouncement} className="p-6 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-widest ml-1">Judul Artikel</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul yang menarik..."
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-50 rounded-xl sm:rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-emerald-950 text-sm sm:text-base"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-widest ml-1">Gambar Thumbnail</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-40 aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                    {annForm.thumbnail ? (
                      <>
                        <img src={annForm.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setAnnForm({ ...annForm, thumbnail: '' })}
                          className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs"
                        >
                          Hapus Gambar
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <FiImage size={24} />
                        <span className="text-[10px] font-bold mt-1">Belum ada foto</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      id="ann-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <label 
                      htmlFor="ann-image"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition cursor-pointer border-2 border-emerald-100"
                    >
                      <FiDownload size={14} /> {annForm.thumbnail ? 'Ganti Gambar' : 'Pilih File Gambar'}
                    </label>
                    <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">* Format: JPG, PNG. Maksimal 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-widest ml-1">Atau Gunakan URL Gambar</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-50 rounded-xl sm:rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-xs sm:text-sm"
                  value={annForm.thumbnail}
                  onChange={(e) => setAnnForm({ ...annForm, thumbnail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-widest ml-1">Konten Artikel</label>
                <textarea
                  required
                  rows="6"
                  placeholder="Tulis isi berita secara lengkap di sini..."
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl sm:rounded-3xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-xs sm:text-sm resize-none"
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="order-2 sm:order-1 flex-1 px-8 py-3 sm:py-4 border-2 border-gray-100 text-gray-400 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="order-1 sm:order-2 flex-[2] btn-primary shadow-emerald-900/30 py-3 sm:py-4 text-sm sm:text-base"
                >
                  {annForm.id ? 'Simpan Perubahan' : 'Terbitkan Artikel Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-orange-50">
              <div>
                <h2 className="text-xl font-black text-orange-900">Catatan Revisi</h2>
                <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-widest">Beritahu siswa apa yang perlu diperbaiki</p>
              </div>
              <button onClick={() => setRevisionModalOpen(false)} className="w-8 h-8 bg-white text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                autoFocus
                rows="4"
                placeholder="Contoh: Foto Kartu Keluarga kurang jelas, mohon diupload ulang..."
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                value={revisionMessage}
                onChange={(e) => setRevisionMessage(e.target.value)}
              ></textarea>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRevisionModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-100 text-gray-400 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-600 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (!revisionMessage.trim()) return toast.error('Pesan revisi tidak boleh kosong');
                    handleUpdateStatus(applicantToRevise, 'revision', revisionMessage);
                  }}
                  className="flex-[2] px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all text-sm"
                >
                  Kirim Revisi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[2rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-5 sm:p-6 border-b flex justify-between items-center bg-emerald-950 text-white shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-black line-clamp-1">{selectedApplicant.user?.full_name}</h2>
                <p className="text-[10px] sm:text-xs text-emerald-300 font-bold mt-0.5">{selectedApplicant.user?.registration_number}</p>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-white/10 rounded-xl transition">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-5 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
                <Section title="Data Pribadi" icon={<FiUsers />}>
                  {selectedApplicant.personalData ? (
                    <div className="bg-gray-50/50 rounded-2xl p-4 space-y-1">
                      <DataRow label="NISN" value={selectedApplicant.personalData.nisn} />
                      <DataRow label="NIK" value={selectedApplicant.personalData.nik} />
                      <DataRow label="Tempat, Tgl Lahir" value={`${selectedApplicant.personalData.birth_place}, ${new Date(selectedApplicant.personalData.birth_date).toLocaleDateString('id-ID')}`} />
                      <DataRow label="Alamat" value={selectedApplicant.personalData.full_address} />
                    </div>
                  ) : <p className="text-sm text-gray-400">Belum diisi</p>}
                </Section>

                <Section title="Data Sekolah" icon={<FiCheckCircle />}>
                  {selectedApplicant.schoolData ? (
                    <div className="bg-gray-50/50 rounded-2xl p-4 space-y-1">
                      <DataRow label="Asal Sekolah" value={selectedApplicant.schoolData.school_name} />
                      <DataRow label="Pilihan Jurusan" value={selectedApplicant.schoolData.major_choice} />
                      <DataRow label="Nilai Rata-rata" value={selectedApplicant.schoolData.average_score} />
                      <DataRow label="Tahun Lulus" value={selectedApplicant.schoolData.graduation_year} />
                    </div>
                  ) : <p className="text-sm text-gray-400">Belum diisi</p>}
                </Section>
              </div>

              <Section title="Dokumen Pendukung" icon={<FiDownload />}>
                {selectedApplicant.documents?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {selectedApplicant.documents.map((doc, i) => {
                      const fileUrl = `${BACKEND_URL}/${doc.file_path}`;
                      const isImage = /\.(jpg|jpeg|png)$/i.test(doc.file_name || '');
                      const isPDF = /\.pdf$/i.test(doc.file_name || '');
                      const fileSizeKB = doc.file_size ? (doc.file_size / 1024).toFixed(0) + ' KB' : '';
                      return (
                        <div key={i} className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden hover:border-emerald-400 transition-all group">
                          {/* Preview */}
                          <div className="bg-emerald-50 h-24 flex items-center justify-center relative">
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={doc.document_type}
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                              />
                            ) : null}
                            <div className={`flex-col items-center justify-center h-full ${isImage ? 'hidden' : 'flex'}`}>
                              {isPDF ? <FiFile size={28} className="text-red-400" /> : <FiImage size={28} className="text-gray-400" />}
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-3">
                            <p className="text-[9px] sm:text-[10px] font-black text-emerald-800 uppercase tracking-wider truncate">
                              {DOC_LABELS[doc.document_type] || doc.document_type}
                            </p>
                            <div className="flex gap-1 mt-2">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition"
                              >
                                <FiExternalLink size={10} /> Lihat
                              </a>
                              <a
                                href={fileUrl}
                                download={doc.file_name}
                                className="flex-1 flex items-center justify-center gap-1 text-[9px] font-bold bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition"
                              >
                                <FiDownload size={10} /> Unduh
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiFile size={36} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">Belum ada dokumen yang diunggah.</p>
                  </div>
                )}
              </Section>
            </div>

            <div className="p-5 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status:</span>
                <StatusBadge status={selectedApplicant.user?.registration_status} />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => handleUpdateStatus(selectedApplicant.user.id, 'revision')} className="flex-1 sm:flex-none px-4 py-2.5 border-2 border-orange-300 text-orange-600 rounded-xl sm:rounded-2xl hover:bg-orange-50 font-bold text-xs transition">
                  Revisi
                </button>
                <button onClick={() => handleUpdateStatus(selectedApplicant.user.id, 'rejected')} className="flex-1 sm:flex-none px-4 py-2.5 border-2 border-red-300 text-red-600 rounded-xl sm:rounded-2xl hover:bg-red-50 font-bold text-xs transition">
                  Tolak
                </button>
                <button onClick={() => handleUpdateStatus(selectedApplicant.user.id, 'accepted')} className="flex-[2] sm:flex-none px-6 py-2.5 bg-emerald-700 text-white rounded-xl sm:rounded-2xl hover:bg-emerald-800 shadow-lg font-bold text-xs transition">
                  Terima Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', num: 'text-emerald-950' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   num: 'text-amber-950' },
    green:   { bg: 'bg-green-50',   text: 'text-green-700',   num: 'text-green-950' },
    orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  num: 'text-orange-950' },
  };
  const c = colors[color] || colors.emerald;
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className={`w-12 h-12 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center text-xl mb-4`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <h4 className={`text-4xl font-black mt-1 ${c.num}`}>{value ?? '—'}</h4>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    revision: 'bg-orange-100 text-orange-700',
  };
  const labels = { pending: 'Menunggu', accepted: 'Diterima', rejected: 'Ditolak', revision: 'Perlu Revisi' };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

const DataRow = ({ label, value }) => (
  <div className="flex justify-between items-start border-b border-gray-50 py-2 gap-4">
    <span className="text-xs text-gray-400 font-bold flex-shrink-0">{label}</span>
    <span className="text-xs font-bold text-emerald-950 text-right">{value || '—'}</span>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div>
    <h3 className="font-black text-emerald-950 mb-4 flex items-center gap-2 text-sm">
      <span className="text-emerald-600">{icon}</span> {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

export default AdminDashboard;
