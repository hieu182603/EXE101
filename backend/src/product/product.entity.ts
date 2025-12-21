import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { CartItem } from "@/Cart/cartItem.entity";
import { OrderDetail } from "@/order/orderDetail.entity";
import { Category } from "./categories/category.entity";
import { Image } from "@/image/image.entity";
import { Feedback } from "@/feedback/feedback.entity";

@Entity('products')
export class Product extends NamedEntity {
    @Column({ default: true })
    isActive: boolean;

    @Column({nullable: true, type: 'double precision'})
    price: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    stock: number;

    @Column({ nullable: true })
    categoryId: string;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
    orderDetails: OrderDetail[];

    @ManyToOne(() => Category, (category) => category.products)
    category: Category;

    @OneToMany(() => Image, (image) => image.product)
    images: Image[];

    @OneToMany(() => Feedback, (feedback) => feedback.product)
    feedbacks: Feedback[];
}
