import { create } from 'zustand';
import { authApi } from '@/api/authApi';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message || 'Đăng nhập thất bại', isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Register
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { user, accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message || 'Đăng ký thất bại', isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Fetch profile
  fetchProfile: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      get().logout();
      set({ isLoading: false });
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateProfile(data);
      set({ user: response.data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
