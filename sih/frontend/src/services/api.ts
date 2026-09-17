import axios from 'axios';

export const api = axios.create({
  baseURL: '', // Handled by Vite proxy or relative path
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ruraleye_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Demo login credentials
export const DEMO_CREDENTIALS = {
  healthcare_worker: { email: 'asha@ruraleye.org', password: 'demo123', name: 'Priya Selvam (ASHA)', role: 'Healthcare Worker' },
  doctor: { email: 'doctor@ruraleye.org', password: 'demo123', name: 'Dr. K. Ramanathan, MD', role: 'Ophthalmologist' },
  admin: { email: 'admin@ruraleye.org', password: 'demo123', name: 'State Health Nodal Officer', role: 'Admin' },
};

// API Services
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('ruraleye_token', res.data.access_token);
      localStorage.setItem('ruraleye_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('ruraleye_token');
    localStorage.removeItem('ruraleye_user');
  },
  getCurrentUser: () => {
    const u = localStorage.getItem('ruraleye_user');
    return u ? JSON.parse(u) : DEMO_CREDENTIALS.healthcare_worker;
  },
};

export const patientService = {
  getPatients: async (search?: string, filter?: string) => {
    const res = await api.get('/api/patients', { params: { search, filter } });
    return res.data;
  },
  getPatient: async (id: string) => {
    const res = await api.get(`/api/patients/${id}`);
    return res.data;
  },
  createPatient: async (patientData: any) => {
    const res = await api.post('/api/patients', patientData);
    return res.data;
  },
  getPatientHistory: async (id: string) => {
    const res = await api.get(`/api/patients/${id}/history`);
    return res.data;
  },
};

export const screeningService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/screening/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  checkQuality: async (filename: string) => {
    const res = await api.post('/api/screening/quality', { filename });
    return res.data;
  },
  enhanceImage: async (filename: string) => {
    const res = await api.post('/api/screening/enhance', { filename });
    return res.data;
  },
  predictDR: async (filename: string, patient_id: string, override: boolean = false) => {
    const res = await api.post('/api/screening/predict', { filename, patient_id, override });
    return res.data;
  },
  explainAndFinalize: async (filename: string, patient_id: string, override: boolean = false) => {
    const res = await api.post('/api/screening/explain', { filename, patient_id, override });
    return res.data;
  },
  getScreening: async (id: string) => {
    const res = await api.get(`/api/screening/${id}`);
    return res.data;
  },
};

export const doctorService = {
  getPending: async () => {
    const res = await api.get('/api/doctor/pending');
    return res.data;
  },
  submitReview: async (reviewData: {
    screening_id: string;
    doctor_assessment_class: number;
    status: string;
    notes?: string;
    recommendation?: string;
  }) => {
    const res = await api.post('/api/doctor/review', reviewData);
    return res.data;
  },
};

export const reportService = {
  generateReport: async (screening_id: string) => {
    const res = await api.post('/api/reports/generate', { screening_id });
    return res.data;
  },
  getReports: async () => {
    const res = await api.get('/api/reports');
    return res.data;
  },
  getReport: async (id: string) => {
    const res = await api.get(`/api/reports/${id}`);
    return res.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/api/dashboard/stats');
    return res.data;
  },
};
