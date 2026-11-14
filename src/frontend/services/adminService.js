import api from './api.js';

export const adminService = {
  /**
   * Get platform statistics
   */
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  /**
   * Get all cook partners for review
   */
  async getCooks() {
    const res = await api.get('/admin/cooks');
    return res.data;
  },

  /**
   * Approve or reject cook verification
   */
  async verifyCook(cookProfileId, isVerified) {
    const res = await api.patch(`/admin/cooks/${cookProfileId}/verify`, { isVerified });
    return res.data;
  },

  /**
   * Get users with optional role filter
   */
  async getUsers(role) {
    const url = role ? `/admin/users?role=${role}` : '/admin/users';
    const res = await api.get(url);
    return res.data;
  },

  /**
   * Suspend or reactivate user account
   */
  async setUserStatus(userId, isActive) {
    const res = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },

  /**
   * Get all bookings across the platform
   */
  async getBookings() {
    const res = await api.get('/admin/bookings');
    return res.data;
  },

  /**
   * Get all pools across the platform
   */
  async getPools() {
    const res = await api.get('/admin/pools');
    return res.data;
  },
};

export default adminService;

