import React, { useState } from 'react';
import { useFormStore } from '../../context/store';
import { formatFileSize } from '../../utils/validation';
import { FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiSend, FiFileText, FiUser, FiHome, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Step6ReviewConfirmation = ({ onNext, onPrev, loading }) => {
  const { formData } = useFormStore();
  const [agree, setAgree] = useState(false);

  const handleSubmit = () => {
    if (!agree) {
      toast.error('Harap setujui pernyataan kebenaran data');
      return;
    }
    onNext();
  };

  const SummaryCard = ({ icon, title, data }) => (
    <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-50 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-emerald-700 text-white rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-emerald-900 uppercase tracking-wider text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {Object.entries(data).map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] font-bold text-emerald-600/60 uppercase">{label}</div>
            <div className="text-sm font-semibold text-emerald-950 truncate">{value || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3">
            <FiCheckCircle /> FINAL CHECK
          </div>
          <h2 className="text-3xl font-bold text-emerald-950">Ringkasan Pendaftaran</h2>
          <p className="text-gray-500 mt-2">Mohon periksa kembali seluruh data Anda sebelum dikirimkan ke panitia.</p>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
          <SummaryCard 
            icon={<FiUser />} 
            title="Identitas Diri" 
            data={{
              'Nama Lengkap': formData.full_name,
              'NISN': formData.nisn,
              'NIK': formData.nik,
              'Jenis Kelamin': formData.gender,
              'TTL': `${formData.birth_place}, ${formData.birth_date}`,
              'Agama': formData.religion,
            }} 
          />

          <SummaryCard 
            icon={<FiHome />} 
            title="Orang Tua / Wali" 
            data={{
              'Nama Ayah': formData.father_name,
              'Nama Ibu': formData.mother_name,
              'Wali': formData.guardian_name,
              'Kontak Wali': formData.guardian_phone,
            }} 
          />

          <SummaryCard 
            icon={<FiBook />} 
            title="Sekolah & Jurusan" 
            data={{
              'Asal Sekolah': formData.school_name,
              'Tahun Lulus': formData.graduation_year,
              'Jurusan Pilihan': formData.major_choice,
              'Nilai Rata-rata': formData.average_score,
            }} 
          />

          <div className="bg-emerald-900 text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiFileText /> Dokumen Terlampir
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.documents?.map((doc, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                  <FiCheckCircle className="mx-auto mb-2 text-emerald-400" />
                  <div className="text-[10px] font-bold uppercase truncate">{doc.type.replace(/_/g, ' ')}</div>
                  <div className="text-[8px] opacity-60 truncate">{doc.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 relative group transition-all hover:bg-emerald-100/50">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 w-6 h-6 rounded-lg border-emerald-200 text-emerald-700 focus:ring-emerald-500 transition-all cursor-pointer"
              />
              <div className="space-y-1">
                <p className="font-bold text-emerald-950">Konfirmasi Kebenaran Data</p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Dengan mencentang kotak ini, saya menyatakan bahwa seluruh data yang telah saya isi adalah benar dan dapat dipertanggungjawabkan. Saya mengerti bahwa ketidaksesuaian data dapat mengakibatkan pembatalan pendaftaran.
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="button" onClick={onPrev} className="btn-secondary flex-1">
              <FiArrowLeft /> Kembali ke Berkas
            </button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={!agree || loading}
              className="btn-primary flex-1 !bg-emerald-700 hover:!bg-emerald-800 shadow-emerald-900/40"
            >
              {loading ? 'Sedang Mengirim...' : 'Submit Pendaftaran'} <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6ReviewConfirmation;
