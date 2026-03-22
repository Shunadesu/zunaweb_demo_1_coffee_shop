import axiosClient from '../axiosClient';

export const reviewApi = {
  // Public - Lấy reviews của sản phẩm
  getProductReviews: (productId, params = {}) => {
    return axiosClient.get(`/reviews/product/${productId}`, { params });
  },

  // User - Tạo review mới
  createReview: (productId, data) => {
    return axiosClient.post(`/reviews/user/reviews/${productId}`, data);
  },
  
  // User - Cập nhật review
  updateReview: (reviewId, data) => {
    return axiosClient.put(`/reviews/user/reviews/${reviewId}`, data);
  },
  
  // User - Xóa review
  deleteReview: (reviewId) => {
    return axiosClient.delete(`/reviews/user/reviews/${reviewId}`);
  },
  
  // User - Đánh dấu hữu ích
  markHelpful: (reviewId) => {
    return axiosClient.post(`/reviews/user/reviews/${reviewId}/helpful`);
  },
  
  // User - Lấy danh sách review của mình
  getMyReviews: (params) => {
    return axiosClient.get(`/reviews/user/reviews`, { params });
  },

  // Admin - Lấy tất cả reviews
  getAllReviews: (params) => {
    return axiosClient.get(`/reviews/admin/reviews`, { params });
  },
  
  // Admin - Cập nhật trạng thái review
  updateReviewStatus: (reviewId, data) => {
    return axiosClient.patch(`/reviews/admin/reviews/${reviewId}/status`, data);
  },
  
  // Admin - Phản hồi review
  replyToReview: (reviewId, data) => {
    return axiosClient.post(`/reviews/admin/reviews/${reviewId}/reply`, data);
  },
  
  // Admin - Xóa review
  deleteReviewAdmin: (reviewId) => {
    return axiosClient.delete(`/reviews/admin/reviews/${reviewId}`);
  },
};

export default reviewApi;
