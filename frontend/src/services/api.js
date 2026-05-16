import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 90000, // 90s — AI analysis (PDF + Gemini Pro) can take 30-60s
});

// Attach token from storage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eduai_token');
      window.location.href = '/login';
    }
    // Preserve a proper Error so .message always works in catch blocks
    const msg = error.response?.data?.message || error.message || 'Request failed';
    const err = new Error(msg);
    err.response = error.response;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

export default api;

