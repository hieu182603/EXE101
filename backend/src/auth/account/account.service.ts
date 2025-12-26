import { Service } from "typedi";
import { Account } from "./account.entity";
import { Role } from "@/role/role.entity";
import {
  AccountNotFoundException,
  EntityNotFoundException,
  ForbiddenException,
  PhoneAlreadyExistedException,
  TokenNotFoundException,
  UsernameAlreadyExistedException,
  ValidationException,
} from "@/exceptions/http-exceptions";
import * as bcrypt from "bcrypt";
import {
  CreateAccountDto,
  CredentialsDto,
  UpdateAccountDto,
} from "../dtos/account.dto";
import { JwtService } from "@/jwt/jwt.service";
import { RefreshToken } from "@/jwt/refreshToken.entity";
import { ShipperProfile } from "./shipperProfile.entity";
import { RoleService } from "@/role/role.service";
import { MoreThan } from "typeorm";
import { HttpMessages } from "@/exceptions/http-messages.constant";

const SALT_ROUNDS = 8;
@Service()
export class AccountService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService
  ) {}

  async register(request: CreateAccountDto): Promise<Account> {
    const role = await Role.findOne({
      where: {
        slug: request.roleSlug,
      },
    });
    if (role == null) throw new EntityNotFoundException("Role");
    const account = new Account();
    account.username = request.username;
    if (
      await Account.findOne({
        where: {
          username: request.username,
        },
      })
    )
      throw new UsernameAlreadyExistedException(HttpMessages._USERNAME_EXISTED);
    
    // Email is required for registration
    if (!request.email) {
      throw new ValidationException("Email is required for registration");
    }
    
    // Check if email already exists
    if (
      await Account.findOne({
        where: {
          email: request.email,
        },
      })
    )
      throw new ValidationException("Email already registered");
    
    account.email = request.email;
    account.password = await bcrypt.hash(request.password, SALT_ROUNDS);
    account.role = role;
    account.isRegistered = false; // Set explicitly to false for new registrations
    
    // Phone and name are optional
    if (request.phone) {
      // Validate and normalize phone number
      const phoneRegex = /^(0|\+84)\d{9,10}$/;
      if (!phoneRegex.test(request.phone)) {
        throw new ValidationException("Invalid phone number format");
      }

      // Normalize to start with 0
      const normalizedPhone = request.phone.startsWith('+84')
        ? '0' + request.phone.slice(3)
        : request.phone;

      account.phone = normalizedPhone;

      // Check if phone already exists
      if (
        await Account.findOne({
          where: {
            phone: normalizedPhone,
          },
        })
      )
        throw new PhoneAlreadyExistedException(HttpMessages._PHONE_EXISTED);
    }
    
    if (request.name) {
      account.name = request.name;
    }
    
    // Save account to database so OTP service can find it
    try {
      await account.save();
    } catch (error) {
      console.error("Error saving account:", error);
      throw new ValidationException("Failed to save account. Please try again.");
    }
    
    return account;
  }

  async finalizeRegistration(
    username: string,
    password: string,
    email: string,
    roleSlug: string,
    phone?: string
  ) {
    // Find existing account by email or username
    const existingAccount = await Account.findOne({
      where: [
        { email: email },
        { username: username }
      ],
      relations: ["role"],
    });
    
    if (!existingAccount) {
      throw new AccountNotFoundException();
    }
    
    // Update account to mark as registered
    existingAccount.isRegistered = true;

    // Update password if provided (should already be hashed from register)
    if (password) {
      existingAccount.password = password;
    }

    // Update phone if provided and not already set
    if (phone && !existingAccount.phone) {
      const phoneRegex = /^(0|\+84)\d{9,10}$/;
      if (!phoneRegex.test(phone)) {
        throw new ValidationException("Invalid phone number format");
      }
      existingAccount.phone = phone.startsWith('+84') ? '0' + phone.slice(3) : phone;
    }
    await existingAccount.save();
    const newRefreshToken = await this.jwtService.generateRefreshToken(
      existingAccount
    );
    const accessToken = this.jwtService.generateAccessToken(existingAccount);
    return { newRefreshToken, accessToken };
  }

  async removeNewAccounts(): Promise<void> {
    const accounts = await Account.find({
      where: {
        isRegistered: false,
      },
    });
    if (accounts.length > 0)
      await Promise.all(accounts.map((account) => account.softRemove()));
  }

  async login(
    credentials: CredentialsDto
  ): Promise<{ newRefreshToken: string; accessToken: string }> {
    // Find account by email or username
    let account: Account | null = null;

    if (credentials.email) {
      account = await Account.findOne({
        where: { email: credentials.email },
        relations: ["role", "shipperProfile"],
      });
    } else if (credentials.username) {
      account = await Account.findOne({
        where: { username: credentials.username },
        relations: ["role", "shipperProfile"],
      });
    }

    if (!account) {
      throw new AccountNotFoundException("Invalid credentials");
    }

    // Check if account is registered
    if (!account.isRegistered) {
      throw new ValidationException("Account not verified. Please check your email for OTP.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, account.password);
    if (!isPasswordValid) {
      throw new ValidationException("Invalid credentials");
    }

    // Always generate new refresh token for security
    const newRefreshToken = await this.jwtService.generateRefreshToken(account);
    const accessToken = this.jwtService.generateAccessToken(account);

    return { newRefreshToken, accessToken };
  }

  async logout(username: string): Promise<string> {
    const account = await this.findAccountByUsername(username);
    const token = await this.jwtService.getRefreshToken(account);
    if (!token) throw new TokenNotFoundException();
    await token.softRemove();
    return "Logged out";
  }

  async findAccountByUsername(username: string): Promise<Account> {
    const account = await Account.findOne({
      where: {
        username,
      },
      relations: ["role"],
    });
    if (!account) throw new AccountNotFoundException();
    return account;
  }

  async findAccountByPhone(phone: string): Promise<Account> {
    const account = await Account.findOne({
      where: {
        phone,
      },
    });
    if (!account) throw new AccountNotFoundException();
    return account;
  }

  async checkOldPassword(
    account: Account,
    oldPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(oldPassword, account.password);
  }

  async changePassword(account: Account, newPassword: string) {
    account.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await account.save();
    return account;
  }

  async getAccounts() {
    return await Account.find({
      relations: ["role"],
    });
  }

  async createAccount(
    username: string,
    password: string,
    name: string,
    phone: string,
    roleSlug: string
  ) {
    const role = await Role.findOne({
      where: {
        slug: roleSlug,
      },
    });
    if (!role) throw new EntityNotFoundException("Role");
    const checkUsername = await Account.findOne({
      where: {
        username,
      },
    });
    if (checkUsername)
      throw new UsernameAlreadyExistedException(HttpMessages._USERNAME_EXISTED);
    const checkPhone = await Account.findOne({
      where: {
        phone,
      },
    });
    if (checkPhone)
      throw new PhoneAlreadyExistedException(HttpMessages._PHONE_EXISTED);
    if (role.name === "admin")
      throw new ForbiddenException(
        "You do not have permission to create admin account."
      );
    const account = new Account();
    account.username = username;
    account.password = await bcrypt.hash(password, SALT_ROUNDS);
    account.phone = phone;
    account.name = name;
    account.role = role;
    account.isRegistered = true;
    await account.save();

    // Create shipper profile if role is shipper
    if (role.slug === 'shipper') {
      const shipperProfile = new ShipperProfile();
      shipperProfile.account = account;
      shipperProfile.maxOrdersPerDay = 50; // Default values
      shipperProfile.currentOrdersToday = 0;
      shipperProfile.isAvailable = true;
      shipperProfile.priority = 1;
      await shipperProfile.save();
    }

    return account;
  }

  async updateAccount(username: string, request: UpdateAccountDto) {
    const account = await Account.findOne({
      where: { username },
      relations: ["role"]
    });

    if (!account) {
      throw new AccountNotFoundException();
    }

    let roleChanged = false;
    let changes: string[] = [];

    // Update username with uniqueness check
    if (request.username && request.username !== account.username) {
      const existingAccount = await Account.findOne({
        where: { username: request.username }
      });
      if (existingAccount) {
        throw new UsernameAlreadyExistedException("Username already exists");
      }
      account.username = request.username;
      changes.push("username");
    }

    // Update email with uniqueness check
    if (request.email && request.email !== account.email) {
      const existingAccount = await Account.findOne({
        where: { email: request.email }
      });
      if (existingAccount) {
        throw new ValidationException("Email already registered");
      }
      account.email = request.email;
      changes.push("email");
    }

    // Update phone with validation
    if (request.phone !== undefined) {
      if (request.phone) {
        const phoneRegex = /^(0|\+84)\d{9,10}$/;
        if (!phoneRegex.test(request.phone)) {
          throw new ValidationException("Invalid phone number format");
        }
        const normalizedPhone = request.phone.startsWith('+84')
          ? '0' + request.phone.slice(3)
          : request.phone;

        // Check uniqueness if phone changed
        if (normalizedPhone !== account.phone) {
          const existingAccount = await Account.findOne({
            where: { phone: normalizedPhone }
          });
          if (existingAccount) {
            throw new PhoneAlreadyExistedException("Phone number already registered");
          }
          account.phone = normalizedPhone;
          changes.push("phone");
        }
      } else {
        account.phone = null;
        changes.push("phone");
      }
    }

    // Update name
    if (request.name !== undefined) {
      account.name = request.name;
      changes.push("name");
    }

    // Update role
    if (request.roleSlug) {
      const role = await Role.findOne({
        where: { slug: request.roleSlug },
      });
      if (!role) {
        throw new EntityNotFoundException("Role");
      }

      if (role.name === "admin") {
        throw new ForbiddenException("You do not have permission to change to admin role.");
      }

      if (account.role.slug !== request.roleSlug) {
        account.role = role;
        roleChanged = true;
        changes.push("role");

        // Revoke refresh token to force re-login with new role
        const refreshToken = await this.jwtService.getRefreshToken(account);
        if (refreshToken) {
          await this.jwtService.revokeRefreshToken(refreshToken.token);
        }
      }
    }

    // Only save if there are changes
    if (changes.length > 0) {
      await account.save();
    }

    const message = roleChanged
      ? "Role updated successfully. User must login again to apply changes."
      : changes.length > 0
        ? "Account updated successfully."
        : "No changes made.";

    return {
      account,
      message,
      requiresRelogin: roleChanged,
      changes
    };
  }

  async deleteAccount(username: string) {
    const account = await this.findAccountByUsername(username);
    if (account.role.name === "admin")
      throw new ForbiddenException(
        "You do not have permission to delete admin account."
      );
    await account.softRemove();
    return account;
  }

  async updateAdmin(username: string, request: UpdateAccountDto) {
    const account = await this.findAccountByUsername(username);
    if (account.role.name !== "admin")
      throw new ForbiddenException(
        "You do not have permission to update admin account."
      );

    let roleChanged = false;
    if (request.username) account.username = request.username;
    if (request.phone) account.phone = request.phone;
    if (request.name) account.name = request.name;
    if (request.roleSlug) {
      const role = await Role.findOne({
        where: {
          slug: request.roleSlug,
        },
      });
      if (!role) throw new EntityNotFoundException("Role");
      account.role = role;
      roleChanged = true;

      // Revoke refresh token to force re-login with new role
      const refreshToken = await this.jwtService.getRefreshToken(account);
      if (refreshToken) {
        await this.jwtService.revokeRefreshToken(refreshToken.token);
      }
    }
    await account.save();

    return {
      account,
      message: roleChanged ? "Role updated successfully. User must login again to apply changes." : "Account updated successfully.",
      requiresRelogin: roleChanged
    };
  }
}
