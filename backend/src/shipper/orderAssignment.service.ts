import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Order } from "@/order/order.entity";
import { Role } from "@/auth/role/role.entity";
import { OrderStatus } from "@/order/dtos/update-order.dto";
import { DbConnection } from "@/database/dbConnection";
import { EntityManager } from "typeorm";
import { ShipperZone } from "./shipperZone.entity";
import { Like } from "typeorm";

// UUID validation helper
class ValidationHelper {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  static isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    return this.UUID_REGEX.test(uuid);
  }

  static validateUUID(uuid: string, fieldName: string): void {
    if (!this.isValidUUID(uuid)) {
      throw new Error(`Invalid ${fieldName} format: must be a valid UUID`);
    }
  }

  static validateRequiredString(value: string, fieldName: string, minLength: number = 1): void {
    if (!value || typeof value !== 'string' || value.trim().length < minLength) {
      throw new Error(`${fieldName} is required and must be at least ${minLength} characters`);
    }
  }
}

interface AssignmentResult {
  success: boolean;
  shipper?: Account;
  message: string;
  deliveryMethod?: string;
  estimatedTime?: number;
  errorCode?: string;
  details?: any;
}

interface AddressCoordinates {
  province: string;
  district: string;
  ward: string;
}

@Service()
export class OrderAssignmentService {
  // Cấu hình cơ bản
  private readonly DEFAULT_STORE_DISTRICT = "Cầu Giấy";

