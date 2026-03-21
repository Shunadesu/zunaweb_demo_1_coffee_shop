import axiosClient from './axiosClient';

export const adminStatsApi = {
  getDashboard: (params) => axiosClient.get('/admin/stats/dashboard', { params }),
  getRevenue: (params) => axiosClient.get('/admin/stats/revenue', { params }),
  getOrderStats: (params) => axiosClient.get('/admin/stats/orders', { params }),
  getProductStats: (params) => axiosClient.get('/admin/stats/products', { params }),
  getCustomerStats: (params) => axiosClient.get('/admin/stats/customers', { params }),
  getCouponStats: () => axiosClient.get('/admin/stats/coupons'),
  getComparison: (params) => axiosClient.get('/admin/stats/comparison', { params }),
};
