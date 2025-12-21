import { IsObject, IsOptional, IsString } from "class-validator";
import { Role } from "../role/role.entity";

export class CredentialsDto {
    @IsString()
    username: string;

    @IsString()
    password: string;
}

export class CreateAccountDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsString()
    phone: string;

    @IsString()
    name: string;

    @IsString()
    roleSlug: string;
}

export class AccountDetailsDto {
    @IsString()
    username: string;

    @IsString()
    phone: string;

    @IsObject()
    role: Role;
}

export class VerifyRegisterDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsString()
    phone: string;

    @IsString()
    roleSlug: string;

    @IsString()
    otp: string;
}

export class UpdateAccountDto {
    @IsString()
    @IsOptional()
    oldUsername?: string;

    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    roleSlug?: string;

    @IsString()
    @IsOptional()
    name?: string;
}

