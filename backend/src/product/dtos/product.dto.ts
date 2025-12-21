import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsArray, IsObject } from "class-validator";
import { Category } from "../categories/category.entity";

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    price: number;

    @IsNumber()
    stock: number;

    @IsString()
    @IsOptional()
    url?: string;

    @IsString()
    categoryId: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsNumber()
    @IsOptional()
    stock?: number;

    @IsString()
    @IsOptional()
    url?: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class ProductResponseDto {
    @IsUUID()
    id: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    price: number;

    @IsNumber()
    stock: number;

    @IsString()
    @IsOptional()
    url?: string;

    @IsBoolean()
    isActive: boolean;

    @IsString()
    categoryId: string;

    @IsObject()
    @IsOptional()
    category?: Category;

    @IsArray()
    @IsOptional()
    images?: any[];

    @IsArray()
    @IsOptional()
    feedbacks?: any[];

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class ProductListResponseDto {
    @IsArray()
    data: ProductResponseDto[];

    @IsNumber()
    total: number;

    @IsNumber()
    page: number;

    @IsNumber()
    limit: number;
} 