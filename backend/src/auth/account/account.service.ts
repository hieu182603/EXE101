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
import { MoreThan } from "typeorm";
import { HttpMessages } from "@/exceptions/http-messages.constant";

const SALT_ROUNDS = 8;
@Service()
export class AccountService {
  constructor(private readonly jwtService: JwtService) {}

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
      const phone = "0" + request.phone.slice(-9);
      account.phone = phone;
      if (
        await Account.findOne({
          where: {
            phone,
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
    // Password was already hashed in register(), but if it's plain text here, hash it
    if (password && !password.startsWith("$2")) {
      existingAccount.password = await bcrypt.hash(password, SALT_ROUNDS);
    }
    if (phone && !existingAccount.phone) {
      existingAccount.phone = phone;
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
    // Support login by email or username
    let account: Account | null = null;
    if (credentials.email) {
      account = await Account.findOne({
        where: { email: credentials.email },
        relations: ["role"],
      });
    } else if (credentials.username) {
      account = await this.findAccountByUsername(credentials.username);
    }
    
    if (!account) {
      throw new AccountNotFoundException();
    }
    if (!(await bcrypt.compare(credentials.password, account.password)))
      throw new AccountNotFoundException();

    // Check if account is registered
    if (!account.isRegistered) {
      throw new AccountNotFoundException();
    }
    
    const token = await RefreshToken.findOne({
      where: {
        account,
        expiredAt: MoreThan(new Date()),
      },
    });
    let newRefreshToken: string = "";
    if (!token) {
      newRefreshToken = await this.jwtService.generateRefreshToken(account);
    }
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
    return account;
  }

  async updateAccount(username: string, request: UpdateAccountDto) {
    const account = await this.findAccountByUsername(username);
    if (request.username) account.username = request.username;
    if (request.phone) account.phone = request.phone;
    if (request.email) account.email = request.email;
    if (request.name) account.name = request.name;
    if (request.roleSlug) {
      const role = await Role.findOne({
        where: {
          slug: request.roleSlug,
        },
      });
      if (!role) throw new EntityNotFoundException("Role");
      if (role.name === "admin")
        throw new ForbiddenException(
          "You do not have permission to change to admin role."
        );
      account.role = role;
    }
    await account.save();
    return account;
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
    if (request.username) account.username = request.username;
    if (request.phone) account.phone = request.phone;
    if (request.name) account.name = request.name;
    await account.save();
    return account;
  }
}
