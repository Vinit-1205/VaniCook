import api from './api.js';

export const pricingService = {
  /**
   * Calculate dynamic shared pool pricing
   */
  async calculatePoolPrice(params) {
    const res = await api.post('/pricing/calculate', params);
    return res.data;
  },
};

export default pricingService;

