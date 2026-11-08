import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../context/store';
import { isValidNISN, isValidNIK } from '../../utils/validation';
import toast from 'react-hot-toast';
import { FiSave, FiUser, FiMapPin, FiCalendar, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const Step2PersonalData = ({ onNext, onPrev }) => {
  const { formData, updateFormData, setErrors, errors, addSavedStep } = useFormStore();
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 5000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    if (!formData.nisn || !formData.nik) return;
    setAutoSaving(true);
    try {
      setLastSaved(new Date().toLocaleTimeString());
      addSavedStep(2);
    } catch (error) {
      console.error('Auto save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

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
    if (!formData.nisn?.trim()) newErrors.nisn = 'NISN harus diisi';
    else if (!isValidNISN(formData.nisn)) newErrors.nisn = 'NISN harus 10 digit';
    if (!formData.nik?.trim()) newErrors.nik = 'NIK harus diisi';
    else if (!isValidNIK(formData.nik)) newErrors.nik = 'NIK harus 16 digit';
    if (!formData.full_name?.trim()) newErrors.full_name = 'Nama lengkap harus diisi';
    if (!formData.gender) newErrors.gender = 'Pilih jenis kelamin';
    if (!formData.birth_place?.trim()) newErrors.birth_place = 'Tempat lahir harus diisi';
    if (!formData.birth_date) newErrors.birth_date = 'Tanggal lahir harus diisi';
    if (!formData.religion) newErrors.religion = 'Pilih agama';
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Silakan lengkapi data wajib');
      return;
    }
    onNext();
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3">
              <FiUser /> DATA IDENTITAS
            </div>
            <h2 className="text-3xl font-bold text-emerald-950">Biodata Calon Siswa</h2>
            <p className="text-gray-500 mt-2">Pastikan data yang Anda masukkan sesuai dengan Kartu Keluarga.</p>
          </div>
          {lastSaved && (
            <div className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              TERSIMPAN: {lastSaved}
            </div>
          )}
        </div>

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label>NISN <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nisn"
                value={formData.nisn || ''}
                onChange={handleInputChange}
                placeholder="10 digit angka"
                className={errors.nisn ? 'ring-2 ring-red-500' : ''}
              />
              {errors.nisn && <p className="text-xs text-red-500 font-bold ml-1">{errors.nisn}</p>}
            </div>

            <div className="space-y-2">
              <label>NIK <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nik"
                value={formData.nik || ''}
                onChange={handleInputChange}
                placeholder="16 digit angka"
                className={errors.nik ? 'ring-2 ring-red-500' : ''}
              />
              {errors.nik && <p className="text-xs text-red-500 font-bold ml-1">{errors.nik}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label>Nama Lengkap (Sesuai Ijazah) <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap"
              className={errors.full_name ? 'ring-2 ring-red-500' : ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label>Jenis Kelamin <span className="text-red-500">*</span></label>
              <select name="gender" value={formData.gender || ''} onChange={handleInputChange}>
                <option value="">Pilih Jenis Kelamin</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label>Agama <span className="text-red-500">*</span></label>
              <select name="religion" value={formData.religion || ''} onChange={handleInputChange}>
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label>Tempat Lahir <span className="text-red-500">*</span></label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  name="birth_place"
                  value={formData.birth_place || ''}
                  onChange={handleInputChange}
                  className="pl-12"
                  placeholder="Kota Kelahiran"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label>Tanggal Lahir <span className="text-red-500">*</span></label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date || ''}
                  onChange={handleInputChange}
                  className="pl-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label>Alamat Lengkap (Domisili)</label>
            <textarea
              name="full_address"
              value={formData.full_address || ''}
              onChange={handleInputChange}
              rows="3"
              placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Desa, Kec, Kota"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
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

export default Step2PersonalData;
