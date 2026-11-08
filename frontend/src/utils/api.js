import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Form API
export const formAPI = {
  savePersonalData: (data) => api.post('/form/personal-data', data),
  getPersonalData: () => api.get('/form/personal-data'),
  saveParentData: (data) => api.post('/form/parent-data', data),
  getParentData: () => api.get('/form/parent-data'),
  saveSchoolData: (data) => api.post('/form/school-data', data),
  getSchoolData: () => api.get('/form/school-data'),
  getAllData: () => api.get('/form/all-data'),
};

// Document API
export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getList: () => api.get('/documents/list'),
  delete: (documentId) => api.delete(`/documents/${documentId}`),
  submit: (data) => api.post('/documents/submit', data),
  getStatus: () => api.get('/documents/status'),
};

// AI Agent API
export const aiAgentAPI = {
  sendMessage: (message, history) => api.post('/ai-agent/message', { message, history }),
  getHistory: () => api.get('/ai-agent/history'),
  clearHistory: () => api.delete('/ai-agent/history'),
  // GPS-based distance calculation (coordinates from browser Geolocation API only)
  calculateDistance: (userLat, userLon, accuracy) => api.post('/ai-agent/calculate-distance', { userLat, userLon, accuracy }),
};

// Dashboard API
export const dashboardAPI = {
  getData: () => api.get('/dashboard/data'),
  getAnnouncements: () => api.get('/dashboard/announcements'),
  getAnnouncementDetail: (id) => api.get(`/dashboard/announcements/${id}`),
  editData: (data) => api.put('/dashboard/edit', data),
  downloadCertificate: () => api.get('/dashboard/certificate'),
};

// Admin API
export const adminAPI = {
  login: (data) => api.post('/auth/admin-login', data),
  getStats: () => api.get('/admin/stats'),
  getApplicants: (params) => api.get('/admin/applicants', { params }),
  getApplicantDetail: (id) => api.get(`/admin/applicants/${id}`),
  updateStatus: (id, data) => api.put(`/admin/applicants/${id}/status`, data),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  uploadAnnouncementImage: (formData) => api.post('/admin/announcements/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  
  // Knowledge Base API
  getKnowledgeBase: () => api.get('/admin/knowledge-base'),
  createKnowledgeBase: (data) => api.post('/admin/knowledge-base', data),
  updateKnowledgeBase: (id, data) => api.put(`/admin/knowledge-base/${id}`, data),
  deleteKnowledgeBase: (id) => api.delete(`/admin/knowledge-base/${id}`),
  toggleKnowledgeBaseStatus: (id, status) => api.patch(`/admin/knowledge-base/${id}/status`, { status }),

  // Complaints API
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  getComplaintDetail: (id) => api.get(`/admin/complaints/${id}`),
  updateComplaintStatus: (id, data) => api.put(`/admin/complaints/${id}/status`, data),
  deleteComplaint: (id) => api.delete(`/admin/complaints/${id}`),
};

export default api;
