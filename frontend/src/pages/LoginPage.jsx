import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuthStore } from '../context/store';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiUserPlus, FiArrowLeft } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem('token', token);
        setAuth(userData, token);
        toast.success(`Selamat datang, ${userData.full_name || 'kembali'}!`);
        if (userData.role?.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/form');
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Email atau password salah';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-islamic-pattern p-6">
      <div className="max-w-md w-full animate-fadeIn">
        {/* Back button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-emerald-900 font-bold text-sm hover:translate-x-[-4px] transition-transform"
        >
          <FiArrowLeft /> Kembali ke Beranda
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 overflow-hidden border border-emerald-50">
          <div className="bg-emerald-900 p-12 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <img src="/logo_ma.jpg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-6 shadow-2xl relative z-10 border-4 border-white/10" />
            <h2 className="text-3xl font-black relative z-10 tracking-tight">Portal Siswa</h2>
            <p className="text-emerald-300 text-xs font-bold uppercase tracking-[0.2em] mt-2 relative z-10">Madrasah Aliyah Bina Cendekia</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="space-y-2">
              <label>Email Pendaftar</label>
              <div className="relative">
                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input 
                  type="email" 
                  required 
                  className="pl-14"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label>Password</label>
              <div className="relative">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input 
                  type="password" 
                  required 
                  className="pl-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full shadow-emerald-900/40"
            >
              {loading ? 'Menghubungkan...' : 'Masuk ke Portal'} <FiArrowRight />
            </button>
            
            <div className="pt-8 border-t border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest mb-4">Atau Jika Belum Punya Akun</p>
              <button 
                type="button" 
                onClick={() => navigate('/register')} 
                className="btn-secondary w-full !border-emerald-100"
              >
                <FiUserPlus /> Registrasi Akun Baru
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-10 text-xs text-gray-400 font-medium leading-relaxed">
          Sistem Penerimaan Murid Baru Online <br />
          Madrasah Aliyah Bina Cendekia &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
