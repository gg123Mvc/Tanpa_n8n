import React, { useState } from 'react';
import { adminAPI } from '../../utils/api';
import { useAuthStore } from '../../context/store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@madrasah.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminAPI.login({ email, password });
      if (response.data.success) {
        const { token, ...adminData } = response.data.data;
        localStorage.setItem('token', token);
        setAuth(adminData, token);
        toast.success('Selamat datang, Admin!');
        onLoginSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-pattern flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-fadeIn">

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-emerald-900 font-bold text-sm hover:translate-x-[-4px] transition-transform"
        >
          <FiArrowLeft /> Kembali ke Beranda
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 overflow-hidden border border-emerald-50">
          {/* Header */}
          <div className="bg-emerald-950 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            
            {/* Islamic Geometric Accent */}
            <div className="absolute top-4 left-4 w-16 h-16 border border-emerald-800 rounded-2xl rotate-12 opacity-30"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 border border-emerald-800 rounded-xl rotate-45 opacity-20"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-emerald-800/50 backdrop-blur-md border border-emerald-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <FiShield size={36} className="text-emerald-300" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Portal Admin</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-2">Madrasah Aliyah Bina Cendekia</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="space-y-2">
              <label>Email Administrator</label>
              <div className="relative">
                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                <input
                  type="email"
                  required
                  className="pl-14"
                  placeholder="admin@madrasah.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label>Password</label>
              <div className="relative">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="pl-14 pr-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-50">
              <p className="text-[10px] text-emerald-700 font-bold text-center uppercase tracking-widest">
                🔒 Akses Terbatas — Khusus Administrator
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memverifikasi...
                </>
              ) : (
                <><FiShield /> Masuk Dashboard Admin</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Sistem SPMB MA Bina Cendekia &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
