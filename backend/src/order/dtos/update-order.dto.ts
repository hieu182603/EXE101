import {
  IsString,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsNotEmpty,
  Length,
} from "class-validator";

export enum OrderStatus {
  PENDING = "PENDING", // Đơn hàng mới tạo
  ASSIGNED = "ASSIGNED", // Đã phân công shipper, chờ xác nhận
  CONFIRMED = "CONFIRMED", // Shipper đã xác nhận nhận đơn
  SHIPPING = "SHIPPING", // Đang giao hàng
  DELIVERED = "DELIVERED", // Đã giao hàng
  CANCELLED = "CANCELLED", // Đã hủy
  EXTERNAL = "EXTERNAL", // Đơn giao qua đối tác
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus, { message: "Trạng thái đơn hàng không hợp lệ" })
  @IsNotEmpty({ message: "Trạng thái đơn hàng không được để trống" })
  status: OrderStatus;

  @ValidateIf((o) => o.status === OrderStatus.CANCELLED)
  @IsString({ message: "Lý do hủy phải là chuỗi" })
  @IsNotEmpty({ message: "Lý do hủy không được để trống khi hủy đơn hàng" })
  @Length(10, 200, { message: "Lý do hủy phải từ 10-200 ký tự" })
  cancelReason?: string;
}
