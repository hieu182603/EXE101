import { IsObject, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { Role } from "@/role/role.entity";

export class CredentialsDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    password: string;
}

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsNotEmpty()
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
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

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
    email?: string;

    @IsString()
    @IsOptional()
    roleSlug?: string;

    @IsString()
    @IsOptional()
    name?: string;
}

