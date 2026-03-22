import axiosClient from '../axiosClient';

export const adminCouponApi = {
  getAll: (params) => axiosClient.get('/admin/coupons', { params }),
  getById: (id) => axiosClient.get(`/admin/coupons/${id}`),
  getUsage: (id, params) => axiosClient.get(`/admin/coupons/${id}/usage`, { params }),
  create: (data) => axiosClient.post('/admin/coupons', data),
  update: (id, data) => axiosClient.put(`/admin/coupons/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/coupons/${id}`),
  toggleStatus: (id, isActive) => axiosClient.patch(`/admin/coupons/${id}/status`, { isActive }),
  duplicate: (id, data) => axiosClient.post(`/admin/coupons/${id}/duplicate`, data),
};
