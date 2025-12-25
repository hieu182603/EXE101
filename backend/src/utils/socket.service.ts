import { Service } from 'typedi';
import {
  getIO,
  emitNotification,
  emitNotificationToAccounts,
  emitOrderUpdate,
  emitPaymentUpdate,
  emitShippingUpdate,
  emitFeedbackUpdate,
  emitRFQUpdate,
  emitDataUpdate
} from '../config/socket.config';

export interface NotificationData {
  type: 'order' | 'payment' | 'shipping' | 'feedback' | 'rfq';
  title: string;
  message: string;
  data?: any;
  timestamp?: Date;
}

@Service()
export class SocketService {

  /**
   * Send generic notification to specific account
   */
  public sendToAccount(accountId: string, event: string, data: any) {
    try {
      const io = getIO();
      io.to(`account:${accountId}`).emit(event, data);

      if (process.env.NODE_ENV !== 'production') {
        console.log(`📤 Sent ${event} to account ${accountId}`);
      }
    } catch (error) {
      console.error('Error sending to account:', error);
    }
  }

  /**
   * Send notification to all admins
   */
  public sendToAdmins(event: string, data: any) {
    try {
      const io = getIO();
      io.to('admins').emit(event, data);

      if (process.env.NODE_ENV !== 'production') {
        console.log(`📤 Sent ${event} to all admins`);
      }
    } catch (error) {
      console.error('Error sending to admins:', error);
    }
  }

  /**
   * Send notification to multiple accounts
   */
  public sendToAccounts(accountIds: string[], event: string, data: any) {
    try {
      const io = getIO();
      accountIds.forEach(accountId => {
        io.to(`account:${accountId}`).emit(event, data);
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log(`📤 Sent ${event} to ${accountIds.length} accounts`);
      }
    } catch (error) {
      console.error('Error sending to accounts:', error);
    }
  }

  /**
   * Send order notification to account
   */
  public notifyOrderUpdate(accountId: string, orderData: any) {
    const notification: NotificationData = {
      type: 'order',
      title: 'Cập nhật đơn hàng',
      message: `Đơn hàng #${orderData.orderNumber || orderData.id} đã được cập nhật`,
      data: orderData,
      timestamp: new Date()
    };

    emitOrderUpdate(accountId, notification);
    // Also notify admins about order activity
    this.sendToAdmins('new-order-activity', {
      accountId,
      ...notification
    });
  }

  /**
   * Send payment notification to account
   */
  public notifyPaymentUpdate(accountId: string, paymentData: any) {
    const notification: NotificationData = {
      type: 'payment',
      title: 'Cập nhật thanh toán',
      message: `Thanh toán cho đơn hàng #${paymentData.orderNumber || paymentData.orderId} đã được cập nhật`,
      data: paymentData,
      timestamp: new Date()
    };

    emitPaymentUpdate(accountId, notification);
    // Also notify admins about payment activity
    this.sendToAdmins('new-payment-activity', {
      accountId,
      ...notification
    });
  }

  /**
   * Send shipping notification to account
   */
  public notifyShippingUpdate(accountId: string, shippingData: any) {
    const notification: NotificationData = {
      type: 'shipping',
      title: 'Cập nhật vận chuyển',
      message: `Đơn hàng #${shippingData.orderNumber || shippingData.orderId} đã được cập nhật trạng thái vận chuyển`,
      data: shippingData,
      timestamp: new Date()
    };

    emitShippingUpdate(accountId, notification);
    // Also notify admins about shipping activity
    this.sendToAdmins('new-shipping-activity', {
      accountId,
      ...notification
    });
  }

  /**
   * Send feedback notification to admins
   */
  public notifyNewFeedback(feedbackData: any) {
    const notification: NotificationData = {
      type: 'feedback',
      title: 'Phản hồi mới',
      message: `Có phản hồi mới từ khách hàng`,
      data: feedbackData,
      timestamp: new Date()
    };

    emitFeedbackUpdate(notification);
  }

  /**
   * Send RFQ notification to admins
   */
  public notifyNewRFQ(rfqData: any) {
    const notification: NotificationData = {
      type: 'rfq',
      title: 'Yêu cầu báo giá mới',
      message: `Có yêu cầu báo giá mới từ khách hàng`,
      data: rfqData,
      timestamp: new Date()
    };

    emitRFQUpdate(notification);
  }

  /**
   * Send test notification (for testing purposes)
   */
  public sendTestNotification() {
    const notification: NotificationData = {
      type: 'feedback',
      title: 'Test Notification',
      message: 'Đây là thông báo test từ hệ thống Socket.IO',
      data: { test: true },
      timestamp: new Date()
    };

    this.sendToAdmins('new-feedback', notification);
    console.log('📤 Test notification sent to all admins');
  }
}
