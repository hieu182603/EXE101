import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Account } from "../account/account.entity";

@Entity('refresh-token')
export class RefreshToken extends BaseEntity{
    @Column({nullable: false})
    token: string;

    @Column({nullable: false, name: 'expired-at'})
    expiredAt: Date;

    @ManyToOne(() => Account, (account) => account.refreshTokens)
    account: Account;
}