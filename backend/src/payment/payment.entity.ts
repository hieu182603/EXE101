import { BaseEntity } from "@/common/BaseEntity";
import { Order } from "@/order/order.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 50 })
  method: string;
}