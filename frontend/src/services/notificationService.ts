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

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied to notifications:', response.data.message);
        return {
          notifications: [],
          total: 0,
          totalPages: 0
        };
      }

      return {
        notifications: response.data.data || [],
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.get('/notifications/stats');

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied to notification stats:', response.data.message);
        return {
          total: 0,
          unread: 0,
          read: 0,
          archived: 0,
          byPriority: {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0
          },
          byType: {
            ORDER_CREATED: 0,
            ORDER_STATUS_UPDATED: 0,
            PAYMENT_RECEIVED: 0,
            LOW_STOCK_ALERT: 0,
            NEW_CUSTOMER: 0,
            SHIPPER_ASSIGNED: 0,
            SYSTEM_ALERT: 0,
            FEEDBACK_RECEIVED: 0
          }
        };
      }

      return response.data.data || {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        byPriority: {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
          URGENT: 0
        },
        byType: {
          ORDER_CREATED: 0,
          ORDER_STATUS_UPDATED: 0,
          PAYMENT_RECEIVED: 0,
          LOW_STOCK_ALERT: 0,
          NEW_CUSTOMER: 0,
          SHIPPER_ASSIGNED: 0,
          SYSTEM_ALERT: 0,
          FEEDBACK_RECEIVED: 0
        }
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied to unread count:', response.data.message);
        return 0; // Return 0 for users without permission
      }

      return response.data.data?.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied or notification not found:', response.data.message);
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    try {
      const response = await api.put('/notifications/mark-read', { notificationIds });

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied to mark notifications as read:', response.data.message);
        return 0;
      }

      return response.data.data?.markedCount || 0;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      throw error;
    }
  }

  async archiveNotification(notificationId: string): Promise<Notification> {
    try {
      const response = await api.put(`/notifications/${notificationId}/archive`);

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied or notification not found:', response.data.message);
        throw new Error(response.data.message || 'Failed to archive notification');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied or notification not found:', response.data.message);
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification[]> {
    try {
      const response = await api.post('/notifications/create', data);

      // Check if the API response indicates success
      if (response.data && response.data.success === false) {
        console.warn('Access denied to create notifications:', response.data.message);
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}
