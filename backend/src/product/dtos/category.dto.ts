import { IsString, IsOptional, IsUUID, IsArray, IsNumber } from "class-validator";
import { Product } from "../product.entity";

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CategoryResponseDto {
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

    @IsArray()
    @IsOptional()
    products?: Product[];

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CategoryListResponseDto {
    @IsArray()
    data: CategoryResponseDto[];

    @IsNumber()
    total: number;
} 