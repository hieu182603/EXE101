import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Account } from "@/auth/account/account.entity";

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  PAYMENT_RECEIVED = 'payment_received',
  LOW_STOCK_ALERT = 'low_stock_alert',
  NEW_CUSTOMER = 'new_customer',
  SHIPPER_ASSIGNED = 'shipper_assigned',
  SYSTEM_ALERT = 'system_alert',
  FEEDBACK_RECEIVED = 'feedback_received'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'varchar', length: 20 })
  priority: NotificationPriority;

  @Column({ type: 'varchar', length: 20, default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: any; // Additional data for the notification (orderId, productId, etc.)

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: Account;

  @Column({ nullable: true })
  recipientId: string;

  @Column({ type: 'boolean', default: false })
  isBroadcast: boolean; // If true, sent to all admins/staff

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // For time-sensitive notifications
}


