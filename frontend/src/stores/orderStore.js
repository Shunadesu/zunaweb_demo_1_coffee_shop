import { create } from 'zustand';
import { userOrderApi } from '@/api/user/orderApi';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  trackingOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: '',
  },

  // Fetch my orders
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userOrderApi.getMyOrders(params);
      set({ 
        orders: response.data,
        pagination: response.pagination,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch single order
  fetchOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userOrderApi.getById(id);
      set({ currentOrder: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Track order
  trackOrder: async (orderNumber, phone) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userOrderApi.trackOrder(orderNumber, phone);
      set({ trackingOrder: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Create order
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userOrderApi.create(orderData);
      set({ currentOrder: response.data, isLoading: false });
      return { success: true, order: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      await userOrderApi.cancel(id, reason);
      // Update local state
      const orders = get().orders.map(order => 
        order._id === id ? { ...order, status: 'CANCELLED' } : order
      );
      set({ orders, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Review order
  reviewOrder: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await userOrderApi.review(id, data);
      // Update local state
      const orders = get().orders.map(order => 
        order._id === id ? { ...order, isReviewed: true, rating: data.rating } : order
      );
      set({ orders, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Clear tracking
  clearTracking: () => set({ trackingOrder: null }),

  // Clear current order
  clearCurrentOrder: () => set({ currentOrder: null }),
}));
