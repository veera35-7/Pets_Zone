const API_URL = import.meta.env.VITE_API_URL || '/api';
import { create } from 'zustand';
import api from '../lib/axios';
import useAuthStore from './authStore';

const useNotificationStore = create((set, get) => {
  let pollInterval = null;

  return {
    notifications: [],
    unreadCount: 0,
    loading: false,
    page: 1,
    hasMore: false,

    fetchNotifications: async (pageNum = 1, append = false) => {
      // Avoid fetching if not authenticated
      if (!useAuthStore.getState().isAuthenticated) return;

      set({ loading: pageNum === 1 });
      try {
        const { data } = await api.get(`/notifications?page=${pageNum}&limit=10`);
        if (data.success) {
          set((state) => ({
            notifications: append ? [...state.notifications, ...data.notifications] : data.notifications,
            unreadCount: data.unreadCount,
            page: pageNum,
            hasMore: data.pagination.hasMore,
            loading: false
          }));
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        set({ loading: false });
      }
    },

    markAllAsRead: async () => {
      try {
        const { data } = await api.put('/notifications/read-all');
        if (data.success) {
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0
          }));
        }
      } catch (err) {
        console.error('Error marking read all:', err);
      }
    },

    markAsRead: async (id) => {
      try {
        const { data } = await api.put(`/notifications/${id}/read`);
        if (data.success) {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        }
      } catch (err) {
        console.error('Error marking read:', err);
      }
    },

    deleteNotification: async (id) => {
      try {
        const { data } = await api.delete(`/notifications/${id}`);
        if (data.success) {
          set((state) => {
            const wasUnread = state.notifications.find((n) => n._id === id && !n.isRead);
            return {
              notifications: state.notifications.filter((n) => n._id !== id),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
          });
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },

    clearAllNotifications: async () => {
      try {
        const { data } = await api.delete('/notifications/clear-all');
        if (data.success) {
          set({ notifications: [], unreadCount: 0, hasMore: false });
        }
      } catch (err) {
        console.error('Error clearing notifications:', err);
      }
    },

    startPolling: () => {
      if (pollInterval) return;
      
      // Initial fetch
      get().fetchNotifications(1, false);

      // Poll every 30 seconds
      pollInterval = setInterval(() => {
        if (useAuthStore.getState().isAuthenticated) {
          get().fetchNotifications(1, false);
        } else {
          get().stopPolling();
        }
      }, 30000);
    },

    stopPolling: () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }
  };
});

export default useNotificationStore;
