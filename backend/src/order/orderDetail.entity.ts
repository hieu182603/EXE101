import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "@/product/product.entity";

@Entity('order_details')
export class OrderDetail extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.orderDetails)
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderDetails)
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}