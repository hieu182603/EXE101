import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity } from "typeorm";

@Entity("otps")
export class Otp extends BaseEntity{
    @Column()
    phone: string;

    @Column()
    code: string;

    @Column()
    verified: boolean = false;
}