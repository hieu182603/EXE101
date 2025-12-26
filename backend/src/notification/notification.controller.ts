import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { NotificationService, CreateNotificationData, NotificationFilters } from "./notification.service";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";
import { Notification } from "./notification.entity";

@Service()
@Controller("/notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get notifications for current user
   * GET /api/notifications/admin?page=1&limit=20&status=unread&type=order_created&priority=high
   */
  @Get("/admin")
  @UseBefore(Auth)
  async getNotifications(
    @Req() req: any,
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 20,
    @QueryParam("status") status?: string,
    @QueryParam("type") type?: string,
    @QueryParam("priority") priority?: string,
    @QueryParam("isRead") isRead?: boolean,
    @QueryParam("dateFrom") dateFromStr?: string,
    @QueryParam("dateTo") dateToStr?: string
  ) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to notifications"
      };
    }

    try {
      const filters: NotificationFilters = {
        recipientId: user.username,
      };

      if (status) filters.status = status as any;
      if (type) filters.type = type as any;
      if (priority) filters.priority = priority as any;
      if (isRead !== undefined) filters.isRead = isRead;
      if (dateFromStr) filters.dateFrom = new Date(dateFromStr);
      if (dateToStr) filters.dateTo = new Date(dateToStr);

      const result = await this.notificationService.getNotifications(filters, page, limit);

      return {
        success: true,
        message: "Notifications retrieved successfully",
        data: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      };
    } catch (error: any) {
      console.error("Error getting notifications:", error);
      return {
        success: false,
        message: "Failed to retrieve notifications",
        error: error.message
      };
    }
  }

  /**
   * Get notification statistics for current user
   * GET /api/notifications/stats
   */
  @Get("/stats")
  @UseBefore(Auth)
  async getNotificationStats(@Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to notification stats"
      };
    }

    try {
      const stats = await this.notificationService.getNotificationStats(user.username);

      return {
        success: true,
        message: "Notification statistics retrieved successfully",
        data: stats
      };
    } catch (error: any) {
      console.error("Error getting notification stats:", error);
      return {
        success: false,
        message: "Failed to retrieve notification statistics",
        error: error.message
      };
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  @Get("/unread-count")
  @UseBefore(Auth)
  async getUnreadCount(@Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to unread count"
      };
    }

    try {
      const count = await this.notificationService.getUnreadCount(user.username);

      return {
        success: true,
        message: "Unread count retrieved successfully",
        data: { unreadCount: count }
      };
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return {
        success: false,
        message: "Failed to retrieve unread count",
        error: error.message
      };
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  @Put("/:id/read")
  @UseBefore(Auth)
  async markAsRead(@Param("id") notificationId: string, @Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to mark notification as read"
      };
    }

    try {
      const notification = await this.notificationService.markAsRead(notificationId, user.username);

      if (!notification) {
        return {
          success: false,
          message: "Notification not found or access denied"
        };
      }

      return {
        success: true,
        message: "Notification marked as read successfully",
        data: notification
      };
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        message: "Failed to mark notification as read",
        error: error.message
      };
    }
  }

  /**
   * Mark multiple notifications as read
   * PUT /api/notifications/mark-read
   */
  @Put("/mark-read")
  @UseBefore(Auth)
  async markMultipleAsRead(@Body() body: { notificationIds: string[] }, @Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to mark notifications as read"
      };
    }

    try {
      const { notificationIds } = body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return {
          success: false,
          message: "notificationIds array is required and must not be empty"
        };
      }

      const count = await this.notificationService.markMultipleAsRead(notificationIds, user.username);

      return {
        success: true,
        message: `${count} notifications marked as read successfully`,
        data: { markedCount: count }
      };
    } catch (error: any) {
      console.error("Error marking multiple notifications as read:", error);
      return {
        success: false,
        message: "Failed to mark notifications as read",
        error: error.message
      };
    }
  }

  /**
   * Archive notification
   * PUT /api/notifications/:id/archive
   */
  @Put("/:id/archive")
  @UseBefore(Auth)
  async archiveNotification(@Param("id") notificationId: string, @Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to archive notification"
      };
    }

    try {
      const notification = await this.notificationService.archiveNotification(notificationId, user.username);

      if (!notification) {
        return {
          success: false,
          message: "Notification not found or access denied"
        };
      }

      return {
        success: true,
        message: "Notification archived successfully",
        data: notification
      };
    } catch (error: any) {
      console.error("Error archiving notification:", error);
      return {
        success: false,
        message: "Failed to archive notification",
        error: error.message
      };
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  @Delete("/:id")
  @UseBefore(Auth)
  async deleteNotification(@Param("id") notificationId: string, @Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin, manager, staff
    if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
      return {
        success: false,
        message: "Access denied to delete notification"
      };
    }

    try {
      const deleted = await this.notificationService.deleteNotification(notificationId, user.username);

      if (!deleted) {
        return {
          success: false,
          message: "Notification not found or access denied"
        };
      }

      return {
        success: true,
        message: "Notification deleted successfully"
      };
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        message: "Failed to delete notification",
        error: error.message
      };
    }
  }

  /**
   * Create custom notification (admin only)
   * POST /api/notifications/create
   */
  @Post("/create")
  @UseBefore(Auth)
  async createNotification(@Body() body: CreateNotificationData, @Req() req: any) {
    const user = req.user as AccountDetailsDto;

    // Only allow admin
    if (!this.isAdmin(user)) {
      return {
        success: false,
        message: "Access denied to create notifications"
      };
    }

    try {
      const { recipientId, isBroadcast, ...notificationData } = body;

      let notifications: Notification[];

      if (isBroadcast) {
        notifications = await this.notificationService.createBroadcastNotification(notificationData);
      } else {
        const notification = await this.notificationService.createNotification({
          ...notificationData,
          recipientId: recipientId || user.username
        });
        notifications = [notification];
      }

      return {
        success: true,
        message: `${notifications.length} notification(s) created successfully`,
        data: notifications
      };
    } catch (error: any) {
      console.error("Error creating notification:", error);
      return {
        success: false,
        message: "Failed to create notification",
        error: error.message
      };
    }
  }

  // Helper methods
  private isAdmin(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('admin') || false;
  }

  private isManager(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('manager') || false;
  }

  private isStaff(user: AccountDetailsDto): boolean {
    return user.role?.name?.toLowerCase().includes('staff') || false;
  }
}


