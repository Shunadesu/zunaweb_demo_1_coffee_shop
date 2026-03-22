import axiosClient from '../axiosClient';

export const adminBlogApi = {
  getAll: (params) => axiosClient.get('/admin/blog', { params }),
  getById: (id) => axiosClient.get(`/admin/blog/${id}`),
  getComments: (id, params) => axiosClient.get(`/admin/blog/${id}/comments`, { params }),
  create: (data) => axiosClient.post('/admin/blog', data),
  update: (id, data) => axiosClient.put(`/admin/blog/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/blog/${id}`),
  updateStatus: (id, data) => axiosClient.patch(`/admin/blog/${id}/status`, data),
  toggleFeatured: (id, isFeatured) => axiosClient.patch(`/admin/blog/${id}/featured`, { isFeatured }),
  uploadImages: (id, formData) => axiosClient.post(`/admin/blog/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAnalytics: (id) => axiosClient.get(`/admin/blog/${id}/analytics`),
};
