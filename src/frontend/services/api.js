import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add bearer token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cookconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: extract response payload or error message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Auto logout on 401 if token was present
    if (error.response?.status === 401) {
      if (localStorage.getItem('cookconnect_token')) {
        localStorage.removeItem('cookconnect_token');
        localStorage.removeItem('cookconnect_user');
      }
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

export default api;

