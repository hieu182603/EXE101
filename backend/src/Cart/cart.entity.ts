import { Entity, JoinColumn, OneToMany, OneToOne, Column } from "typeorm";
import { BaseEntity } from "@/common/BaseEntity";
import { CartItem } from "./cartItem.entity";
import { Account } from "@/auth/account/account.entity";

@Entity()
export class Cart extends BaseEntity {
    @OneToOne(() => Account)
    @JoinColumn()
    account: Account;

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    cartItems: CartItem[];
    
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;
}