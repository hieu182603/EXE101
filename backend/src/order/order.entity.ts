import { Account } from "@/auth/account/account.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { OrderDetail } from "./orderDetail.entity";
import { Payment } from "@/payment/payment.entity";
import { Invoice } from "@/payment/invoice.entity";
import { OrderStatus } from "./dtos/update-order.dto";

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => Account, (account) => account.customerOrders, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Account | null;

  @ManyToOne(() => Account, (account) => account.shipperOrders, { nullable: true })
  @JoinColumn({ name: 'shipper_id' })
  shipper: Account | null;

  @Column()
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'boolean', default: false, name: 'require_invoice' })
  requireInvoice: boolean;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, { cascade: true })
  orderDetails: OrderDetail[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  invoices: Invoice[];
}