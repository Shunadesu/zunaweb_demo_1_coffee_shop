import axiosClient from '../axiosClient';

export const adminProductApi = {
  getAll: (params) => axiosClient.get('/admin/products', { params }),
  getById: (id) => axiosClient.get(`/admin/products/${id}`),
  getStats: (id) => axiosClient.get(`/admin/products/${id}/stats`),
  create: (data) => axiosClient.post('/admin/products', data),
  update: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/products/${id}`),
  toggleAvailability: (id, isAvailable) => 
    axiosClient.patch(`/admin/products/${id}/availability`, { isAvailable }),
  toggleFeatured: (id, isFeatured) => 
    axiosClient.patch(`/admin/products/${id}/featured`, { isFeatured }),
  uploadImages: (id, formData) => 
    axiosClient.post(`/admin/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (id, imageId) => 
    axiosClient.delete(`/admin/products/${id}/images/${imageId}`),
};
