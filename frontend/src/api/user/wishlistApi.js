import axiosClient from '../axiosClient';

export const wishlistApi = {
  // User
  getWishlist: (params = {}) => {
    return axiosClient.get('/user/wishlist', { params });
  },
  addToWishlist: (productId, data = {}) => {
    return axiosClient.post('/user/wishlist', { productId, ...data });
  },
  removeFromWishlist: (productId) => {
    return axiosClient.delete(`/user/wishlist/${productId}`);
  },
  checkWishlist: (productId) => {
    return axiosClient.get(`/user/wishlist/check/${productId}`);
  },
  clearWishlist: () => {
    return axiosClient.delete('/user/wishlist/clear');
  },
  updateWishlistNote: (productId, data) => {
    return axiosClient.patch(`/user/wishlist/${productId}/note`, data);
  },
  moveToCart: (productId, data = {}) => {
    return axiosClient.post(`/user/wishlist/${productId}/move-to-cart`, data);
  },
};

export default wishlistApi;
