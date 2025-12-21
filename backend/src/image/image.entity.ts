import { BaseEntity } from "@/common/BaseEntity";
import { Feedback } from "@/feedback/feedback.entity";
import { Product } from "@/product/product.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity("images")
export class Image extends BaseEntity {

    @Column({ type: "varchar", length: 255 })
    originalName: string;

    @Column({ type: "varchar", length: 255 })
    url: string;
    
    @Column({ type: "varchar", length: 255 })
    name: string;

    @ManyToOne(() => Product, (product) => product.images)
    product: Product;

    @ManyToOne(() => Feedback, (feedback) => feedback.images)
    feedback: Feedback;
}
    