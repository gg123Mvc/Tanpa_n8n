import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiDownload, FiMessageSquare, FiEye, 
  FiRefreshCw, FiClock, FiAlertCircle, FiCheckCircle, FiX
} from 'react-icons/fi';

const ComplaintsTab = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Form Update Status
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, dateFilter]);

  const fetchComplaints = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await adminAPI.getComplaints({ 
        search, 
        status: statusFilter, 
        category: categoryFilter, 
        date: dateFilter 
      });
      if (response.data.success) {
        setComplaints(response.data.data.complaints);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pengaduan');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setDateFilter('');
    // State updates are async, so we'll fetch manually to be sure it resets immediately
    setTimeout(() => {
      adminAPI.getComplaints().then(res => {
        if (res.data.success) {
          setComplaints(res.data.data.complaints);
          setStats(res.data.data.stats);
        }
      });
    }, 50);
  };

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    try {
      const response = await adminAPI.getComplaintDetail(id);
      if (response.data.success) {
        const data = response.data.data;
        setSelectedComplaint(data);
        setUpdateStatus(data.status);
        setAdminNote(data.admin_note || '');
      }
    } catch (error) {
      toast.error('Gagal mengambil detail pengaduan');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.updateComplaintStatus(selectedComplaint.id, {
        status: updateStatus,
        admin_note: adminNote
      });
      if (response.data.success) {
        toast.success('Status pengaduan berhasil diperbarui');
        fetchComplaints(); // refresh table and stats
        handleViewDetail(selectedComplaint.id); // refresh modal data (logs etc)
      }
    } catch (error) {
      toast.error('Gagal mengupdate status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengaduan ini?')) return;
    try {
      const response = await adminAPI.deleteComplaint(id);
      if (response.data.success) {
        toast.success('Pengaduan dihapus');
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (error) {
      toast.error('Gagal menghapus pengaduan');
    }
  };

  const statusOptions = ['Menunggu', 'Diproses', 'Menunggu Konfirmasi Pengguna', 'Selesai', 'Ditolak'];
  const categoryOptions = ['Login', 'Registrasi', 'Upload Dokumen', 'Pembayaran', 'Data Pendaftaran', 'Website', 'AI Agent', 'Jadwal', 'Informasi', 'Kritik', 'Saran', 'Lainnya'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stat Cards */}
      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard title="Total" value={stats.total} icon={<FiMessageSquare />} color="gray" />
          <StatCard title="Hari Ini" value={stats.today} icon={<FiClock />} color="emerald" />
          <StatCard title="Menunggu" value={stats.pending} icon={<FiAlertCircle />} color="amber" />
          <StatCard title="Diproses" value={stats.processing} icon={<FiRefreshCw />} color="blue" />
          <StatCard title="Selesai" value={stats.completed} icon={<FiCheckCircle />} color="green" />
          <StatCard title="Ditolak" value={stats.rejected} icon={<FiX />} color="red" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap gap-4 items-center">
            <form onSubmit={fetchComplaints} className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Nomor Tiket / Nama..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <select
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white font-bold text-gray-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white font-bold text-gray-600"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input
              type="date"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white font-bold text-gray-600"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button 
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No', 'No. Tiket', 'Tanggal', 'Pengguna', 'Kategori', 'Prioritas', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-400 font-bold">Memuat data...</td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-400 font-bold">Tidak ada data pengaduan</td></tr>
              ) : complaints.map((c, idx) => (
                <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-700">{c.ticket_number}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                    {new Date(c.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-emerald-950 text-sm">{c.full_name || 'Guest'}</div>
                    <div className="text-[10px] text-gray-400">{c.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600">{c.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      c.priority === 'High' ? 'text-red-500' : c.priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4"><ComplaintBadge status={c.status} /></td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewDetail(c.id)}
                      className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all shadow-sm"
                    >
                      <FiEye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-black text-emerald-950">Detail Pengaduan</h2>
                <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{selectedComplaint.ticket_number}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="w-10 h-10 bg-white text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {detailLoading ? (
                <div className="text-center py-12 text-gray-400 font-bold">Memuat detail...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Info & History */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h3 className="font-black text-sm text-emerald-950 mb-4 uppercase tracking-widest">Informasi Pengguna</h3>
                      <div className="space-y-3 text-sm">
                        <div><span className="text-gray-400 text-xs block mb-1">Nama:</span> <span className="font-bold text-gray-800">{selectedComplaint.full_name || 'Guest'}</span></div>
                        <div><span className="text-gray-400 text-xs block mb-1">Email:</span> <span className="font-bold text-gray-800">{selectedComplaint.email || '-'}</span></div>
                        <div><span className="text-gray-400 text-xs block mb-1">Dibuat:</span> <span className="font-bold text-gray-800">{new Date(selectedComplaint.created_at).toLocaleString('id-ID')}</span></div>
                        <div><span className="text-gray-400 text-xs block mb-1">Kategori:</span> <span className="font-bold text-gray-800">{selectedComplaint.category}</span></div>
                        <div><span className="text-gray-400 text-xs block mb-1">Prioritas:</span> <span className={`font-bold ${selectedComplaint.priority === 'High' ? 'text-red-600' : 'text-gray-800'}`}>{selectedComplaint.priority}</span></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h3 className="font-black text-sm text-emerald-950 mb-4 uppercase tracking-widest">Riwayat Penanganan</h3>
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {selectedComplaint.logs && selectedComplaint.logs.length > 0 ? (
                          selectedComplaint.logs.map((log) => (
                            <div key={log.id} className="border-l-2 border-emerald-200 pl-3 pb-1">
                              <ComplaintBadge status={log.status} />
                              <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(log.handled_at).toLocaleString('id-ID')} - {log.handled_by}</p>
                              {log.admin_note && <p className="text-xs text-gray-700 mt-2 italic bg-white p-2 rounded-lg border border-gray-100">{log.admin_note}</p>}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">Belum ada riwayat</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complaint Content & Action */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100">
                      <h3 className="font-black text-sm text-emerald-900 mb-2 uppercase tracking-widest">Isi Pengaduan</h3>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedComplaint.complaint}</p>
                      
                      <div className="mt-4 pt-4 border-t border-emerald-100">
                        <h4 className="font-bold text-[10px] text-emerald-600 uppercase tracking-widest mb-1">Ringkasan AI:</h4>
                        <p className="text-xs text-emerald-800 font-medium">{selectedComplaint.summary}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveStatus} className="bg-white border-2 border-gray-100 rounded-3xl p-6">
                      <h3 className="font-black text-sm text-gray-800 mb-4 uppercase tracking-widest">Update Penanganan</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-2">Ubah Status</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none text-sm bg-gray-50 font-bold text-gray-700"
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value)}
                          >
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-2">Catatan Admin (Dibaca oleh AI/User)</label>
                          <textarea
                            rows="4"
                            placeholder="Contoh: Dokumen sudah diverifikasi, silakan login kembali."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none text-sm bg-gray-50 font-medium resize-none"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                          ></textarea>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedComplaint.id)}
                            className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all text-sm"
                          >
                            Hapus
                          </button>
                          <div className="flex-1"></div>
                          <button
                            type="submit"
                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all text-sm"
                          >
                            Simpan Perubahan
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    num: 'text-blue-950' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',     num: 'text-red-950' },
    gray:    { bg: 'bg-gray-100',   text: 'text-gray-600',    num: 'text-gray-900' },
  };
  const c = colors[color] || colors.emerald;
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className={`w-10 h-10 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center text-lg mb-3`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <h4 className={`text-2xl font-black mt-1 ${c.num}`}>{value ?? '—'}</h4>
    </div>
  );
};

const ComplaintBadge = ({ status }) => {
  const styles = {
    'Menunggu': 'bg-amber-100 text-amber-700',
    'Diproses': 'bg-blue-100 text-blue-700',
    'Menunggu Konfirmasi Pengguna': 'bg-purple-100 text-purple-700',
    'Selesai': 'bg-emerald-100 text-emerald-700',
    'Ditolak': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

export default ComplaintsTab;
