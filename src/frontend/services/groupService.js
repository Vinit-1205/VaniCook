import api from './api.js';

export const groupService = {
  /**
   * List groups in society
   */
  async getGroups(societyId) {
    const url = societyId ? `/groups?societyId=${societyId}` : '/groups';
    const res = await api.get(url);
    return res.data;
  },

  /**
   * Create a neighbourhood cooking group pool
   */
  async createGroup(data) {
    const res = await api.post('/groups', data);
    return res.data;
  },

  /**
   * Find matching cooks for a pool
   */
  async getMatchingCooks(groupId) {
    const res = await api.get(`/groups/${groupId}/matching-cooks`);
    return res.data;
  },

  /**
   * Join an open group pool
   */
  async joinGroup(groupId, data = {}) {
    const res = await api.post(`/groups/${groupId}/join`, data);
    return res.data;
  },

  /**
   * Leave a group pool
   */
  async leaveGroup(groupId) {
    const res = await api.post(`/groups/${groupId}/leave`);
    return res.data;
  },

  /**
   * Assign or invite a cook to the pool
   */
  async assignCook(groupId, cookProfileId) {
    const res = await api.post(`/groups/${groupId}/assign-cook`, { cookProfileId });
    return res.data;
  },

  /**
   * Cook accepts or rejects a group pool
   */
  async respondToGroup(groupId, decision) {
    const res = await api.post(`/groups/${groupId}/respond`, { decision });
    return res.data;
  },
};

export default groupService;

