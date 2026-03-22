import axiosClient from '../axiosClient';

export const adminOrderApi = {
  getAll: (params) => axiosClient.get('/admin/orders', { params }),
  getById: (id) => axiosClient.get(`/admin/orders/${id}`),
  getHistory: (id) => axiosClient.get(`/admin/orders/${id}/history`),
  updateStatus: (id, data) => axiosClient.put(`/admin/orders/${id}/status`, data),
  assignOrder: (id, assignedTo) => axiosClient.put(`/admin/orders/${id}/assign`, { assignedTo }),
  cancelOrder: (id, reason) => axiosClient.put(`/admin/orders/${id}/cancel`, { reason }),
  refundOrder: (id, data) => axiosClient.put(`/admin/orders/${id}/refund`, data),
  addNote: (id, note) => axiosClient.post(`/admin/orders/${id}/note`, { note }),
};
