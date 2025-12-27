import { Service } from "typedi";
import { Container } from "typedi";
import { NotificationService } from "./notification.service";
import { NotificationType, NotificationPriority } from "./notification.entity";

@Service()
export class NotificationEventService {
  private notificationService = Container.get(NotificationService);

  // Order Events
  async onOrderCreated(orderId: string, customerName: string, totalAmount: number) {
    try {
      await this.notificationService.notifyOrderCreated(orderId, customerName, totalAmount);
    } catch (error) {
      console.error("Error creating order created notification:", error);
    }
  }

  async onOrderStatusUpdated(orderId: string, oldStatus: string, newStatus: string, customerName: string) {
    try {
      await this.notificationService.notifyOrderStatusUpdated(orderId, oldStatus, newStatus, customerName);
    } catch (error) {
      console.error("Error creating order status update notification:", error);
    }
  }

  async onPaymentReceived(orderId: string, amount: number, customerName: string) {
    try {
      await this.notificationService.notifyPaymentReceived(orderId, amount, customerName);
    } catch (error) {
      console.error("Error creating payment received notification:", error);
    }
  }

  async onShipperAssigned(orderId: string, shipperName: string, customerName: string) {
    try {
      await this.notificationService.notifyShipperAssigned(orderId, shipperName, customerName);
    } catch (error) {
      console.error("Error creating shipper assigned notification:", error);
    }
  }

  // Product Events
  async onLowStockAlert(productName: string, currentStock: number, threshold: number = 10) {
    try {
      await this.notificationService.notifyLowStock(productName, currentStock, threshold);
    } catch (error) {
      console.error("Error creating low stock notification:", error);
    }
  }

  // Customer Events
  async onNewCustomer(customerName: string, customerEmail: string) {
    try {
      await this.notificationService.notifyNewCustomer(customerName, customerEmail);
    } catch (error) {
      console.error("Error creating new customer notification:", error);
    }
  }

  // Feedback Events
  async onFeedbackReceived(productName: string, customerName: string, rating: number) {
    try {
      await this.notificationService.notifyFeedbackReceived(productName, customerName, rating);
    } catch (error) {
      console.error("Error creating feedback received notification:", error);
    }
  }

  // System Events
  async onSystemAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    try {
      const priorityMap: Record<string, NotificationPriority> = {
        low: NotificationPriority.LOW,
        medium: NotificationPriority.MEDIUM,
        high: NotificationPriority.HIGH,
        urgent: NotificationPriority.URGENT,
      };

      await this.notificationService.createBroadcastNotification({
        type: NotificationType.SYSTEM_ALERT,
        priority: priorityMap[priority],
        title,
        message,
        data: { systemEvent: true }
      });
    } catch (error) {
      console.error("Error creating system alert notification:", error);
    }
  }
}






