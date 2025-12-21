import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa là 99' })
  quantity: number;
}

export class CartItemResponseDto {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    url?: string;
    stock: number;
    category?: string;
    isActive: boolean;
  };
}

export class CartResponseDto {
  id: string;
  totalAmount: number;
  cartItems: CartItemResponseDto[];
  account: {
    id: string;
    username: string;
  };
}