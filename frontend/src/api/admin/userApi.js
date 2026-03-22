import axiosClient from '../axiosClient';

export const adminUserApi = {
  getAll: (params) => axiosClient.get('/admin/users', { params }),
  getById: (id) => axiosClient.get(`/admin/users/${id}`),
  getUserOrders: (id, params) => axiosClient.get(`/admin/users/${id}/orders`, { params }),
  getUserPoints: (id, params) => axiosClient.get(`/admin/users/${id}/points`, { params }),
  update: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  updatePoints: (id, data) => axiosClient.put(`/admin/users/${id}/points`, data),
  toggleBlock: (id, isActive) => axiosClient.put(`/admin/users/${id}/block`, { isActive }),
  delete: (id) => axiosClient.delete(`/admin/users/${id}`),
};
