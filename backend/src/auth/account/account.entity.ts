import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, Index } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { Role } from "@/role/role.entity";
import { RefreshToken } from "@/jwt/refreshToken.entity";
import { ShipperProfile } from "@/auth/shipperProfile.entity";
import { Exclude } from "class-transformer";
import { Order } from "@/order/order.entity";
import { Marketing } from "@/marketing/marketing.entity";
import { SMSNotification } from "@/notification/smsNotification.entity";
import { Image } from "@/image/image.entity";
import { Feedback } from "@/feedback/feedback.entity";
import { RFQ } from "@/rfq/rfq.entity";


@Entity("accounts")
@Index(["phone"])
@Index(["isRegistered"])
@Index(["role"])
export class Account extends NamedEntity {
  @Column({ nullable: false, unique: true })
  @Index({ unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true, where: "phone IS NOT NULL" })
  phone: string | null;

  @Column({ nullable: true })
  @Index({ unique: true, where: "email IS NOT NULL" })
  email: string;

  @Column({ nullable: false, default: false })
  isRegistered: boolean;

  @ManyToOne(() => Role, (role) => role.accounts, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.account)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Order, (order) => order.shipper)
  shipperOrders: Order[]

  @OneToMany(() => Order, (order) => order.customer)
  customerOrders: Order[];

  @OneToMany(() => Marketing, (marketing) => marketing.account)
  marketingCampaigns: Marketing[];

  @OneToMany(() => SMSNotification, (smsnotification) => smsnotification.account)
  smsNotifications: SMSNotification[];

  @OneToMany(() => Feedback, (feedback) => feedback.account)
  feedbacks: Feedback[];

  @OneToMany(() => RFQ, (rfq) => rfq.account)
  rfqs: RFQ[];

  @OneToOne(() => ShipperProfile, (shipperProfile: ShipperProfile) => shipperProfile.account)
  shipperProfile?: ShipperProfile;
}