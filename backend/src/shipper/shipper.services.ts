import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Role } from "@/auth/role/role.entity";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";
import { EntityNotFoundException, BadRequestException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { DbConnection } from "@/database/dbConnection";

const SALT_ROUNDS = 8;

@Service()
export class ShipperService {
  private validatePhoneNumber(phone: string): void {
    // Support both formats: 0xxxxxxxxx (10 digits) or +84xxxxxxxxx (12 chars)
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('Invalid phone number format. Use: 0xxxxxxxxx or +84xxxxxxxxx');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!/\d/.test(password)) {
      throw new BadRequestException('Password must contain at least 1 number');
    }
    if (!/[a-zA-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least 1 letter');
    }
  }

  private validateUsername(username: string): void {
    if (username.length < 3 || username.length > 50) {
      throw new BadRequestException('Username must be between 3 and 50 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('Username can only contain letters, numbers and underscores');
    }
  }

  async createShipper(createShipperDto: CreateShipperDto): Promise<Account> {
    try {
      const connection = await DbConnection.getConnection();
      if (!connection) {
        throw new Error('Database connection failed');
      }
      return connection.transaction(async transactionalEntityManager => {
        // Validate fields
        this.validateUsername(createShipperDto.username);
        this.validatePassword(createShipperDto.password);
        this.validatePhoneNumber(createShipperDto.phone);

        // Check for existing account
        const existingAccount = await transactionalEntityManager.findOne(Account, { 
          where: [
            { username: createShipperDto.username },
            { phone: createShipperDto.phone }
          ]
        });

        if (existingAccount) {
          if (existingAccount.username === createShipperDto.username) {
            throw new BadRequestException("Username already exists");
          }
          if (existingAccount.phone === createShipperDto.phone) {
            throw new BadRequestException("Phone number already exists");
          }
        }

        const shipperRole = await transactionalEntityManager.findOne(Role, { 
          where: { name: "shipper" } 
        });
        if (!shipperRole) {
          throw new BadRequestException("Shipper role not found. Please create 'shipper' role first.");
        }

        const account = new Account();
        account.username = createShipperDto.username;
        account.password = await bcrypt.hash(createShipperDto.password, SALT_ROUNDS);
        account.phone = createShipperDto.phone;
        account.role = shipperRole;
        account.isRegistered = true;
        account.name = createShipperDto.fullName;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllShippers(): Promise<any[]> {
    const shipperRole = await Role.findOne({ where: { name: "shipper" } });
    if (!shipperRole) return [];

    const shippers = await Account.find({
      where: { role: { id: shipperRole.id } },
      relations: ["role", "shipperOrders", "feedbacks"],
      order: { createdAt: "DESC" }
    });

    // Import ShipperZone entity
    const { ShipperZone } = await import('./shipperZone.entity');

    // Lấy working zones cho từng shipper và tạo object mở rộng
    const shippersWithZones = [];
    for (const shipper of shippers) {
      const zones = await ShipperZone.find({
        where: { shipper: { id: shipper.id } }
      });
      
      // Chuyển đổi zones thành array of district names
      const workingZones = zones.map(zone => zone.district).filter(district => district);
      
      // Tạo object mở rộng với workingZones và field names mà frontend expect
      shippersWithZones.push({
        ...shipper,
        fullName: shipper.name,  // Frontend expect 'fullName'
        workingZones,
        dailyOrderCount: shipper.currentOrdersToday || 0,  // Frontend expect 'dailyOrderCount'
        maxDailyOrders: shipper.maxOrdersPerDay || 10      // Frontend expect 'maxDailyOrders'
      });
    }

    return shippersWithZones;
  }

  async getShipperById(id: string): Promise<Account> {
    const account = await Account.findOne({
      where: { id },
      relations: ["role", "shipperOrders"]
    });
    
    if (!account || account.role.name !== "shipper") {
      throw new EntityNotFoundException("Shipper");
    }
    
    return account;
  }

  async updateShipper(id: string, updateShipperDto: UpdateShipperDto): Promise<Account> {
    try {
      const connection = await DbConnection.getConnection();
      if (!connection) {
        throw new Error('Database connection failed');
      }
      return connection.transaction(async transactionalEntityManager => {
        const account = await this.getShipperById(id);

        if (updateShipperDto.username) {
          this.validateUsername(updateShipperDto.username);
          if (updateShipperDto.username !== account.username) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { username: updateShipperDto.username } 
            });
            if (existingAccount) {
              throw new BadRequestException("Username already exists");
            }
          }
        }

        if (updateShipperDto.phone) {
          this.validatePhoneNumber(updateShipperDto.phone);
          if (updateShipperDto.phone !== account.phone) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { phone: updateShipperDto.phone } 
            });
            if (existingAccount) {
              throw new BadRequestException("Phone number already exists");
            }
          }
        }

        if (updateShipperDto.password) {
          this.validatePassword(updateShipperDto.password);
          account.password = await bcrypt.hash(updateShipperDto.password, SALT_ROUNDS);
        }

        // Update other fields
        if (updateShipperDto.username) account.username = updateShipperDto.username;
        if (updateShipperDto.fullName) account.name = updateShipperDto.fullName;
        if (updateShipperDto.phone) account.phone = updateShipperDto.phone;
        if (updateShipperDto.isRegistered !== undefined) account.isRegistered = updateShipperDto.isRegistered;
        if (updateShipperDto.isAvailable !== undefined) account.isAvailable = updateShipperDto.isAvailable;
        if (updateShipperDto.priority !== undefined) account.priority = updateShipperDto.priority;
        if (updateShipperDto.maxDailyOrders !== undefined) account.maxOrdersPerDay = updateShipperDto.maxDailyOrders;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteShipper(id: string): Promise<void> {
    try {
      const connection = await DbConnection.getConnection();
      if (!connection) {
        throw new Error('Database connection failed');
      }
      return connection.transaction(async transactionalEntityManager => {
        const account = await this.getShipperById(id);
        
        // Check if shipper has active orders
        const hasActiveOrders = account.shipperOrders?.some(order => 
          ['PENDING', 'PROCESSING', 'SHIPPING'].includes(order.status)
        );

        if (hasActiveOrders) {
          throw new BadRequestException('Cannot delete shipper with active orders');
        }

        await transactionalEntityManager.remove(account);
      });
    } catch (error) {
      throw error;
    }
  }

  async getAvailableShippers(): Promise<Account[]> {
    try {
      const shipperRole = await Role.findOne({ where: { name: "shipper" } });
      if (!shipperRole) return [];

      return await Account.find({
        where: { 
          role: { id: shipperRole.id },
          isRegistered: true
        },
        relations: ["role"],
        order: { createdAt: "DESC" }
      });
    } catch (error) {
      throw error;
    }
  }

  async getShipperByUsername(username: string): Promise<Account> {
    const account = await Account.findOne({
      where: { username },
      relations: ["role"]
    });
    
    if (!account || account.role.name !== "shipper") {
      throw new EntityNotFoundException("Shipper");
    }
    
    return account;
  }
}
