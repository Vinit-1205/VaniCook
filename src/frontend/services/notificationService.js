import api from './api.js';

export const notificationService = {
  /**
   * Get current user's notifications
   */
  async getNotifications(limit = 20) {
    const res = await api.get(`/notifications?limit=${limit}`);
    return res.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId) {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};

export default notificationService;

