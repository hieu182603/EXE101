import { Entity, OneToMany } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { Account } from "@/auth/account/account.entity";

@Entity('roles')
export class Role extends NamedEntity{
    @OneToMany(() => Account, (account) => account.role)
    accounts: Account[];
}