import axiosClient from '../axiosClient';

export const userOrderApi = {
  getMyOrders: (params) => axiosClient.get('/user/orders', { params }),
  getById: (id) => axiosClient.get(`/user/orders/${id}`),
  trackOrder: (orderNumber, phone) => 
    axiosClient.get(`/user/orders/track/${orderNumber}`, { params: { phone } }),
  create: (data) => axiosClient.post('/user/orders', data),
  cancel: (id, reason) => axiosClient.put(`/user/orders/${id}/cancel`, { reason }),
  review: (id, data) => axiosClient.post(`/user/orders/${id}/review`, data),
  reorder: (id) => axiosClient.post(`/user/orders/${id}/reorder`),
};
