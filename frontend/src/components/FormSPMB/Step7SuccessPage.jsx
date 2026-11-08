import React from 'react';
import { FiDownload, FiCheckCircle, FiClock, FiMessageSquare, FiArrowRight, FiInfo, FiPrinter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useFormStore } from '../../context/store';

const Step7SuccessPage = ({ registrationData }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { formData } = useFormStore();

  const regNumber = registrationData?.registration_number || user?.registration_number || 'SPMB-2026-XXX';
  const status = registrationData?.status || user?.registration_status || 'pending';
  const revisionNotes = registrationData?.revision_notes;
  const regDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const { setCurrentStep } = useFormStore();

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Bukti Pendaftaran SPMB - ${regNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; }
    
    .header { 
      display: flex; align-items: center; gap: 20px; 
      border-bottom: 4px solid #065f46; padding-bottom: 20px; margin-bottom: 30px;
    }
    .logo-circle { 
      width: 80px; height: 80px; border-radius: 16px; background: #065f46; 
      display: flex; align-items: center; justify-content: center; 
      color: white; font-size: 32px; font-weight: black; flex-shrink: 0;
    }
    .school-name { font-size: 22px; font-weight: 900; color: #064e3b; line-height: 1.2; }
    .school-sub { font-size: 11px; color: #6b7280; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
    
    .title-banner { 
      background: #064e3b; color: white; text-align: center; padding: 16px; 
      border-radius: 12px; margin-bottom: 24px; 
    }
    .title-banner h2 { font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
    
    .reg-card { 
      border: 2px solid #065f46; border-radius: 12px; padding: 20px; 
      text-align: center; margin-bottom: 24px; background: #f0fdf4;
    }
    .reg-label { font-size: 10px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; }
    .reg-number { font-size: 36px; font-weight: 900; color: #064e3b; font-family: monospace; letter-spacing: 4px; margin: 8px 0; }
    .reg-status { 
      display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: bold; 
      ${status === 'accepted' ? 'background: #d1fae5; color: #065f46;' : status === 'rejected' ? 'background: #fee2e2; color: #991b1b;' : status === 'revision' ? 'background: #fef3c7; color: #92400e;' : 'background: #f3f4f6; color: #374151;'}
    }
    
    .section-title { 
      font-size: 12px; font-weight: 900; color: #065f46; text-transform: uppercase; 
      letter-spacing: 2px; border-bottom: 2px solid #d1fae5; padding-bottom: 6px; margin-bottom: 12px;
    }
    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 24px; }
    .data-item { border-bottom: 1px solid #f3f4f6; padding: 6px 0; }
    .data-label { font-size: 9px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .data-value { font-size: 12px; font-weight: 700; color: #1f2937; margin-top: 2px; }
    
    .info-box { 
      background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; 
      padding: 14px; margin-bottom: 24px;
    }
    .info-box p { font-size: 11px; color: #92400e; line-height: 1.8; }
    
    .footer { 
      border-top: 2px solid #e5e7eb; padding-top: 20px; 
      display: flex; justify-content: space-between; align-items: flex-end;
    }
    .footer-left p { font-size: 10px; color: #6b7280; line-height: 1.8; }
    .sign-area { text-align: center; }
    .sign-area .sign-line { width: 160px; border-bottom: 1px solid #1f2937; margin: 50px auto 6px; }
    .sign-area p { font-size: 10px; font-weight: bold; color: #374151; }
    
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-circle">MA</div>
    <div>
      <div class="school-name">Madrasah Aliyah Bina Cendekia</div>
      <div class="school-sub">Jl. Raya Madrasah No. 123, Jawa Barat • (021) 123-4567</div>
    </div>
  </div>

  <div class="title-banner">
    <h2>Bukti Pendaftaran Penerimaan Murid Baru</h2>
    <p style="font-size:11px; margin-top:4px; opacity:0.8;">Tahun Ajaran 2026/2027</p>
  </div>

  <div class="reg-card">
    <div class="reg-label">Nomor Pendaftaran</div>
    <div class="reg-number">${regNumber}</div>
    <div class="reg-status">${status === 'accepted' ? '✅ DITERIMA' : status === 'rejected' ? '❌ DITOLAK' : status === 'revision' ? '⚠️ PERLU REVISI' : '⏳ Menunggu Verifikasi Admin'}</div>
    <div style="font-size:10px; color:#6b7280; margin-top:8px;">Diterima pada: ${regDate}</div>
  </div>

  <div class="section-title">Data Calon Siswa</div>
  <div class="data-grid">
    <div class="data-item">
      <div class="data-label">Nama Lengkap</div>
      <div class="data-value">${formData?.full_name || user?.full_name || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Email</div>
      <div class="data-value">${formData?.email || user?.email || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">NISN</div>
      <div class="data-value">${formData?.nisn || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">NIK</div>
      <div class="data-value">${formData?.nik || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Tempat, Tanggal Lahir</div>
      <div class="data-value">${formData?.birth_place || '-'}, ${formData?.birth_date || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Jenis Kelamin</div>
      <div class="data-value">${formData?.gender || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Pilihan Jurusan</div>
      <div class="data-value">${formData?.major_choice || '-'}</div>
    </div>
    <div class="data-item">
      <div class="data-label">Asal Sekolah</div>
      <div class="data-value">${formData?.school_name || '-'}</div>
    </div>
  </div>

  <div class="section-title">Informasi Penting</div>
  <div class="info-box">
    <p>
      ⚠️ <strong>Simpan bukti ini baik-baik.</strong> Nomor pendaftaran di atas diperlukan untuk keperluan selanjutnya.<br/>
      ✅ Admin akan memverifikasi berkas dalam <strong>1–3 hari kerja</strong>.<br/>
      📱 Hasil verifikasi akan dikirimkan ke <strong>WhatsApp/Email</strong> yang Anda daftarkan.<br/>
      📋 Jika diperlukan revisi, Anda akan mendapat notifikasi dan harus memperbaiki data.
    </p>
  </div>

  <div class="footer">
    <div class="footer-left">
      <p>Dicetak: ${new Date().toLocaleString('id-ID')}</p>
      <p>Sistem SPMB Online — MA Bina Cendekia</p>
      <p style="color:#065f46; font-weight:bold;">www.binacendekia.sch.id</p>
    </div>
    <div class="sign-area">
      <div class="sign-line"></div>
      <p>Panitia SPMB 2026</p>
      <p style="font-size:9px; color:#9ca3af;">MA Bina Cendekia</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="animate-fadeIn py-10 px-4 flex flex-col items-center">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 p-10 md:p-16 max-w-3xl w-full border border-emerald-50 text-center relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50/50 rounded-full translate-y-1/2 -translate-x-1/2 -z-10"></div>

        <div className="w-24 h-24 bg-emerald-700 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-900/30 animate-bounce">
          <FiCheckCircle size={48} />
        </div>

        <h1 className="text-4xl font-extrabold text-emerald-950 mb-4">
          {status === 'accepted' ? 'Selamat! Anda Diterima' : status === 'rejected' ? 'Mohon Maaf' : status === 'revision' ? 'Data Perlu Direvisi' : 'Pendaftaran Berhasil!'}
        </h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          {status === 'accepted' ? 'Selamat bergabung di MA Bina Cendekia. Silakan unduh bukti pendaftaran Anda.' : status === 'rejected' ? 'Mohon maaf, Anda belum dapat diterima di MA Bina Cendekia tahun ini.' : status === 'revision' ? 'Ada beberapa berkas atau data yang perlu diperbaiki sebelum dapat diverifikasi.' : 'Selamat! Data pendaftaran Anda telah kami terima. Silakan simpan nomor pendaftaran di bawah ini.'}
        </p>

        <div className="bg-emerald-900 text-white rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em] mb-4">Nomor Registrasi</div>
            <div className="text-4xl md:text-5xl font-black tracking-widest font-mono mb-4">
              {regNumber}
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${status === 'accepted' ? 'bg-emerald-500/20 text-emerald-100' : status === 'rejected' ? 'bg-red-500/20 text-red-100' : status === 'revision' ? 'bg-amber-500/20 text-amber-100' : 'bg-white/10'}`}>
              <FiClock /> {status === 'accepted' ? 'DITERIMA' : status === 'rejected' ? 'DITOLAK' : status === 'revision' ? 'PERLU REVISI' : 'MENUNGGU VERIFIKASI ADMIN'}
            </div>
          </div>
        </div>

        {status === 'revision' && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-8 mb-10 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-amber-900 font-bold text-lg mb-2 flex items-center gap-2"><FiMessageSquare /> Pesan Revisi dari Admin</h3>
            <p className="text-amber-800 bg-amber-100/50 p-4 rounded-xl text-sm italic mb-4">
              "{revisionNotes?.revision_message || 'Mohon perbaiki data pendaftaran Anda sesuai ketentuan yang berlaku.'}"
            </p>
            <button onClick={() => setCurrentStep(2)} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
              Perbaiki Data Sekarang <FiArrowRight />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-50 text-left">
            <div className="font-bold text-emerald-950 text-sm mb-2 flex items-center gap-2">
              <FiInfo className="text-emerald-600" /> Langkah Selanjutnya
            </div>
            <ul className="text-[10px] text-emerald-800 space-y-2 font-medium">
              <li>• Admin memverifikasi dokumen (1–3 hari kerja)</li>
              <li>• Pengumuman hasil via WhatsApp/Email</li>
              <li>• Wawancara & Tes Baca Tulis Al-Qur'an</li>
            </ul>
          </div>
          <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 text-left">
            <div className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-2">
              <FiMessageSquare className="text-amber-600" /> Butuh Bantuan?
            </div>
            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
              Gunakan fitur Chat AI di pojok kanan bawah atau hubungi admin via WhatsApp di 0812-3456-7890.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleDownloadPDF} className="btn-primary flex-1 shadow-emerald-900/30">
            <FiPrinter /> Cetak / Download PDF
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary flex-1">
            Kembali ke Beranda <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step7SuccessPage;
