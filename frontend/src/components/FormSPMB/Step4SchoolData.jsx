import React from 'react';
import { useFormStore } from '../../context/store';
import toast from 'react-hot-toast';
import { FiBookOpen, FiMap, FiAward, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const Step4SchoolData = ({ onNext, onPrev }) => {
  const { formData, updateFormData, setErrors, errors } = useFormStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.school_name?.trim()) newErrors.school_name = 'Nama sekolah harus diisi';
    if (!formData.npsn?.trim()) newErrors.npsn = 'NPSN harus diisi';
    if (!formData.graduation_year?.trim()) newErrors.graduation_year = 'Tahun lulus harus diisi';
    if (!formData.major_choice) newErrors.major_choice = 'Pilih jurusan';
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Silakan isi data wajib');
      return;
    }
    onNext();
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3">
            <FiBookOpen /> DATA AKADEMIK
          </div>
          <h2 className="text-3xl font-bold text-emerald-950">Asal Sekolah & Jurusan</h2>
          <p className="text-gray-500 mt-2">Informasi ini membantu kami menempatkan Anda di kelas yang sesuai.</p>
        </div>

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label>Nama Sekolah Asal <span className="text-red-500">*</span></label>
              <input
                name="school_name"
                value={formData.school_name || ''}
                onChange={handleInputChange}
                placeholder="Contoh: SMPN 1 Jakarta"
                className={errors.school_name ? 'ring-2 ring-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <label>NPSN Sekolah <span className="text-red-500">*</span></label>
              <input
                name="npsn"
                value={formData.npsn || ''}
                onChange={handleInputChange}
                placeholder="8 digit angka"
                className={errors.npsn ? 'ring-2 ring-red-500' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label>Alamat Sekolah Asal</label>
            <div className="relative">
              <FiMap className="absolute left-4 top-4 text-emerald-600" />
              <textarea
                name="school_address"
                value={formData.school_address || ''}
                onChange={handleInputChange}
                className="pl-12"
                rows="2"
                placeholder="Alamat Lengkap Sekolah"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label>Tahun Lulus <span className="text-red-500">*</span></label>
              <input
                name="graduation_year"
                value={formData.graduation_year || ''}
                onChange={handleInputChange}
                placeholder="Contoh: 2026"
              />
            </div>
            <div className="space-y-2">
              <label>Rata-rata Nilai Rapor</label>
              <input
                type="number"
                step="0.1"
                name="average_score"
                value={formData.average_score || ''}
                onChange={handleInputChange}
                placeholder="Contoh: 85.5"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <FiAward className="text-emerald-600" /> Pilih Jurusan yang Diminati <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'MIPA', title: 'MIPA', desc: 'Sains & Teknologi' },
                { id: 'IPS', title: 'IPS', desc: 'Sosial & Ekonomi' },
                { id: 'KEAGAMAAN', title: 'KEAGAMAAN', desc: 'Studi Islam Intensif' },
              ].map((major) => (
                <button
                  key={major.id}
                  type="button"
                  onClick={() => updateFormData({ major_choice: major.id })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                    formData.major_choice === major.id 
                    ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/10' 
                    : 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mb-3 ${formData.major_choice === major.id ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                  <div className="font-bold text-emerald-900">{major.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{major.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
            <button type="button" onClick={onPrev} className="btn-secondary flex-1">
              <FiArrowLeft /> Kembali
            </button>
            <button type="button" onClick={handleNext} className="btn-primary flex-1">
              Simpan & Lanjut <FiArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step4SchoolData;
