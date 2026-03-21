import { create } from 'zustand';
import { publicApi } from '@/api/publicApi';

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  featuredProducts: [],
  bestSellers: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  filters: {
    category: '',
    search: '',
    sort: 'createdAt',
    minPrice: '',
    maxPrice: '',
  },

  // Fetch products
  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const filters = get().filters;
      const pagination = get().pagination;
      const queryParams = {
        ...filters,
        ...pagination,
        ...params,
      };
      
      const response = await publicApi.getProducts(queryParams);
      set({ 
        products: response.data,
        pagination: response.pagination,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      const response = await publicApi.getCategories();
      set({ categories: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async () => {
    try {
      const response = await publicApi.getFeaturedProducts();
      set({ 
        featuredProducts: response.data.featured,
        bestSellers: response.data.bestSellers,
      });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch single product
  fetchProduct: async (slug) => {
    set({ isLoading: true, error: null });
    try {
      const response = await publicApi.getProductBySlug(slug);
      set({ currentProduct: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    get().fetchProducts({ ...get().filters, ...filters });
  },

  // Set pagination
  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchProducts({ ...get().filters, page });
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        category: '',
        search: '',
        sort: 'createdAt',
        minPrice: '',
        maxPrice: '',
      },
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });
    get().fetchProducts();
  },

  // Clear current product
  clearCurrentProduct: () => set({ currentProduct: null }),
}));
