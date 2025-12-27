import { Service } from "typedi";
import * as cron from "node-cron";
import { OrderAssignmentService } from "./orderAssignment.service";
import { OrderService } from "@/order/order.service";
import { NotificationService } from "@/notification/notification.service";

@Service()
export class CronJobService {
  private cronJobs: cron.ScheduledTask[] = [];

  constructor(
    private readonly orderAssignmentService: OrderAssignmentService,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService
  ) {}

  /**
   * Khởi tạo tất cả cron jobs
   */
  initializeCronJobs(): void {
    this.scheduleDailyOrderCountReset();
    this.scheduleAutoAssignment();
    this.scheduleExpiredNotificationsCleanup();
  }

  /**
   * Lên lịch reset số đơn hàng hàng ngày
   * Chạy lúc 00:00 mỗi ngày
   */
  private scheduleDailyOrderCountReset(): void {
    const task = cron.schedule("0 0 * * *", async () => {
      try {
        await this.orderAssignmentService.resetDailyOrderCounts();
      } catch (error) {
        // Error handling
      }
    }, {
      timezone: "Asia/Ho_Chi_Minh" // Múi giờ Việt Nam
    });

    this.cronJobs.push(task);
  }

  /**
   * Lên lịch auto-assign đơn hàng chưa có shipper
   * Chạy mỗi 30 phút
   */
  private scheduleAutoAssignment(): void {
    const task = cron.schedule("*/30 * * * *", async () => {
      try {
        const unassignedOrders = await this.orderService.getUnassignedOrders();
        
        if (unassignedOrders.length === 0) {
          return;
        }

        const results = await this.orderAssignmentService.assignMultipleOrders(unassignedOrders);
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        
      } catch (error) {
        // Error handling
      }
    }, {
      timezone: "Asia/Ho_Chi_Minh"
    });

    this.cronJobs.push(task);
  }

  /**
   * Dừng tất cả cron jobs
   */
  stopAllCronJobs(): void {
    this.cronJobs.forEach(job => {
      job.stop();
    });
    
    this.cronJobs = [];
  }

  /**
   * Lấy trạng thái của tất cả cron jobs
   */
  getCronJobsStatus(): { name: string; status: string }[] {
    const jobNames = ["Daily Order Count Reset", "Auto Assignment", "Expired Notifications Cleanup"];
    return this.cronJobs.map((job, index) => ({
      name: jobNames[index] || `Job ${index + 1}`,
      status: job.getStatus() as string
    }));
  }

  /**
   * Chạy reset số đơn hàng ngay lập tức (cho testing)
   */
  async runDailyOrderCountResetNow(): Promise<void> {
    try {
      await this.orderAssignmentService.resetDailyOrderCounts();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Chạy auto-assignment ngay lập tức (cho testing)
   */
  async runAutoAssignmentNow(): Promise<void> {
    try {
      const unassignedOrders = await this.orderService.getUnassignedOrders();

      if (unassignedOrders.length === 0) {
        return;
      }

      const results = await this.orderAssignmentService.assignMultipleOrders(unassignedOrders);
      const successCount = results.filter(r => r.success).length;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Lên lịch cleanup expired notifications
   * Chạy lúc 02:00 mỗi ngày
   */
  private scheduleExpiredNotificationsCleanup(): void {
    const task = cron.schedule("0 2 * * *", async () => {
      try {
        const deletedCount = await this.notificationService.cleanupExpiredNotifications();
        if (deletedCount > 0) {
          console.log(`Cleaned up ${deletedCount} expired notifications`);
        }
      } catch (error) {
        console.error("Error cleaning up expired notifications:", error);
      }
    }, {
      timezone: "Asia/Ho_Chi_Minh"
    });

    this.cronJobs.push(task);
  }

  /**
   * Chạy cleanup expired notifications ngay lập tức (cho testing)
   */
  async runExpiredNotificationsCleanupNow(): Promise<void> {
    try {
      const deletedCount = await this.notificationService.cleanupExpiredNotifications();
      console.log(`Cleaned up ${deletedCount} expired notifications`);
    } catch (error) {
      throw error;
    }
  }
} 