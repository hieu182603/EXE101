import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@/common/BaseEntity";
import { Product } from "@/product/product.entity";

@Entity("cart_items")
export class CartItem extends BaseEntity {
    @ManyToOne("Cart", { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "cart_id" })
    cart: any;

    @ManyToOne(() => Product, { nullable: false })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column({ type: "int", default: 1 })
    quantity: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price: number;
}
