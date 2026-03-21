import { create } from 'zustand';
import { io } from 'socket.io-client';
import { userOrderApi } from '@/api/user/orderApi';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  notifications: [],
  unreadCount: 0,

  // Connect socket
  connect: (userId) => {
    if (get().socket) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ connected: true, socket });
      
      // Join user room
      if (userId) {
        socket.emit('join:user', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ connected: false });
    });

    // Listen for events
    socket.on('order:status', (data) => {
      console.log('Order status update:', data);
      // Could trigger a toast notification
    });

    socket.on('notification', (notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    socket.on('points:update', (data) => {
      console.log('Points update:', data);
    });

    set({ socket });
  },

  // Disconnect
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  // Join admin room
  joinAdminRoom: () => {
    const socket = get().socket;
    if (socket) {
      socket.emit('join:admin');
    }
  },

  // Leave room
  leaveRoom: (room) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('leave:room', room);
    }
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // Mark all as read
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  // Clear notifications
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
