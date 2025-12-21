import { Account } from "@/auth/account/account.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Image } from "@/image/image.entity";
import { Product } from "@/product/product.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity("feedbacks")
export class Feedback extends BaseEntity {
    @Column({ type: "varchar", length: 500 })
    content: string;

    @ManyToOne(() => Product, (product) => product.feedbacks)
    product: Product;

    @ManyToOne(() => Account, (account) => account.feedbacks)
    account: Account;

    @OneToMany(() => Image, (image) => image.feedback)
    images: Image[];
}