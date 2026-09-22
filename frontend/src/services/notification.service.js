import { api } from './api';

export const notificationService = {
  getNotifications: async () => {
    return api.get('/notifications');
  },
  
  markAsRead: async (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },
  
  markAllAsRead: async () => {
    return api.patch('/notifications/read-all');
  }
};
