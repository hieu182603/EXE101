import { IsString, IsOptional, IsNotEmpty, Length, IsBoolean, IsArray, ValidateNested, IsNumber, Min, Max, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestInfoDto {
    @IsString({ message: 'Họ tên phải là chuỗi' })
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
    fullName: string;

    @IsString({ message: 'Số điện thoại phải là chuỗi' })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @Length(10, 15, { message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
}

export class GuestCartItemDto {
    @IsString({ message: 'Product ID phải là chuỗi' })
    @IsNotEmpty({ message: 'Product ID không được để trống' })
    productId: string;

    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng tối thiểu là 1' })
    @Max(99, { message: 'Số lượng tối đa là 99' })
    quantity: number;

    @IsNumber({}, { message: 'Giá phải là số' })
    @Min(0, { message: 'Giá không được âm' })
    price: number;

    @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    @Length(1, 255, { message: 'Tên sản phẩm phải từ 1-255 ký tự' })
    name: string;
}

export class CreateOrderDto {
    @IsString({ message: 'Địa chỉ giao hàng phải là chuỗi' })
    @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
    @Length(10, 500, { message: 'Địa chỉ giao hàng phải có độ dài từ 10 đến 500 ký tự' })
    shippingAddress: string;

    @IsString({ message: 'Ghi chú phải là chuỗi' })
    @IsOptional()
    @Length(0, 500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
    note?: string;

    @IsString({ message: 'Hình thức thanh toán phải là chuỗi' })
    @IsOptional()
    @Length(0, 100, { message: 'Hình thức thanh toán không được vượt quá 100 ký tự' })
    paymentMethod?: string;

    @IsBoolean({ message: 'requireInvoice phải là boolean' })
    @IsOptional()
    requireInvoice?: boolean = false;

    // Guest order fields
    @IsBoolean({ message: 'isGuest phải là boolean' })
    @IsOptional()
    isGuest?: boolean;

    @ValidateNested({ message: 'Thông tin khách không hợp lệ' })
    @Type(() => GuestInfoDto)
    @IsOptional()
    guestInfo?: GuestInfoDto;

    @IsArray({ message: 'Giỏ hàng phải là mảng' })
    @ValidateNested({ each: true, message: 'Sản phẩm trong giỏ hàng không hợp lệ' })
    @Type(() => GuestCartItemDto)
    @IsOptional()
    guestCartItems?: GuestCartItemDto[];
} 