  /**
   * Phân công đơn hàng cho shipper
   */
  async assignOrderToShipper(order: Order): Promise<AssignmentResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!order || !order.id) {
        return this.createErrorResult("Invalid order: order object and ID are required", "INVALID_INPUT");
      }

      ValidationHelper.validateUUID(order.id, 'order.id');

      // 1. Trích xuất địa chỉ đơn hàng
      const orderAddress = this.extractOrderAddress(order);
      if (!orderAddress) {
        return this.createErrorResult("Không thể trích xuất địa chỉ từ đơn hàng", "ADDRESS_EXTRACTION_FAILED");
      }

      // 2. Logic phân công đơn giản hóa: Kiểm tra nếu là Hà Nội
      const isHanoi = this.isHanoiProvince(orderAddress.province);
      
      if (!isHanoi) {
        // Nếu không phải Hà Nội, chuyển sang đối tác thứ 3
        order.status = OrderStatus.EXTERNAL;
        await order.save();
        
        const processingTime = Date.now() - startTime;
        return {
          success: true,
          message: `Đơn hàng đã được chuyển cho đối tác vận chuyển (${processingTime}ms)`,
          deliveryMethod: 'third_party',
          estimatedTime: 48 // 48 giờ cho vận chuyển bên thứ 3
        };
      }
      
      // 3. Nếu là Hà Nội, tìm shipper phù hợp theo district
      const availableShippers = await this.findShippersForDistrict(orderAddress.district);
      
      if (!availableShippers || availableShippers.length === 0) {
        // Không tìm thấy shipper phù hợp
        const processingTime = Date.now() - startTime;
        return {
          success: false,
          message: `Không tìm thấy shipper phù hợp cho quận/huyện ${orderAddress.district} (${processingTime}ms)`,
          errorCode: "NO_SHIPPER_AVAILABLE"
        };
      }
      
      // 4. Sắp xếp shipper theo số đơn hiện tại (ít nhất lên đầu)
      availableShippers.sort((a, b) => 
        (a.currentOrdersToday || 0) - (b.currentOrdersToday || 0)
      );
      
      // 5. Chọn shipper đầu tiên (ít đơn nhất)
      const selectedShipper = availableShippers[0];
      
      // 6. Phân công đơn hàng cho shipper
      await this.assignOrderToShipperInternal(order, selectedShipper);
      
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        shipper: selectedShipper,
        message: `Đơn hàng đã được phân công cho shipper ${selectedShipper.name} (${processingTime}ms)`,
        deliveryMethod: 'local_shipper',
        estimatedTime: 24 // 24 giờ cho vận chuyển nội thành
      };
    } catch (error) {
      return this.createErrorResult("Lỗi khi phân loại đơn hàng", "ASSIGNMENT_ERROR", { error: (error as Error).message });
    }
  }

  /**
   * Trích xuất địa chỉ từ đơn hàng - Cải tiến cho format Việt Nam
   */
  private extractOrderAddress(order: Order): AddressCoordinates | null {
    if (!order.shippingAddress) {
      return null;
    }

    const rawAddress = order.shippingAddress.trim();
    
    // Validate minimum address length
    if (rawAddress.length < 10) {
      return null;
    }

    // Tách địa chỉ theo dấu phẩy
    const addressParts = rawAddress.split(',').map(part => part.trim()).filter(part => part.length > 0);
    
    // Luôn yêu cầu tối thiểu 2 phần trong địa chỉ (chi tiết + tỉnh/tp)
    if (addressParts.length < 2) {
      return null;
    }

    let province = '';
    let district = '';
    let ward = '';

    // Cải tiến logic phân tích địa chỉ
    try {
      // Luôn lấy phần tử cuối cùng là tỉnh/thành phố
      province = this.normalizeAddress(addressParts[addressParts.length - 1]);

      // QUAN TRỌNG: Kiểm tra nếu là Hà Nội
      const isHanoi = province.toLowerCase().includes('ha noi') || 
                     province.toLowerCase().includes('hanoi');
      
      if (isHanoi) {
        province = "Hà Nội";
        
        // Tìm quận/huyện trong các phần của địa chỉ
        // Trước tiên, kiểm tra phần áp cuối có phải quận/huyện không
        if (addressParts.length >= 2) {
          const potentialDistrict = addressParts[addressParts.length - 2].trim();
          
          // Danh sách quận/huyện Hà Nội
          const hanoiDistricts = [
            "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
            "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
            "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
            "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
            "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
          ];
          
          // Tìm quận/huyện phù hợp
          const foundDistrict = hanoiDistricts.find(d => 
            this.compareAddressParts(potentialDistrict, d)
          );
          
          if (foundDistrict) {
            district = foundDistrict;
            
            // Nếu có phường/xã (phần áp áp cuối)
            if (addressParts.length >= 3) {
              ward = addressParts[addressParts.length - 3].trim();
            }
          } else {
            // Tìm kiếm trong toàn bộ các phần địa chỉ
            for (let i = 0; i < addressParts.length - 1; i++) {
              const part = addressParts[i].trim();
              const foundDistrictInPart = hanoiDistricts.find(d => 
                this.compareAddressParts(part, d)
              );
              
              if (foundDistrictInPart) {
                district = foundDistrictInPart;
                break;
              }
            }
            
            // Nếu vẫn không tìm thấy, mặc định là quận của cửa hàng
            if (!district) {
              district = this.DEFAULT_STORE_DISTRICT;
            }
          }
        }
      } else {
        // Không phải Hà Nội, lấy quận/huyện từ phần tử áp cuối
        if (addressParts.length >= 2) {
          district = this.normalizeAddress(addressParts[addressParts.length - 2]);
        }
        
        // Lấy phường/xã từ phần áp áp cuối (nếu có)
        if (addressParts.length >= 3) {
          ward = this.normalizeAddress(addressParts[addressParts.length - 3]);
        }
      }

      // Post-processing: chuẩn hóa tên
      district = this.standardizeDistrictName(district);
      province = this.standardizeProvinceName(province);

      // Validation kết quả
      if (!province) {
        return null;
      }

      // Ưu tiên Hà Nội
      if (province !== 'Hà Nội') {
        // Log
      }

      const result = {
        province,
        district,
        ward
      };

      return result;

    } catch (error) {
      return null;
    }
  }
  
  /**
   * So sánh hai phần địa chỉ
   */
  private compareAddressParts(part1: string, part2: string): boolean {
    const norm1 = this.normalizeAddress(part1);
    const norm2 = this.normalizeAddress(part2);
    
    return norm1 === norm2 || 
           norm1.includes(norm2) || 
           norm2.includes(norm1);
  }

  /**
   * Chuẩn hóa tên địa chỉ (improved)
   */
  private normalizeAddress(address: string): string {
    if (!address || typeof address !== 'string') return '';
    
    return address
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
      .replace(/\b(quan|huyen|phuong|xa|tinh|thanh pho|tp|tp\.)\s+/gi, '') // Remove prefixes
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Chuẩn hóa tên quận để match với working zones
   */
  private standardizeDistrictName(district: string): string {
    const normalized = this.normalizeAddress(district);
    
    // Map common variations to standard names
    const districtMapping: { [key: string]: string } = {
      'thanh xuan': 'Thanh Xuân',
      'dong da': 'Đống Đa',
      'cau giay': 'Cầu Giấy',
      'ba dinh': 'Ba Đình',
      'hoan kiem': 'Hoàn Kiếm',
      'hai ba trung': 'Hai Bà Trưng',
      'tay ho': 'Tây Hồ',
      'hoang mai': 'Hoàng Mai',
      'long bien': 'Long Biên',
      'nam tu liem': 'Nam Từ Liêm',
      'bac tu liem': 'Bắc Từ Liêm',
      'ha dong': 'Hà Đông',
      'son tay': 'Sơn Tây',
      'phuc tho': 'Phúc Thọ',
      'dan phuong': 'Đan Phượng',
      'hoai duc': 'Hoài Đức',
      'quoc oai': 'Quốc Oai',
      'thach that': 'Thạch Thất',
    };

    return districtMapping[normalized] || district;
  }

  /**
   * Chuẩn hóa tên tỉnh
   */
  private standardizeProvinceName(province: string): string {
    const normalized = this.normalizeAddress(province);
    
    if (normalized.includes('ha noi') || normalized.includes('hanoi')) {
      return 'Hà Nội';
    }
    
    return province;
  }

  /**
   * Tìm shipper có sẵn
   */
  private async findAvailableShippers(orderAddress: AddressCoordinates): Promise<Account[]> {
    const shipperRole = await Role.findOne({ where: { name: "shipper" } });
    if (!shipperRole) {
      return [];
    }

    try {
      const allAvailableShippers = await Account.createQueryBuilder("account")
        .where("account.role.id = :roleId", { roleId: shipperRole.id })
        .andWhere("account.isRegistered = :isRegistered", { isRegistered: true })
        .andWhere("account.isAvailable = :isAvailable", { isAvailable: true })
        .andWhere(
          // Fix: Nếu maxOrdersPerDay = 0 thì coi như unlimited (999)
          "account.currentOrdersToday < CASE WHEN account.maxOrdersPerDay = 0 THEN 999 ELSE account.maxOrdersPerDay END"
        )
        .orderBy("account.priority", "DESC")
        .addOrderBy("account.currentOrdersToday", "ASC")
        .getMany();
      
      if (allAvailableShippers.length === 0) {
        return [];
      }
    
      // Zone matching logic với validation chặt chẽ hơn
      const shippersWithZones = [];
      
      for (const shipper of allAvailableShippers) {
        const zones = await ShipperZone.find({
          where: { shipper: { id: shipper.id } }
        });

        // Kiểm tra zone matching với validation nghiêm ngặt hơn
        let hasMatchingZone = false;
        let matchReason = '';
        
        if (zones.length === 0) {
          // ❌ REMOVED: Không cho phép shipper không có zone nhận đơn
          continue;
        }
        
        for (const zone of zones) {
          const isMatch = this.isAddressMatch(zone, orderAddress);
          if (isMatch) {
            hasMatchingZone = true;
            matchReason = `Zone match: ${zone.district}`;
            break;
          }
        }

        if (hasMatchingZone) {
          shippersWithZones.push(shipper);
        }
      }

      return shippersWithZones;
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Kiểm tra địa chỉ có match không (cải tiến)
   */
  private isAddressMatch(zone: any, orderAddress: AddressCoordinates): boolean {
    // Validate input
    if (!zone || !orderAddress) {
      return false;
    }

    // Normalize cả hai bên để so sánh
    const normalizeStr = (str: string) => {
      if (!str) return '';
      return str.toLowerCase()
        .trim()
        .replace(/^(quận|huyện|thành phố|tỉnh|phường|xã)\s+/g, '') // Bỏ tiền tố
        .replace(/\s+(quận|huyện|thành phố|tỉnh|phường|xã)$/g, '') // Bỏ hậu tố
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a') // Bỏ dấu tiếng Việt
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd');
    };
    
    const zoneProvince = normalizeStr(zone.province || '');
    const zoneDistrict = normalizeStr(zone.district || '');
    const zoneWard = normalizeStr(zone.ward || '');
    
    const orderProvince = normalizeStr(orderAddress.province || '');
    const orderDistrict = normalizeStr(orderAddress.district || '');
    const orderWard = normalizeStr(orderAddress.ward || '');

    // Special case cho Thanh Xuân
    if ((orderDistrict.includes('thanh xuan') || orderDistrict === 'tx') && 
        (zoneDistrict.includes('thanh xuan') || zoneDistrict === 'tx')) {
      return true;
    }

    // 1. Đặc biệt cho Hà Nội
    const isHanoiMatching = (zoneProvince.includes('ha noi') || zoneProvince.includes('hanoi')) && 
                           (orderProvince.includes('ha noi') || orderProvince.includes('hanoi'));
    
    if (isHanoiMatching) {
      // So sánh quận/huyện - cải tiến để match chính xác hơn
      if (zoneDistrict && orderDistrict) {
        // Xử lý đặc biệt cho các quận Hà Nội
        const cleanZoneDistrict = zoneDistrict.replace(/[^a-z0-9]/g, '');
        const cleanOrderDistrict = orderDistrict.replace(/[^a-z0-9]/g, '');
        
        // So khớp đúng tên quận
        if (cleanZoneDistrict === cleanOrderDistrict || 
            zoneDistrict === orderDistrict || 
            zoneDistrict.includes(orderDistrict) || 
            orderDistrict.includes(zoneDistrict)) {
          return true;
        }
        
        // Kiểm tra tên viết tắt hoặc tên rút gọn
        // Ví dụ: "cau giay" với "cg" hoặc "thanh xuan" với "tx"
        const districtAbbreviations: {[key: string]: string[]} = {
          'cau giay': ['cg', 'cau giay', 'c giay', 'c.giay'],
          'thanh xuan': ['tx', 'thanh xuan', 't xuan', 't.xuan'],
          'dong da': ['dd', 'dong da', 'd da', 'd.da'],
          'ba dinh': ['bd', 'ba dinh', 'b dinh', 'b.dinh'],
          'hai ba trung': ['hbt', 'hai ba trung', 'hb trung', 'h.b.trung'],
          'hoan kiem': ['hk', 'hoan kiem', 'h kiem', 'h.kiem'],
          'hoang mai': ['hm', 'hoang mai', 'h mai', 'h.mai'],
          'long bien': ['lb', 'long bien', 'l bien', 'l.bien'],
          'tay ho': ['th', 'tay ho', 't ho', 't.ho']
        };
        
        // Kiểm tra xem có match với bất kỳ viết tắt nào không
        for (const [fullName, abbreviations] of Object.entries(districtAbbreviations)) {
          if ((fullName === cleanZoneDistrict && abbreviations.includes(cleanOrderDistrict)) || 
              (fullName === cleanOrderDistrict && abbreviations.includes(cleanZoneDistrict))) {
            return true;
          }
        }
        
        return false;
      } else {
        // Nếu shipper không có quận/huyện cụ thể thì coi như phục vụ toàn Hà Nội
        if (!zoneDistrict && orderProvince.includes('ha noi')) {
          return true;
        }
        
        return false;
      }
    }

    // 2. Đối với các tỉnh/thành phố khác
    // Province validation - must match
    if (zoneProvince && orderProvince) {
      const provinceMatch = zoneProvince === orderProvince;
      
      if (!provinceMatch) {
        return false;
      }
      
      // Nếu shipper chỉ có province mà không có district, coi như phục vụ toàn tỉnh
      if (!zoneDistrict) {
        return true;
      }
      
      // Kiểm tra district
      if (zoneDistrict && orderDistrict) {
        const districtMatch = zoneDistrict === orderDistrict || 
                             zoneDistrict.includes(orderDistrict) || 
                             orderDistrict.includes(zoneDistrict);
        
        if (districtMatch) {
          return true;
        }
        
        return false;
      }
    }
    
    // Nếu đến đây mà vẫn chưa return thì coi như không match
    return false;
  }

  /**
   * Tìm shipper giao hàng nhanh
   */
  private async findExpressShippers(orderAddress: AddressCoordinates): Promise<Account[]> {
    // Sử dụng logic mới từ findAvailableShippers nhưng chỉ lấy shipper có priority cao
    const availableShippers = await this.findAvailableShippers(orderAddress);
    
    return availableShippers
      .filter(shipper => (shipper.priority || 1) >= 5)
      .slice(0, 3); // Lấy tối đa 3 shipper
  }

  /**
   * Kiểm tra shipper có còn available không
   */
  private async checkShipperAvailability(shipperId: string): Promise<boolean> {
    const shipper = await Account.findOne({ where: { id: shipperId } });
    return shipper?.isAvailable === true && 
           (shipper.currentOrdersToday || 0) < (shipper.maxOrdersPerDay || 999);
  }

  /**
   * Assign order to shipper
   */
  private async assignOrderToShipperInternal(order: Order, shipper: Account): Promise<void> {
    const connection = await DbConnection.getConnection();
    if (!connection) {
      throw new Error('Database connection failed');
    }

    return connection.transaction(async (transactionalEntityManager) => {
      // 1. Check if shipper is still available
      const currentShipper = await transactionalEntityManager.findOne(Account, {
        where: { id: shipper.id },
        lock: { mode: 'pessimistic_write' }
      });
      
      if (!currentShipper || !currentShipper.isAvailable) {
        throw new Error(`Shipper ${shipper.id} is no longer available`);
      }

      // 2. Check if order exists (KHÔNG sử dụng relations và lock riêng)
      const currentOrder = await transactionalEntityManager.findOne(Order, {
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' }
      });
      
      if (!currentOrder) {
        throw new Error(`Order ${order.id} not found`);
      }
      
      // Kiểm tra riêng xem order đã có shipper chưa (không dùng relations)
      if (currentOrder.shipper) {
        // Tìm thông tin shipper hiện tại (nếu có)
        const existingShipperId = currentOrder.shipper.id;
        if (existingShipperId) {
          const existingShipper = await transactionalEntityManager.findOne(Account, {
            where: { id: existingShipperId }
          });
          
          if (existingShipper) {
            throw new Error(`Order ${order.id} is already assigned to shipper ${existingShipper.name || existingShipper.id}`);
          }
        }
        throw new Error(`Order ${order.id} is already assigned to another shipper`);
      }

      // 3. Calculate current order count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentOrdersCount = await transactionalEntityManager
        .createQueryBuilder(Order, "order")
        .where("order.shipper_id = :shipperId", { shipperId: shipper.id }) // Dùng shipper_id thay vì shipper.id
        .andWhere("order.orderDate >= :today", { today })
        .andWhere("order.status IN (:...statuses)", { 
          statuses: [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.SHIPPING] 
        })
        .getCount();

      // 4. Check if exceeds maximum orders per day
      if (currentOrdersCount >= (currentShipper.maxOrdersPerDay || 999)) {
        throw new Error(`Shipper ${shipper.id} has reached maximum orders for today (${currentOrdersCount}/${currentShipper.maxOrdersPerDay})`);
      }

      // 5. Assign order to shipper and change status to ASSIGNED
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Order)
        .set({ 
          shipper: currentShipper,
          status: OrderStatus.ASSIGNED
        })
        .where("id = :orderId", { orderId: order.id })
        .execute();

      // 6. Update shipper statistics
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Account)
        .set({ 
          currentOrdersToday: currentOrdersCount + 1,
          lastOrderDate: new Date()
        })
        .where("id = :shipperId", { shipperId: shipper.id })
        .execute();
    });
  }

  /**
   * Cập nhật số đơn hàng của shipper
   */
  private async updateShipperOrderCount(shipperId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await Order.createQueryBuilder("order")
      .where("order.shipper_id = :shipperId", { shipperId }) // Sửa thành shipper_id
      .andWhere("order.orderDate >= :today", { today })
      .andWhere("order.status IN (:...statuses)", { 
        statuses: [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.SHIPPING] 
      })
      .getCount();

    await Account.createQueryBuilder("account")
      .update()
      .set({ 
        currentOrdersToday: count,
        lastOrderDate: new Date()
      })
      .where("account.id = :shipperId", { shipperId })
      .execute();
  }

  /**
   * Đếm số đơn hàng hiện tại của shipper
   */
  private async getCurrentOrdersCount(shipperId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await Order.createQueryBuilder("order")
      .where("order.shipper_id = :shipperId", { shipperId }) // Sửa thành shipper_id
      .andWhere("order.orderDate >= :today", { today })
      .andWhere("order.status IN (:...statuses)", { 
        statuses: [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.SHIPPING] 
      })
      .getCount();
  }

  /**
   * Tạo kết quả lỗi với format nhất quán
   */
  private createErrorResult(message: string, errorCode?: string, details?: any): AssignmentResult {
    return {
      success: false,
      message,
      errorCode,
      details
    };
  }

  /**
   * Tạo kết quả thành công với format nhất quán (overload cho third party)
   */
  private createSuccessResult(
    shipper: Account | undefined, 
    message: string, 
    score: number, 
    distance: number,
    deliveryMethod: string,
    estimatedTime: number
  ): AssignmentResult {
    return {
      success: true,
      shipper,
      message,
      deliveryMethod,
      estimatedTime
    };
  }

  async assignMultipleOrders(orders: Order[]): Promise<AssignmentResult[]> {
    const results: AssignmentResult[] = [];
    
    for (const order of orders) {
      try {
        const result = await this.assignOrderToShipper(order);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: `Lỗi khi phân công đơn hàng: ${(error as Error).message}`,
          errorCode: 'ASSIGNMENT_ERROR'
        });
      }
    }
    
    return results;
  }

  async resetDailyOrderCounts(): Promise<void> {
    const shipperRole = await Role.findOne({ where: { name: "shipper" } });
    if (!shipperRole) return;

    const shippers = await Account.find({ where: { role: { id: shipperRole.id } } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const shipper of shippers) {
      const currentOrdersCount = await Order.createQueryBuilder("order")
        .where("order.shipper_id = :shipperId", { shipperId: shipper.id }) // Sửa thành shipper_id
        .andWhere("order.orderDate >= :today", { today })
        .andWhere("order.status IN (:...statuses)", { 
          statuses: [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.SHIPPING] 
        })
        .getCount();

      await Account.createQueryBuilder("account")
        .update()
        .set({ 
          currentOrdersToday: currentOrdersCount,
          lastOrderDate: new Date()
        })
        .where("account.id = :shipperId", { shipperId: shipper.id })
        .execute();
    }
  }

  async updateShipperAvailability(shipperId: string, isAvailable: boolean): Promise<void> {
    await Account.createQueryBuilder("account")
      .update()
      .set({ isAvailable })
      .where("account.id = :shipperId", { shipperId })
      .execute();
  }

  async updateShipperWorkingZones(
    shipperId: string, 
    workingZones: string[]
  ): Promise<void> {
    // Validate input
    ValidationHelper.validateUUID(shipperId, 'shipperId');
    
    if (!workingZones || !Array.isArray(workingZones)) {
      throw new Error('Invalid input: workingZones must be an array');
    }

    if (workingZones.length === 0) {
      throw new Error('At least one working zone is required');
    }

    if (workingZones.length > 25) {
      throw new Error('Too many working zones (max 25 allowed)');
    }

    // Validate each zone is a valid string
    for (const zone of workingZones) {
      ValidationHelper.validateRequiredString(zone, 'working zone', 2);
    }

    // Import ShipperZone entity
    const { ShipperZone } = await import('./shipperZone.entity');
    
    const connection = await DbConnection.getConnection();
    if (!connection) {
      throw new Error('Database connection failed');
    }

    return connection.transaction(async (transactionalEntityManager) => {
      try {
        // Find shipper
        const shipper = await transactionalEntityManager.findOne(Account, {
          where: { id: shipperId }
        });
        
        if (!shipper) {
          throw new Error('Shipper not found');
        }

        // Validate working zones (should be valid Hanoi districts)
        const validHanoiDistricts = [
          "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
          "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
          "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
          "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
          "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
        ];

        // Strict validation - exact match required
        const invalidZones = workingZones.filter(zone => {
          return !validHanoiDistricts.some(validDistrict => 
            this.normalizeAddress(validDistrict) === this.normalizeAddress(zone) ||
            this.normalizeAddress(zone).includes(this.normalizeAddress(validDistrict)) ||
            this.normalizeAddress(validDistrict).includes(this.normalizeAddress(zone))
          );
        });

        if (invalidZones.length > 0) {
          throw new Error(`Invalid working zones: ${invalidZones.join(', ')}. Must be valid Hanoi districts.`);
        }

        // Remove duplicates and normalize
        const uniqueZones = [...new Set(workingZones.map(zone => zone.trim()).filter(zone => zone.length > 0))];

        // Check existing zones before delete
        const existingZones = await transactionalEntityManager.find(ShipperZone, {
          where: { shipper: { id: shipperId } }
        });

        // Delete existing zones with verification
        const deleteResult = await transactionalEntityManager.delete(ShipperZone, {
          shipper: { id: shipperId }
        });

        // Verify deletion worked
        const remainingZones = await transactionalEntityManager.find(ShipperZone, {
          where: { shipper: { id: shipperId } }
        });
        
        if (remainingZones.length > 0) {
          throw new Error('Failed to delete existing zones');
        }

        // Create new zones - standardize all as Hanoi districts
        const createdZones = [];
        for (const zone of uniqueZones) {
          const shipperZone = new ShipperZone();
          shipperZone.shipper = shipper;
          shipperZone.province = 'Hà Nội';
          shipperZone.district = zone;
          shipperZone.ward = '';
          
          const savedZone = await transactionalEntityManager.save(shipperZone);
          createdZones.push(savedZone);
        }

        // Final verification
        const finalZones = await transactionalEntityManager.find(ShipperZone, {
          where: { shipper: { id: shipperId } }
        });
        
        if (finalZones.length !== uniqueZones.length) {
          throw new Error('Zone creation verification failed');
        }

      } catch (error) {
        throw error;
      }
    });
  }

  async updateShipperPriority(shipperId: string, priority: number): Promise<void> {
    // Validate input
    ValidationHelper.validateUUID(shipperId, 'shipperId');
    
    if (typeof priority !== 'number' || priority < 1 || priority > 10) {
      throw new Error('Priority must be a number between 1 and 10');
    }

    await Account.createQueryBuilder("account")
      .update()
      .set({ priority })
      .where("account.id = :shipperId", { shipperId })
      .execute();
  }

  /**
   * Kiểm tra tỉnh/thành phố Hà Nội
   */
  private isHanoiProvince(province: string): boolean {
    if (!province) return false;
    
    const normalizedProvince = this.normalizeAddress(province).toLowerCase();
    const hanoiNames = ['hà nội', 'hanoi', 'ha noi', 'hn'];
    
    return hanoiNames.some(name => normalizedProvince.includes(name));
  }

  /**
   * Tìm shipper phù hợp với district
   */
  private async findShippersForDistrict(district: string): Promise<Account[]> {
    if (!district) return [];
    
    try {
      const normalizedDistrict = this.normalizeAddress(district).toLowerCase();
      
      // Tìm role shipper
      const shipperRole = await Role.findOne({ where: { name: "shipper" } });
      if (!shipperRole) {
        return [];
      }
      
      // Xử lý các trường hợp đặc biệt và viết tắt của quận/huyện
      let districtVariations = [normalizedDistrict];
      
      // Xử lý viết tắt và đầy đủ của Thanh Xuân
      if (normalizedDistrict.includes('thanh xuan') || normalizedDistrict === 'tx') {
        districtVariations = ['thanh xuan', 'thanh xuân', 'tx'];
      }
      
      // Xử lý các quận khác tương tự
      if (normalizedDistrict.includes('cau giay') || normalizedDistrict === 'cg') {
        districtVariations = ['cau giay', 'cầu giấy', 'cg'];
      }
      
      if (normalizedDistrict.includes('dong da') || normalizedDistrict === 'dd') {
        districtVariations = ['dong da', 'đống đa', 'dd'];
      }
      
      if (normalizedDistrict.includes('hoang mai') || normalizedDistrict === 'hm') {
        districtVariations = ['hoang mai', 'hoàng mai', 'hm'];
      }
      
      if (normalizedDistrict.includes('long bien') || normalizedDistrict === 'lb') {
        districtVariations = ['long bien', 'long biên', 'lb'];
      }
      
      if (normalizedDistrict.includes('nam tu liem') || normalizedDistrict === 'ntl') {
        districtVariations = ['nam tu liem', 'nam từ liêm', 'ntl'];
      }
      
      // Tìm tất cả zone khớp với district hoặc các biến thể của nó
      const shipperZones = [];
      
      for (const districtVariation of districtVariations) {
        const zones = await ShipperZone.find({
          relations: ['shipper']
        });
        
        // Lọc thủ công để xử lý các biến thể
        const matchedZones = zones.filter(zone => {
          if (!zone.district) return false;
          
          const zoneDistrict = this.normalizeAddress(zone.district).toLowerCase();
          return districtVariations.some(variation => 
            zoneDistrict.includes(variation) || variation.includes(zoneDistrict)
          );
        });
        
        shipperZones.push(...matchedZones);
      }
      
      // Loại bỏ trùng lặp
      const uniqueZones = [...new Map(shipperZones.map(zone => [zone.id, zone])).values()];
      
      if (uniqueZones.length === 0) {
        return [];
      }
      
      // Lọc shipper đang khả dụng và chưa đạt giới hạn đơn hàng
      const availableShippers = [];
      const processedShipperIds = new Set(); // Tránh trùng lặp shipper
      
      for (const zone of uniqueZones) {
        const shipper = zone.shipper;
        
        // Bỏ qua nếu đã xử lý shipper này
        if (processedShipperIds.has(shipper.id)) continue;
        processedShipperIds.add(shipper.id);
        
        // Kiểm tra shipper có khả dụng không
        if (shipper && 
            shipper.isAvailable && 
            shipper.isRegistered && 
            (!shipper.maxOrdersPerDay || shipper.currentOrdersToday < shipper.maxOrdersPerDay)) {
          availableShippers.push(shipper);
        }
      }
      
      return availableShippers;
    } catch (error) {
      return [];
    }
  }
} 