import axiosClient from './axiosClient';

export const publicApi = {
  // Categories
  getCategories: () => axiosClient.get('/public/categories'),
  getCategoryBySlug: (slug) => axiosClient.get(`/public/categories/${slug}`),

  // Products
  getProducts: (params) => axiosClient.get('/public/products', { params }),
  getFeaturedProducts: (params) => axiosClient.get('/public/products/featured', { params }),
  getProductBySlug: (slug) => axiosClient.get(`/public/products/${slug}`),

  // Blogs
  getBlogs: (params) => axiosClient.get('/public/blogs', { params }),
  getBlogBySlug: (slug) => axiosClient.get(`/public/blogs/${slug}`),
  toggleBlogLike: (id) => axiosClient.post(`/public/blogs/${id}/like`),

  // Coupons
  getPublicCoupons: () => axiosClient.get('/public/coupons/public'),
};
