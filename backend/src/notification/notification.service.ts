import { Service } from "typedi";
import { Repository, In, MoreThan, LessThan } from "typeorm";
import { DbConnection } from "@/database/dbConnection";
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from "./notification.entity";
import { Account } from "@/auth/account/account.entity";

export interface CreateNotificationData {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: any;
  recipientId?: string;
  isBroadcast?: boolean;
  expiresAt?: Date;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  priority?: NotificationPriority;
  recipientId?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

@Service()
export class NotificationService {
  private get notificationRepository(): Repository<Notification> {
    if (!DbConnection.appDataSource) {
      throw new Error("Database not initialized");
    }
    return DbConnection.appDataSource.getRepository(Notification);
  }

  private get accountRepository(): Repository<Account> {
    if (!DbConnection.appDataSource) {
      throw new Error("Database not initialized");
    }
    return DbConnection.appDataSource.getRepository(Account);
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: data.type,
      priority: data.priority,
      status: NotificationStatus.UNREAD,
      title: data.title,
      message: data.message,
      data: data.data || {},
      recipientId: data.recipientId,
      isBroadcast: data.isBroadcast || false,
      expiresAt: data.expiresAt,
    });

    return await this.notificationRepository.save(notification);
  }

  async createBroadcastNotification(
    data: Omit<CreateNotificationData, 'recipientId' | 'isBroadcast'>,
    roles: string[] = ['admin', 'manager', 'staff']
  ): Promise<Notification[]> {
    // Get all users with specified roles
    const recipients = await this.accountRepository
      .createQueryBuilder("account")
      .leftJoin("account.roles", "role")
      .where("role.name IN (:roles)", { roles })
      .getMany();

    // Create notification for each recipient
    const notifications: Notification[] = [];

    for (const recipient of recipients) {
      const notification = await this.createNotification({
        ...data,
        recipientId: recipient.id,
        isBroadcast: true,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  async getNotifications(
    filters: NotificationFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number; totalPages: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.recipient", "recipient")
      .orderBy("notification.createdAt", "DESC");

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere("notification.status = :status", { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere("notification.type = :type", { type: filters.type });
    }

    if (filters.priority) {
      queryBuilder.andWhere("notification.priority = :priority", { priority: filters.priority });
    }

    if (filters.recipientId) {
      queryBuilder.andWhere("notification.recipientId = :recipientId", { recipientId: filters.recipientId });
    }

    if (filters.isRead !== undefined) {
      const status = filters.isRead ? NotificationStatus.READ : NotificationStatus.UNREAD;
      queryBuilder.andWhere("notification.status = :status", { status });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere("notification.createdAt >= :dateFrom", { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere("notification.createdAt <= :dateTo", { dateTo: filters.dateTo });
    }

    // Remove expired notifications from results
    const now = new Date();
    queryBuilder.andWhere("(notification.expiresAt IS NULL OR notification.expiresAt > :now)", { now });

    const total = await queryBuilder.getCount();
    const notifications = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return { notifications, total, totalPages };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId }
    });

    if (!notification) {
      return null;
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  async markMultipleAsRead(notificationIds: string[], userId: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date()
      })
      .where("id IN (:ids)", { ids: notificationIds })
      .andWhere("recipientId = :userId", { userId })
      .andWhere("status = :status", { status: NotificationStatus.UNREAD })
      .execute();

    return result.affected || 0;
  }

  async archiveNotification(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId }
    });

    if (!notification) {
      return null;
    }

    notification.status = NotificationStatus.ARCHIVED;

    return await this.notificationRepository.save(notification);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      recipientId: userId
    });

    return (result.affected || 0) > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        recipientId: userId,
        status: NotificationStatus.UNREAD
      }
    });
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byPriority: { [key in NotificationPriority]: number };
    byType: { [key in NotificationType]: number };
  }> {
    const notifications = await this.notificationRepository.find({
      where: { recipientId: userId },
      select: ['status', 'priority', 'type']
    });

    const stats = {
      total: notifications.length,
      unread: 0,
      read: 0,
      archived: 0,
      byPriority: {
        [NotificationPriority.LOW]: 0,
        [NotificationPriority.MEDIUM]: 0,
        [NotificationPriority.HIGH]: 0,
        [NotificationPriority.URGENT]: 0,
      },
      byType: {
        [NotificationType.ORDER_CREATED]: 0,
        [NotificationType.ORDER_STATUS_UPDATED]: 0,
        [NotificationType.PAYMENT_RECEIVED]: 0,
        [NotificationType.LOW_STOCK_ALERT]: 0,
        [NotificationType.NEW_CUSTOMER]: 0,
        [NotificationType.SHIPPER_ASSIGNED]: 0,
        [NotificationType.SYSTEM_ALERT]: 0,
        [NotificationType.FEEDBACK_RECEIVED]: 0,
      }
    };

    notifications.forEach(notification => {
      // Count by status
      if (notification.status === NotificationStatus.UNREAD) stats.unread++;
      else if (notification.status === NotificationStatus.READ) stats.read++;
      else if (notification.status === NotificationStatus.ARCHIVED) stats.archived++;

      // Count by priority
      stats.byPriority[notification.priority]++;

      // Count by type
      stats.byType[notification.type]++;
    });

    return stats;
  }

  async cleanupExpiredNotifications(): Promise<number> {
    const now = new Date();
    const result = await this.notificationRepository.delete({
      expiresAt: LessThan(now)
    });

    return result.affected || 0;
  }

  // Helper methods for creating specific types of notifications
  async notifyOrderCreated(orderId: string, customerName: string, totalAmount: number): Promise<Notification[]> {
    return await this.createBroadcastNotification({
      type: NotificationType.ORDER_CREATED,
      priority: NotificationPriority.MEDIUM,
      title: "Đơn hàng mới",
      message: `Khách hàng ${customerName} vừa tạo đơn hàng #${orderId} với tổng giá trị ${totalAmount.toLocaleString('vi-VN')} VND`,
      data: { orderId, customerName, totalAmount }
    });
  }

  async notifyOrderStatusUpdated(orderId: string, oldStatus: string, newStatus: string, customerName: string): Promise<Notification[]> {
    const priority = newStatus === 'cancelled' ? NotificationPriority.HIGH :
                    newStatus === 'delivered' ? NotificationPriority.LOW :
                    NotificationPriority.MEDIUM;

    return await this.createBroadcastNotification({
      type: NotificationType.ORDER_STATUS_UPDATED,
      priority,
      title: "Cập nhật trạng thái đơn hàng",
      message: `Đơn hàng #${orderId} của ${customerName} đã thay đổi từ ${oldStatus} sang ${newStatus}`,
      data: { orderId, oldStatus, newStatus, customerName }
    });
  }

  async notifyPaymentReceived(orderId: string, amount: number, customerName: string): Promise<Notification[]> {
    return await this.createBroadcastNotification({
      type: NotificationType.PAYMENT_RECEIVED,
      priority: NotificationPriority.MEDIUM,
      title: "Thanh toán thành công",
      message: `Đã nhận thanh toán ${amount.toLocaleString('vi-VN')} VND cho đơn hàng #${orderId} của ${customerName}`,
      data: { orderId, amount, customerName }
    });
  }

  async notifyLowStock(productName: string, currentStock: number, threshold: number = 10): Promise<Notification[]> {
    return await this.createBroadcastNotification({
      type: NotificationType.LOW_STOCK_ALERT,
      priority: NotificationPriority.HIGH,
      title: "Cảnh báo tồn kho thấp",
      message: `Sản phẩm ${productName} chỉ còn ${currentStock} sản phẩm trong kho (ngưỡng: ${threshold})`,
      data: { productName, currentStock, threshold }
    });
  }

  async notifyNewCustomer(customerName: string, customerEmail: string): Promise<Notification[]> {
    return await this.createBroadcastNotification({
      type: NotificationType.NEW_CUSTOMER,
      priority: NotificationPriority.LOW,
      title: "Khách hàng mới",
      message: `Khách hàng ${customerName} (${customerEmail}) vừa đăng ký tài khoản`,
      data: { customerName, customerEmail }
    });
  }

  async notifyShipperAssigned(orderId: string, shipperName: string, customerName: string): Promise<Notification[]> {
    return await this.createBroadcastNotification({
      type: NotificationType.SHIPPER_ASSIGNED,
      priority: NotificationPriority.MEDIUM,
      title: "Shipper đã được phân công",
      message: `Shipper ${shipperName} đã được phân công giao đơn hàng #${orderId} của ${customerName}`,
      data: { orderId, shipperName, customerName }
    });
  }

  async notifyFeedbackReceived(productName: string, customerName: string, rating: number): Promise<Notification[]> {
    return await this.createBroadcastNotification({
      type: NotificationType.FEEDBACK_RECEIVED,
      priority: NotificationPriority.LOW,
      title: "Đánh giá mới",
      message: `${customerName} đã đánh giá ${rating} sao cho sản phẩm ${productName}`,
      data: { productName, customerName, rating }
    });
  }
}
