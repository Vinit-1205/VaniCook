import api from './api.js';

export const locationService = {
  async getSocieties(search = '') {
    const res = await api.get('/locations/societies', { params: { search } });
    return res.data;
  },

  async getSocietyDetails(id) {
    const res = await api.get(`/locations/societies/${id}`);
    return res.data;
  },

  async getMyLocations() {
    const res = await api.get('/locations/my-locations');
    return res.data;
  },

  async addHouseholdLocation(locationData) {
    const res = await api.post('/locations/my-locations', locationData);
    return res.data;
  },

  async updateHouseholdLocation(id, data) {
    const res = await api.put(`/locations/my-locations/${id}`, data);
    return res.data;
  },

  async deleteHouseholdLocation(id) {
    const res = await api.delete(`/locations/my-locations/${id}`);
    return res.data;
  },
};

