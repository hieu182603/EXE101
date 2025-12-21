import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Role } from "@/auth/role/role.entity";
import { CreateCustomerDto, UpdateCustomerDto } from "./dtos/customer.dtos";
import { EntityNotFoundException, BadRequestException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { DbConnection } from "@/database/dbConnection";
import { Cart } from "@/Cart/cart.entity";
import { Feedback } from "@/feedback/feedback.entity";
import { SMSNotification } from "@/notification/smsNotification.entity";
import { Marketing } from "@/marketing/marketing.entity";
import { RefreshToken } from "@/auth/jwt/refreshToken.entity";

const SALT_ROUNDS = 8;

@Service()
export class CustomerService {
  private validatePhoneNumber(phone: string): void {
    //Support both formats: 0xxxxxxxxx (10 digits) or +84xxxxxxxxx (12 chars)
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

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Account> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new BadRequestException("Database connection not available");
      }

      return await dataSource.manager.transaction(async transactionalEntityManager => {
        // Validate fields
        this.validateUsername(createCustomerDto.username);
        this.validatePassword(createCustomerDto.password);
        this.validatePhoneNumber(createCustomerDto.phone);

        // Check for existing account
        const existingAccount = await transactionalEntityManager.findOne(Account, { 
          where: [
            { username: createCustomerDto.username },
            { phone: createCustomerDto.phone }
          ]
        });

        if (existingAccount) {
          if (existingAccount.username === createCustomerDto.username) {
            throw new BadRequestException("Username already exists");
          }
          if (existingAccount.phone === createCustomerDto.phone) {
            throw new BadRequestException("Phone number already exists");
          }
        }

        const customerRole = await transactionalEntityManager.findOne(Role, { 
          where: { name: "customer" } 
        });
        if (!customerRole) {
          throw new BadRequestException("Customer role not found. Please create 'customer' role first.");
        }

        const account = new Account();
        account.username = createCustomerDto.username;
        account.password = await bcrypt.hash(createCustomerDto.password, SALT_ROUNDS);
        account.phone = createCustomerDto.phone;
        account.role = customerRole;
        account.isRegistered = true;
        account.name = createCustomerDto.fullName;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(): Promise<Account[]> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) return [];

    const roleRepo = dataSource.getRepository(Role);
    const accountRepo = dataSource.getRepository(Account);

    const customerRole = await roleRepo.findOne({ where: { name: "customer" } });
    if (!customerRole) return [];

    return await accountRepo.find({
      where: { role: { id: customerRole.id } },
      relations: ["role", "customerOrders"],
      order: { createdAt: "DESC" }
    });
  }

  async getCustomerById(id: string): Promise<Account> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new BadRequestException("Database connection not available");
    }

    const accountRepo = dataSource.getRepository(Account);
    const account = await accountRepo.findOne({
      where: { id },
      relations: ["role", "customerOrders"]
    });
    
    if (!account || account.role.name !== "customer") {
      throw new EntityNotFoundException("Customer");
    }
    
    return account;
  }

  async getCustomerByUsername(username: string): Promise<Account> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new BadRequestException("Database connection not available");
    }

    const accountRepo = dataSource.getRepository(Account);
    const account = await accountRepo.findOne({
      where: { username },
      relations: ["role", "customerOrders"]
    });
    
    if (!account || account.role.name !== "customer") {
      throw new EntityNotFoundException("Customer");
    }
    
    return account;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Account> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new BadRequestException("Database connection not available");
      }

      return await dataSource.manager.transaction(async transactionalEntityManager => {
        const account = await this.getCustomerById(id);

        if (updateCustomerDto.username) {
          this.validateUsername(updateCustomerDto.username);
          if (updateCustomerDto.username !== account.username) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { username: updateCustomerDto.username } 
            });
            if (existingAccount) {
              throw new BadRequestException("Username already exists");
            }
          }
        }

        if (updateCustomerDto.phone) {
          this.validatePhoneNumber(updateCustomerDto.phone);
          if (updateCustomerDto.phone !== account.phone) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { phone: updateCustomerDto.phone } 
            });
            if (existingAccount) {
              throw new BadRequestException("Phone number already exists");
            }
          }
        }

        if (updateCustomerDto.password) {
          this.validatePassword(updateCustomerDto.password);
          account.password = await bcrypt.hash(updateCustomerDto.password, SALT_ROUNDS);
        }

        // Update other fields
        if (updateCustomerDto.username) account.username = updateCustomerDto.username;
        if (updateCustomerDto.fullName) account.name = updateCustomerDto.fullName;
        if (updateCustomerDto.phone) account.phone = updateCustomerDto.phone;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new BadRequestException("Database connection not available");
      }

      return await dataSource.manager.transaction(async transactionalEntityManager => {
        const account = await this.getCustomerById(id);
        
        // Check if customer has active orders or transactions
        const hasActiveOrders = account.customerOrders?.some(order => 
          ['PENDING', 'PROCESSING', 'SHIPPING'].includes(order.status)
        );

        if (hasActiveOrders) {
          throw new BadRequestException('Cannot delete customer with active orders');
        }

        // Clean up related data before deletion
        const cartRepo = transactionalEntityManager.getRepository(Cart);
        const feedbackRepo = transactionalEntityManager.getRepository(Feedback);
        const smsRepo = transactionalEntityManager.getRepository(SMSNotification);
        const marketingRepo = transactionalEntityManager.getRepository(Marketing);
        const refreshTokenRepo = transactionalEntityManager.getRepository(RefreshToken);

        // Remove cart items first, then cart
        const cart = await cartRepo.findOne({
          where: { account: { id: account.id } },
          relations: ['cartItems']
        });
        if (cart && cart.cartItems) {
          await transactionalEntityManager.remove(cart.cartItems);
          await transactionalEntityManager.remove(cart);
        }

        // Remove other related entities
        await feedbackRepo.delete({ account: { id: account.id } });
        await smsRepo.delete({ account: { id: account.id } });
        await marketingRepo.delete({ account: { id: account.id } });
        await refreshTokenRepo.delete({ account: { id: account.id } });

        // Finally remove the account
        await transactionalEntityManager.softRemove(account);
      });
    } catch (error) {
      throw error;
    }
  }

  async searchCustomers(searchTerm: string): Promise<Account[]> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) return [];

    const accountRepo = dataSource.getRepository(Account);
    
    return await accountRepo
      .createQueryBuilder("account")
      .leftJoinAndSelect("account.role", "role")
      .leftJoinAndSelect("account.customerOrders", "orders")
      .where("role.name = :roleName", { roleName: "customer" })
      .andWhere("(account.username ILIKE :searchTerm OR account.name ILIKE :searchTerm OR account.phone ILIKE :searchTerm)", 
        { searchTerm: `%${searchTerm}%` })
      .orderBy("account.createdAt", "DESC")
      .getMany();
  }
}
