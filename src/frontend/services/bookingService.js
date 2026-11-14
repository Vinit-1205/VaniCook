import api from './api.js';

export const bookingService = {
  async createBooking(bookingData) {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  async getCustomerBookings() {
    const res = await api.get('/bookings/customer');
    return res.data;
  },

  async getCookBookings() {
    const res = await api.get('/bookings/cook');
    return res.data;
  },

  async updateBookingStatus(bookingId, status) {
    const res = await api.patch(`/bookings/${bookingId}/status`, { status });
    return res.data;
  },

  async createReview(reviewData) {
    const res = await api.post('/bookings/reviews', reviewData);
    return res.data;
  },
};

