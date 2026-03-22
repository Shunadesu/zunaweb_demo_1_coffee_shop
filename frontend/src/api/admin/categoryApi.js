import axiosClient from '../axiosClient';

export const adminCategoryApi = {
  getAll: (params) => axiosClient.get('/admin/categories', { params }),
  getById: (id) => axiosClient.get(`/admin/categories/${id}`),
  getProducts: (id, params) => axiosClient.get(`/admin/categories/${id}/products`, { params }),
  create: (data) => axiosClient.post('/admin/categories', data),
  update: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/categories/${id}`),
  reorder: (id, sortOrder) => axiosClient.patch(`/admin/categories/${id}/reorder`, { sortOrder }),
  toggleStatus: (id, isActive) => axiosClient.patch(`/admin/categories/${id}/status`, { isActive }),
};
