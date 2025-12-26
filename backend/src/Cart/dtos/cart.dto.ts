import { IsString, IsInt, Min, Max, IsNotEmpty, IsUUID, IsNumber, IsBoolean, IsOptional, IsArray, IsObject } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa là 99' })
  quantity: number;
}

export class CartItemProductDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  stock: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  isActive: boolean;
}

export class CartItemResponseDto {
  @IsUUID()
  id: string;

  @IsNumber()
  quantity: number;

  @IsObject()
  product: CartItemProductDto;
}

export class CartAccountDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;
}

export class CartResponseDto {
  @IsUUID()
  id: string;

  @IsNumber()
  totalAmount: number;

  @IsArray()
  cartItems: CartItemResponseDto[];

  @IsObject()
  account: CartAccountDto;
}