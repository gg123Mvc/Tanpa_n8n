import { create } from 'zustand';

// Auth Store
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  setAuth: (user, token) =>
    set(() => ({
      user,
      token,
      isAuthenticated: !!token,
    })),

  clearAuth: () =>
    set(() => ({
      user: null,
      token: null,
      isAuthenticated: false,
    })),

  setLoading: (loading) => set(() => ({ loading })),
}));

// Form Store
export const useFormStore = create((set) => ({
  currentStep: 1,
  formData: {
    // Step 1 - Registration
    full_name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    // Step 2 - Personal Data
    nisn: '',
    nik: '',
    gender: '',
    birth_place: '',
    birth_date: '',
    religion: '',
    child_number: '',
    siblings_count: '',
    full_address: '',
    // Step 3 - Parent Data
    father_name: '',
    father_occupation: '',
    father_education: '',
    mother_name: '',
    mother_occupation: '',
    mother_education: '',
    guardian_name: '',
    guardian_phone: '',
    family_income: '',
    parent_address: '',
    // Step 4 - School Data
    school_name: '',
    npsn: '',
    school_address: '',
    graduation_year: '',
    diploma_number: '',
    average_score: '',
    major_choice: '',
    // Step 5 - Documents
    documents: [],
  },
  errors: {},
  savedSteps: new Set(),

  setCurrentStep: (step) => set(() => ({ currentStep: step })),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setErrors: (errors) => set(() => ({ errors })),

  addSavedStep: (step) =>
    set((state) => ({
      savedSteps: new Set([...state.savedSteps, step]),
    })),

  resetForm: () =>
    set(() => ({
      currentStep: 1,
      formData: {
        full_name: '',
        email: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
        nisn: '',
        nik: '',
        gender: '',
        birth_place: '',
        birth_date: '',
        religion: '',
        child_number: '',
        siblings_count: '',
        full_address: '',
        father_name: '',
        father_occupation: '',
        father_education: '',
        mother_name: '',
        mother_occupation: '',
        mother_education: '',
        guardian_name: '',
        guardian_phone: '',
        family_income: '',
        parent_address: '',
        school_name: '',
        npsn: '',
        school_address: '',
        graduation_year: '',
        diploma_number: '',
        average_score: '',
        major_choice: '',
        documents: [],
      },
      errors: {},
      savedSteps: new Set(),
    })),
}));

// Dashboard Store
export const useDashboardStore = create((set) => ({
  dashboardData: null,
  announcements: [],
  registrationStatus: null,
  loading: false,

  setDashboardData: (data) => set(() => ({ dashboardData: data })),
  setAnnouncements: (announcements) => set(() => ({ announcements })),
  setRegistrationStatus: (status) => set(() => ({ registrationStatus: status })),
  setLoading: (loading) => set(() => ({ loading })),
}));

// AI Agent Store
export const useAIAgentStore = create((set) => ({
  chatHistory: [],
  loading: false,

  addMessage: (userMessage, aiResponse, timestamp, responseTimeMs) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          id: Date.now(),
          userMessage,
          aiResponse,
          timestamp: timestamp || new Date(),
          responseTimeMs: responseTimeMs,
        },
      ],
    })),

  addUserMessageOnly: (id, userMessage, timestamp) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          id,
          userMessage,
          aiResponse: null,
          timestamp: timestamp || new Date(),
        },
      ],
    })),

  updateMessageResponse: (id, aiResponse, timestamp, responseTimeMs) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((chat) =>
        chat.id === id
          ? { ...chat, aiResponse, timestamp: timestamp || chat.timestamp, responseTimeMs }
          : chat
      ),
    })),

  setChatHistory: (history) => set(() => ({ chatHistory: history })),
  setLoading: (loading) => set(() => ({ loading })),

  clearChat: () => set(() => ({ chatHistory: [] })),
}));
