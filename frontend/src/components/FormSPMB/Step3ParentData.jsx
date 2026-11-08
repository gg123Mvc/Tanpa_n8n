import React from 'react';
import { useFormStore } from '../../context/store';
import toast from 'react-hot-toast';
import { FiUsers, FiHeart, FiShield, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const Step3ParentData = ({ onNext, onPrev }) => {
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
    if (!formData.father_name?.trim()) newErrors.father_name = 'Nama ayah harus diisi';
    if (!formData.mother_name?.trim()) newErrors.mother_name = 'Nama ibu harus diisi';
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

  const educationOptions = ['SD', 'SMP', 'SMA', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3'];

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3">
            <FiUsers /> DATA KELUARGA
          </div>
          <h2 className="text-3xl font-bold text-emerald-950">Informasi Orang Tua / Wali</h2>
          <p className="text-gray-500 mt-2">Data ini digunakan untuk keperluan administrasi dan kontak darurat.</p>
        </div>

        <form className="space-y-12">
          {/* Ayah */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <FiUsers />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Data Ayah Kandung</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label>Nama Lengkap Ayah <span className="text-red-500">*</span></label>
                <input
                  name="father_name"
                  value={formData.father_name || ''}
                  onChange={handleInputChange}
                  className={errors.father_name ? 'ring-2 ring-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <label>Pekerjaan Ayah</label>
                <input name="father_occupation" value={formData.father_occupation || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label>Pendidikan Ayah</label>
                <select name="father_education" value={formData.father_education || ''} onChange={handleInputChange}>
                  <option value="">Pilih Pendidikan</option>
                  {educationOptions.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Ibu */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <FiHeart />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Data Ibu Kandung</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label>Nama Lengkap Ibu <span className="text-red-500">*</span></label>
                <input
                  name="mother_name"
                  value={formData.mother_name || ''}
                  onChange={handleInputChange}
                  className={errors.mother_name ? 'ring-2 ring-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <label>Pekerjaan Ibu</label>
                <input name="mother_occupation" value={formData.mother_occupation || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label>Pendidikan Ibu</label>
                <select name="mother_education" value={formData.mother_education || ''} onChange={handleInputChange}>
                  <option value="">Pilih Pendidikan</option>
                  {educationOptions.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Wali */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                <FiShield />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Data Wali (Opsional)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input name="guardian_name" placeholder="Nama Wali" value={formData.guardian_name || ''} onChange={handleInputChange} />
              <input name="guardian_phone" placeholder="No. WhatsApp Wali" value={formData.guardian_phone || ''} onChange={handleInputChange} />
            </div>
          </section>

          <div className="space-y-2 pt-6">
            <label>Alamat Orang Tua / Wali</label>
            <textarea
              name="parent_address"
              value={formData.parent_address || ''}
              onChange={handleInputChange}
              rows="3"
              placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Desa, Kec, Kota"
            />
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

export default Step3ParentData;
