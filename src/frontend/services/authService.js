import api from './api.js';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data?.token) {
      localStorage.setItem('cookconnect_token', res.data.token);
      localStorage.setItem('cookconnect_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('cookconnect_token', res.data.token);
      localStorage.setItem('cookconnect_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('cookconnect_token');
      localStorage.removeItem('cookconnect_user');
    }
  },

  async updateProfile(profileData) {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },

  async getAdminStats() {
    const res = await api.get('/users/admin/stats');
    return res.data;
  },
};

