import { Account } from "@/auth/account/account.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Product } from "@/product/product.entity";
import { Column, Entity, ManyToMany, ManyToOne, JoinTable } from "typeorm";

@Entity("rfqs")
export class RFQ extends BaseEntity{
    @Column()
    amount: number;

    @Column()
    fulfilled: boolean;

    @ManyToMany(() => Product)
    @JoinTable({
        name: 'rfq_products',
        joinColumn: { name: 'rfq_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' }
    })
    products: Product[];

    @ManyToOne(() => Account, (account) => account.rfqs)
    account: Account;
}