import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "@/common/BaseEntity";
import { Account } from "./account/account.entity";

@Entity("shipper_profiles")
export class ShipperProfile extends BaseEntity {
  @OneToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: "int", default: 0 })
  maxOrdersPerDay: number; // Số đơn hàng tối đa mỗi ngày

  @Column({ type: "int", default: 0 })
  currentOrdersToday: number; // Số đơn hàng hiện tại hôm nay

  @Column({ type: "boolean", default: true })
  isAvailable: boolean; // Trạng thái online/available

  @Column({ type: "int", default: 1 })
  priority: number; // Độ ưu tiên khi phân loại đơn hàng

  @Column({ type: "date", nullable: true })
  lastOrderDate: Date; // Ngày đơn hàng cuối cùng
}

