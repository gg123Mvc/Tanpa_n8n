import React, { useState, useEffect } from 'react';
import { useFormStore, useAuthStore } from './context/store';
import StepIndicator from './components/FormSPMB/StepIndicator';
import Step1Registration from './components/FormSPMB/Step1Registration';
import Step2PersonalData from './components/FormSPMB/Step2PersonalData';
import Step3ParentData from './components/FormSPMB/Step3ParentData';
import Step4SchoolData from './components/FormSPMB/Step4SchoolData';
import Step5UploadDocuments from './components/FormSPMB/Step5UploadDocuments';
import Step6ReviewConfirmation from './components/FormSPMB/Step6ReviewConfirmation';
import Step7SuccessPage from './components/FormSPMB/Step7SuccessPage';
import AIAgentChat from './components/Common/AIAgentChat';
import DistanceChecker from './components/Common/DistanceChecker';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { authAPI, formAPI, documentAPI } from './utils/api';
import toast from 'react-hot-toast';
import { FiLogOut, FiNavigation } from 'react-icons/fi';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const { currentStep, setCurrentStep } = useFormStore();
  const { setAuth, user, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [restoringState, setRestoringState] = useState(false);
  const [isDistanceCheckerOpen, setIsDistanceCheckerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setIsInitializing(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        // Standardize user data (handle full_name vs fullName)
        const userData = response.data.data;
        setAuth(userData, localStorage.getItem('token'));
      }
    } catch (error) {
      localStorage.removeItem('token');
      clearAuth();
    } finally {
      setIsInitializing(false);
    }
  };

  // Restore correct step & form data after refresh
  const restoreFormState = async () => {
    setRestoringState(true);
    try {
      // 1. Check registration status
      const statusRes = await documentAPI.getStatus();
      if (statusRes.data.success) {
        const status = statusRes.data.data.registration_status;
        const regNum = statusRes.data.data.registration_number;

        // Already submitted → go to success page
        if (['pending', 'accepted', 'rejected', 'revision'].includes(status)) {
          setRegistrationData(statusRes.data.data);
          setCurrentStep(7);
          return;
        }
      }

      // 2. Load saved form data from backend and determine step
      let highestFilledStep = 2;
      const { updateFormData } = useFormStore.getState();

      try {
        const personalRes = await formAPI.getPersonalData();
        if (personalRes.data.success && personalRes.data.data) {
          updateFormData(personalRes.data.data);
          highestFilledStep = 3;
        }
      } catch {}

      try {
        const parentRes = await formAPI.getParentData();
        if (parentRes.data.success && parentRes.data.data) {
          updateFormData(parentRes.data.data);
          highestFilledStep = 4;
        }
      } catch {}

      try {
        const schoolRes = await formAPI.getSchoolData();
        if (schoolRes.data.success && schoolRes.data.data) {
          updateFormData(schoolRes.data.data);
          highestFilledStep = 5;
        }
      } catch {}

      try {
        const docsRes = await documentAPI.getList();
        if (docsRes.data.success && docsRes.data.data?.length > 0) {
          highestFilledStep = 6;
        }
      } catch {}

      setCurrentStep(highestFilledStep);
    } catch (error) {
      // If status API fails, just go to step 2
      setCurrentStep(2);
    } finally {
      setRestoringState(false);
    }
  };

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearAuth();
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin/login');
    } else {
      handleStepChange(1);
      navigate('/');
    }
  };

  const handleStep1Next = async () => {
    setLoading(true);
    try {
      const formData = useFormStore.getState().formData;
      const response = await authAPI.register({
        full_name: formData.full_name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem('token', token);
        setAuth(userData, token);
        toast.success('Akun berhasil dibuat');
        handleStepChange(2);
        navigate('/form');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const formData = useFormStore.getState().formData;
      const response = await formAPI.savePersonalData(formData);
      if (response.data.success) {
        toast.success('Data tersimpan');
        handleStepChange(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Next = async () => {
    setLoading(true);
    try {
      const formData = useFormStore.getState().formData;
      const response = await formAPI.saveParentData(formData);
      if (response.data.success) {
        toast.success('Data tersimpan');
        handleStepChange(4);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Next = async () => {
    setLoading(true);
    try {
      const formData = useFormStore.getState().formData;
      const response = await formAPI.saveSchoolData(formData);
      if (response.data.success) {
        toast.success('Data tersimpan');
        handleStepChange(5);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleStep5Next = async () => {
    const formData = useFormStore.getState().formData;
    setLoading(true);
    try {
      for (const doc of formData.documents) {
        if (doc.file) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', doc.file);
          uploadFormData.append('document_type', doc.type);
          await documentAPI.upload(uploadFormData);
        }
      }
      toast.success('Berkas terunggah');
      handleStepChange(6);
    } catch (error) {
      toast.error('Gagal mengunggah berkas');
    } finally {
      setLoading(false);
    }
  };

  const handleStep6Next = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.submit({ confirmation_agreed: true });
      if (response.data.success) {
        setRegistrationData(response.data.data);
        handleStepChange(7);
      }
    } catch (error) {
      toast.error('Gagal mengirim pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = (step) => {
    if (step > 1) handleStepChange(step - 1);
  };

  // When user lands on /form after login or refresh, restore their state
  useEffect(() => {
    if (user && location.pathname === '/form') {
      restoreFormState();
    }
  }, [user, location.pathname]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-islamic-pattern flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-900 font-black animate-pulse">MEMUAT SISTEM...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/admin/login" element={user && user.role?.includes('admin') ? <Navigate to="/admin" /> : <AdminLogin onLoginSuccess={() => navigate('/admin')} />} />
        <Route path="/admin/*" element={user && user.role?.includes('admin') ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/admin/login" />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? (user.role?.includes('admin') ? <Navigate to="/admin" /> : <Navigate to="/form" />) : <LoginPage />} />
        <Route path="/register" element={user ? (user.role?.includes('admin') ? <Navigate to="/admin" /> : <Navigate to="/form" />) : <div className="min-h-screen bg-islamic-pattern flex items-center justify-center p-6"><div className="max-w-xl w-full"><Step1Registration onNext={handleStep1Next} loading={loading} /></div></div>} />

        <Route
          path="/form"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role?.includes('admin') ? (
              <Navigate to="/admin" />
            ) : (
              <div className="min-h-screen bg-islamic-pattern">
                {/* Header */}
                <nav className="glass sticky top-0 z-50 px-6 py-4">
                  <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/logo_ma.jpg" alt="Logo" className="w-10 h-10 rounded-full shadow-lg" />
                      <div className="hidden sm:block">
                        <h1 className="text-lg font-black text-emerald-900 leading-none">SPMB 2026</h1>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Madrasah Aliyah</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-emerald-950">{user.full_name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">{user.email}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Keluar"
                      >
                        <FiLogOut size={18} />
                      </button>
                    </div>
                  </div>
                </nav>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-6 py-12">
                  {currentStep !== 7 && (
                    <div className="mb-12 glass p-6 rounded-[2rem] shadow-emerald-900/5">
                      <StepIndicator currentStep={currentStep} />
                    </div>
                  )}

                  <div className="animate-fadeIn">
                    {restoringState ? (
                      <div className="text-center py-24 glass rounded-[3rem]">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-emerald-900 font-bold">Memuat data pendaftaran Anda...</p>
                        <p className="text-xs text-emerald-600 mt-2">Sebentar ya 😊</p>
                      </div>
                    ) : (
                      <>
                        {currentStep === 2 && <Step2PersonalData onNext={handleStep2Next} onPrev={() => handlePrev(currentStep)} />}
                        {currentStep === 3 && <Step3ParentData onNext={handleStep3Next} onPrev={() => handlePrev(currentStep)} />}
                        {currentStep === 4 && <Step4SchoolData onNext={handleStep4Next} onPrev={() => handlePrev(currentStep)} />}
                        {currentStep === 5 && <Step5UploadDocuments onNext={handleStep5Next} onPrev={() => handlePrev(currentStep)} />}
                        {currentStep === 6 && <Step6ReviewConfirmation onNext={handleStep6Next} onPrev={() => handlePrev(currentStep)} loading={loading} />}
                        {currentStep === 7 && <Step7SuccessPage registrationData={registrationData} />}
                      </>
                    )}
                  </div>
                </div>

                <footer className="py-10 text-center">
                  <p className="text-[10px] text-emerald-900/40 font-bold uppercase tracking-widest">
                    &copy; 2026 MA Bina Cendekia • Sistem Informasi SPMB
                  </p>
                </footer>
              </div>
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* MAIRA AI available on landing page and form, but not on auth or admin pages */}
      {!['/login', '/register'].includes(location.pathname) && !location.pathname.startsWith('/admin') && <AIAgentChat />}

      {/* Tombol & Modal Cek Jarak - hanya di halaman publik/form, tidak di admin/auth */}
      {!['/login', '/register'].includes(location.pathname) && !location.pathname.startsWith('/admin') && (
        <>
          {/* Floating button Cek Jarak */}
          <button
            id="distance-checker-open-btn"
            onClick={() => setIsDistanceCheckerOpen(true)}
            title="Cek Jarak ke Sekolah"
            className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-bold text-xs rounded-2xl shadow-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 group"
          >
            <FiNavigation size={16} className="group-hover:text-emerald-600" />
            Cek Jarak
          </button>

          {/* Modal DistanceChecker */}
          <DistanceChecker
            isOpen={isDistanceCheckerOpen}
            onClose={() => setIsDistanceCheckerOpen(false)}
          />
        </>
      )}
    </>
  );
}

export default App;
