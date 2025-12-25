import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity } from "typeorm";

@Entity("otps")
export class Otp extends BaseEntity{
    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column()
    code: string;

    @Column()
    verified: boolean = false;
}






