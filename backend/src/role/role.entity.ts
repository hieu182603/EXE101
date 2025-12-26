import { Entity, OneToMany, Index } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { Account } from "@/auth/account/account.entity";

@Entity('roles')
@Index(["slug"])
export class Role extends NamedEntity{
    @OneToMany(() => Account, (account) => account.role)
    accounts: Account[];
}












