import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowLeft, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useFormStore } from '../../context/store';
import { isValidEmail, isValidWhatsApp, isStrongPassword } from '../../utils/validation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Step1Registration = ({ onNext, loading }) => {
  const { formData, updateFormData, setErrors, errors } = useFormStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    if (!formData.full_name?.trim()) newErrors.full_name = 'Nama lengkap harus diisi';
    if (!formData.email?.trim()) newErrors.email = 'Email harus diisi';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.whatsapp?.trim()) newErrors.whatsapp = 'WhatsApp harus diisi';
    else if (!isValidWhatsApp(formData.whatsapp)) newErrors.whatsapp = 'Format tidak valid (0812...)';
    if (!formData.password?.trim()) newErrors.password = 'Password harus diisi';
    else if (!isStrongPassword(formData.password)) newErrors.password = 'Minimal 8 karakter';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Harap lengkapi form dengan benar');
      return;
    }
    onNext();
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20">
            <FiUser size={32} />
          </div>
          <h2 className="text-3xl font-bold text-emerald-950">Buat Akun SPMB</h2>
          <p className="text-gray-500 mt-2">Daftarkan diri Anda untuk memulai pengisian formulir</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label>Nama Lengkap</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleInputChange}
                className={`pl-12 ${errors.full_name ? 'ring-2 ring-red-500' : ''}`}
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label>Email Aktif</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={`pl-12 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="email@gmail.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label>No. WhatsApp</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleInputChange}
                  className={`pl-12 ${errors.whatsapp ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="08123456789"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label>Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  className={`pl-12 pr-12 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label>Konfirmasi Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword || ''}
                  onChange={handleInputChange}
                  className={`pl-12 ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="Ulangi password"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="btn-secondary flex-1"
            >
              <FiArrowLeft /> Batal
            </button>
            <button 
              type="button" 
              onClick={handleNext} 
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'} <FiArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step1Registration;
