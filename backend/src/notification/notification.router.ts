import { Router } from "express";
import { Container } from "typedi";
import { NotificationController } from "./notification.controller";
import { Auth } from "@/middlewares/auth.middleware";

const router = Router();
const notificationController = Container.get(NotificationController);

/**
 * GET /api/notifications/admin
 * Get notifications for current admin/staff user
 */
router.get("/notifications/admin", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.getNotifications(
      req,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 20,
      req.query.status as string,
      req.query.type as string,
      req.query.priority as string,
      req.query.isRead === 'true',
      req.query.dateFrom as string,
      req.query.dateTo as string
    );
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics for current user
 */
router.get("/notifications/stats", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.getNotificationStats(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get("/notifications/unread-count", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.getUnreadCount(req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put("/notifications/:id/read", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.markAsRead(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/notifications/mark-read
 * Mark multiple notifications as read
 */
router.put("/notifications/mark-read", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.markMultipleAsRead(req.body, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:id/archive
 * Archive notification
 */
router.put("/notifications/:id/archive", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.archiveNotification(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete("/notifications/:id", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.deleteNotification(req.params.id, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/notifications/create
 * Create custom notification (admin only)
 */
router.post("/notifications/create", Auth as any, async (req: any, res, next) => {
  try {
    const result = await notificationController.createNotification(req.body, req);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

export default router;
