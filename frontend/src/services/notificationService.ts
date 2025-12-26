import type { Notification, NotificationStats, CreateNotificationData } from '@/types';
import api from './apiInterceptor';

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getNotifications(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      type?: string;
      priority?: string;
      isRead?: boolean;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ notifications: Notification[]; total: number; totalPages: number }> {
    try {
      const params: any = { page, limit };
      if (filters?.status) params.status = filters.status;
      if (filters?.type) params.type = filters.type;
      if (filters?.priority) params.priority = filters.priority;
      if (filters?.isRead !== undefined) params.isRead = filters.isRead;
      if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters?.dateTo) params.dateTo = filters.dateTo;

      const response = await api.get('/notifications/admin', { params });
      return {
        notifications: response.data.data,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.get('/notifications/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    try {
      const response = await api.put('/notifications/mark-read', { notificationIds });
      return response.data.data.markedCount;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      throw error;
    }
  }

  async archiveNotification(notificationId: string): Promise<Notification> {
    try {
      const response = await api.put(`/notifications/${notificationId}/archive`);
      return response.data.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification[]> {
    try {
      const response = await api.post('/notifications/create', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}
