import axiosClient from '../axiosClient';

export const userProfileApi = {
  getProfile: () => axiosClient.get('/user/profile'),
  updateProfile: (data) => axiosClient.put('/user/profile', data),
  updateAddress: (data) => axiosClient.put('/user/profile/address', data),
  getFavorites: () => axiosClient.get('/user/profile/favorites'),
  addFavorite: (productId) => axiosClient.post(`/user/profile/favorites/${productId}`),
  removeFavorite: (productId) => axiosClient.delete(`/user/profile/favorites/${productId}`),
};
