import { Service } from "typedi";
import * as cron from "node-cron";
import { OrderAssignmentService } from "./orderAssignment.service";
import { OrderService } from "@/order/order.service";

@Service()
export class CronJobService {
  private cronJobs: cron.ScheduledTask[] = [];

  constructor(
    private readonly orderAssignmentService: OrderAssignmentService,
    private readonly orderService: OrderService
  ) {}

  /**
   * Khởi tạo tất cả cron jobs
   */
  initializeCronJobs(): void {
    this.scheduleDailyOrderCountReset();
    this.scheduleAutoAssignment();
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
    return this.cronJobs.map((job, index) => ({
      name: index === 0 ? "Daily Order Count Reset" : "Auto Assignment",
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
} 