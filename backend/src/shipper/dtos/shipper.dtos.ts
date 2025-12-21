import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, Length, Matches, Min, Max } from "class-validator";

export class CreateShipperDto {
  @IsString({ message: 'Username phải là chuỗi' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @Length(4, 30, { message: 'Username phải từ 4-30 ký tự' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang' })
  username: string;

  @IsString({ message: 'Password phải là chuỗi' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @Length(8, 50, { message: 'Password phải từ 8-50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số',
  })
  password: string;

  @IsString({ message: 'Họ tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  fullName: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^(0|\+84)\d{9,10}$/, { message: 'Số điện thoại không hợp lệ (phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx)' })
  phone: string;
}

export class UpdateShipperDto {
  @IsString({ message: 'Username phải là chuỗi' })
  @IsOptional()
  @Length(4, 30, { message: 'Username phải từ 4-30 ký tự' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang' })
  username?: string;

  @IsString({ message: 'Password phải là chuỗi' })
  @IsOptional()
  @Length(8, 50, { message: 'Password phải từ 8-50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số',
  })
  password?: string;

  @IsString({ message: 'Họ tên phải là chuỗi' })
  @IsOptional()
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  fullName?: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  @Matches(/^(0|\+84)\d{9,10}$/, { message: 'Số điện thoại không hợp lệ (phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx)' })
  phone?: string;

  @IsBoolean({ message: 'isRegistered phải là giá trị boolean' })
  @IsOptional()
  isRegistered?: boolean;

  @IsBoolean({ message: 'isAvailable phải là giá trị boolean' })
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber({}, { message: 'priority phải là số' })
  @IsOptional()
  @Min(1, { message: 'Độ ưu tiên tối thiểu là 1' })
  @Max(10, { message: 'Độ ưu tiên tối đa là 10' })
  priority?: number;

  @IsNumber({}, { message: 'maxDailyOrders phải là số' })
  @IsOptional()
  @Min(1, { message: 'Số đơn hàng tối thiểu là 1' })
  @Max(50, { message: 'Số đơn hàng tối đa là 50' })
  maxDailyOrders?: number;
}
