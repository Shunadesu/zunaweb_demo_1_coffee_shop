import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Sidebar state
  sidebarOpen: true,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Modal state
  modalOpen: null,
  modalData: null,
  openModal: (modalName, data = null) => set({ modalOpen: modalName, modalData: data }),
  closeModal: () => set({ modalOpen: null, modalData: null }),
  
  // Toast notifications
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set(state => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 3000);
  },
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },
  
  // Search state
  searchOpen: false,
  toggleSearch: () => set(state => ({ searchOpen: !state.searchOpen })),
  
  // Loading overlay
  isLoading: false,
  loadingText: '',
  setLoading: (isLoading, text = '') => set({ isLoading, loadingText: text }),
}));
