import { Service } from "typedi";
import { Account } from "./account.entity";
import { Role } from "@/auth/role/role.entity";
import {
  AccountNotFoundException,
  EntityNotFoundException,
  ForbiddenException,
  PhoneAlreadyExistedException,
  TokenNotFoundException,
  UsernameAlreadyExistedException,
} from "@/exceptions/http-exceptions";
import * as bcrypt from "bcrypt";
import {
  CreateAccountDto,
  CredentialsDto,
  UpdateAccountDto,
} from "../dtos/account.dto";
import { JwtService } from "../jwt/jwt.service";
import { RefreshToken } from "../jwt/refreshToken.entity";
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
    account.password = await bcrypt.hash(request.password, SALT_ROUNDS);
    account.name = request.name;
    account.role = role;
    return account;
  }

  async finalizeRegistration(
    username: string,
    password: string,
    phone: string,
    roleSlug: string
  ) {
    const role = await Role.findOne({
      where: {
        slug: roleSlug,
      },
    });
    if (!role) throw new EntityNotFoundException("Role");
    const newAccount = new Account();
    newAccount.username = username;
    newAccount.password = password;
    newAccount.role = role;
    newAccount.phone = phone;
    newAccount.isRegistered = true;
    await newAccount.save();
    const newRefreshToken = await this.jwtService.generateRefreshToken(
      newAccount
    );
    const accessToken = this.jwtService.generateAccessToken(newAccount);
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
    const account = await this.findAccountByUsername(credentials.username);
    if (!(await bcrypt.compare(credentials.password, account.password)))
      throw new AccountNotFoundException();

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
