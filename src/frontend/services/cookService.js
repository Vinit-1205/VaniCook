import api from './api.js';

export const cookService = {
  async discoverCooks(params = {}) {
    const res = await api.get('/cooks/discover', { params });
    return {
      cooks: res.data || [],
      pagination: res.meta || {},
    };
  },

  async getCookDetails(cookId) {
    const res = await api.get(`/cooks/${cookId}`);
    return res.data;
  },

  async getMyProfile() {
    const res = await api.get('/cooks/me');
    return res.data;
  },

  async updateMyProfile(data) {
    const res = await api.put('/cooks/me', data);
    return res.data;
  },

  async getNeighbourhoodPoolPreview(societyId) {
    const res = await api.get(`/cooks/pool-preview/${societyId}`);
    return res.data;
  },

  async getCookAvailability(cookProfileId) {
    const res = await api.get(`/availability/cook/${cookProfileId}`);
    return res.data;
  },

  async getMyAvailability() {
    const res = await api.get('/availability/me');
    return res.data;
  },

  async addAvailabilitySlot(slotData) {
    const res = await api.post('/availability', slotData);
    return res.data;
  },

  async updateAvailabilitySlot(slotId, data) {
    const res = await api.put(`/availability/${slotId}`, data);
    return res.data;
  },

  async deleteAvailabilitySlot(slotId) {
    const res = await api.delete(`/availability/${slotId}`);
    return res.data;
  },

  async getSchedule() {
    const res = await api.get('/cooks/schedule');
    return res.data;
  },

  async getCookReviews(cookId) {
    const res = await api.get(`/cooks/${cookId}/reviews`);
    return res.data;
  },
};

