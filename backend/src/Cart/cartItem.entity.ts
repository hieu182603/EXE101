import { Column, Entity, ManyToOne } from "typeorm";
import { Cart } from "./cart.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Product } from "@/product/product.entity";

@Entity()
export class CartItem extends BaseEntity {
    @Column({ type: "int", nullable: false })
    quantity: number;

    @ManyToOne(() => Cart, (cart) => cart.cartItems)
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cartItems)
    product: Product;
}