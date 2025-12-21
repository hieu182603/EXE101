import { IsString, IsOptional, IsNotEmpty, Length, Matches, IsEmail, IsPhoneNumber } from "class-validator";

export class CreateCustomerDto {
  @IsString({ message: 'Username phải là chuỗi' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @Length(4, 20, { message: 'Username phải từ 4-20 ký tự' })
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

export class UpdateCustomerDto {
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
}
