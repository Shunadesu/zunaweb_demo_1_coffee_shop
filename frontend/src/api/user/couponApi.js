import axiosClient from '../axiosClient';

export const userCouponApi = {
  getMyCoupons: (params) => axiosClient.get('/user/coupons', { params }),
  getAvailable: (params) => axiosClient.get('/user/coupons/available', { params }),
  validate: (data) => axiosClient.post('/user/coupons/validate', data),
  claim: (id) => axiosClient.post(`/user/coupons/claim/${id}`),
  getById: (id) => axiosClient.get(`/user/coupons/${id}`),
};
