import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/BaseEntity";
import { Account } from "@/auth/account/account.entity";
import { CartItem } from "./cartItem.entity";

@Entity("carts")
export class Cart extends BaseEntity {
    @ManyToOne(() => Account, (account) => account.customerOrders, { nullable: false })
    @JoinColumn({ name: "customer_id" })
    customer: Account;

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
    items: CartItem[];

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalAmount: number;
}
