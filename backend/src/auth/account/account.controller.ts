import {
  Body,
  BodyParam,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { Service } from "typedi";
import { AccountService } from "./account.service";
import {
  AccountDetailsDto,
  CreateAccountDto,
  CredentialsDto,
  UpdateAccountDto,
  VerifyRegisterDto,
} from "../dtos/account.schema";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { Response } from "express";
import { OtpService } from "@/otp/otp.service";
import { Account } from "./account.entity";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { ValidationException, AccountNotFoundException } from "@/exceptions/http-exceptions";

@Service()
@Controller("/account")
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly otpService: OtpService
  ) {}

  @Post("/register")
  async register(@Body() body: CreateAccountDto) {
    try {
      console.log("📥 Registration request received:", {
        username: body.username,
        email: body.email,
        roleSlug: body.roleSlug,
        hasPassword: !!body.password,
      });
      
      const account = await this.accountService.register(body);
      // Gửi OTP qua email (email is required)
      if (!account.email) {
        throw new ValidationException("Email is required for registration");
      }
      await this.otpService.sendOtp(account.email, account.name, "registration");
      return {
        account: account,
        message: "Check OTP email to complete registration",
      };
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error details:", {
        message: error?.message,
        httpCode: error?.httpCode,
        status: error?.status,
        errors: error?.errors,
      });
      throw error;
    }
  }

  @Post("/verify-register")
  async verifyRegister(@Body() body: VerifyRegisterDto, @Res() res: Response) {
    const identifier = body.email;
    const result = await this.otpService.verifyOtp(identifier, body.otp);
    if (!result) throw new ValidationException("OTP is wrong or is expired");
    const tokens = await this.accountService.finalizeRegistration(
      body.username,
      body.password,
      body.email,
      body.roleSlug,
      body.phone
    );
    res.cookie("refreshToken", tokens.newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    return tokens.accessToken;
  }

  @Delete("/registration-cancelled")
  async cancelRegistrations() {
    await this.accountService.removeNewAccounts();
  }

  @Post("/login")
  async login(@Body() body: CredentialsDto, @Res() res: Response) {
    const tokens = await this.accountService.login(body);
    res.cookie("refreshToken", tokens.newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    return tokens.accessToken;
  }

  @Post("/resend-otp")
  async resendOtp(@BodyParam("identifier") identifier: string) {
    await this.otpService.sendOtp(identifier);
    return "OTP resent";
  }

  @Post("/logout")
  async logout(@BodyParam("username") username: string) {
    return await this.accountService.logout(username);
  }

  @Get("/details")
  @UseBefore(Auth)
  async viewAccountDetails(@Req() req: any) {
    const user = req.user as AccountDetailsDto;
    return await this.accountService.findAccountByUsername(user.username);
  }

  @Post("/change-password")
  @UseBefore(Auth)
  async preChangePassword(
    @Req() req: any,
    @BodyParam("oldPassword") oldPassword: string
  ) {
    const user = req.user as AccountDetailsDto;
    const account = await this.accountService.findAccountByUsername(
      user.username
    );
    const checkOldPassword = await this.accountService.checkOldPassword(
      account,
      oldPassword
    );
    if (!checkOldPassword) return "Wrong old password";
    const identifier = account.email || account.phone;
    if (!identifier) {
      throw new ValidationException("Account must have email or phone to change password");
    }
    await this.otpService.sendOtp(identifier, account.name, "password-change");
    return "Check OTP email to complete password change";
  }

  @Post("/verify-change-password")
  async verifyChangePassword(
    @BodyParam("email") email: string,
    @BodyParam("otp") otp: string,
    @BodyParam("newPassword") newPassword: string
  ) {
    const account = await Account.findOne({
      where: { email },
      relations: ["role"],
    });
    if (!account) throw new AccountNotFoundException();
    const identifier = account.email || account.phone;
    if (!identifier) {
      throw new ValidationException("Account must have email or phone to verify OTP");
    }
    const result = await this.otpService.verifyOtp(identifier, otp);
    if (!result) return "OTP is wrong or is expired";
    const token = await this.accountService.changePassword(
      account,
      newPassword
    );
    return token;
  }

  @Post("/forgot-password")
  async forgotPassword(@BodyParam("email") email: string) {
    const account = await Account.findOne({
      where: { email },
      relations: ["role"],
    });
    if (!account) throw new AccountNotFoundException();
    const identifier = account.email || account.phone;
    if (!identifier) {
      throw new ValidationException("Account must have email or phone to reset password");
    }
    await this.otpService.sendOtp(identifier, account.name, "forgot-password");
    return "Check OTP email to reset password";
  }

  @Post("/send-otp")
  async sendOtp(@BodyParam("username") username: string) {
    const account = await this.accountService.findAccountByUsername(username);
    const identifier = account.email || account.phone;
    if (!identifier) {
      throw new ValidationException("Account must have email or phone to send OTP");
    }
    return await this.otpService.sendOtp(identifier, account.name);
  }

  @Post("/verify-otp")
  async verifyOtp(
    @BodyParam("username") username: string,
    @BodyParam("otp") otp: string
  ) {
    const account = await this.accountService.findAccountByUsername(username);
    const identifier = account.email || account.phone;
    if (!identifier) {
      throw new ValidationException("Account must have email or phone to verify OTP");
    }
    const verify = await this.otpService.verifyOtp(identifier, otp);
    if (!verify) throw new ValidationException("OTP is wrong or is expired");
    return verify;
  }

  @Get("/all")
  @UseBefore(Auth)
  @CheckAbility("read", Account)
  async getAllAccounts(@Req() req: any) {
    return await this.accountService.getAccounts();
  }

  @Post("/create")
  @UseBefore(Auth)
  @CheckAbility("create", Account)
  async createAccount(@Body() body: CreateAccountDto, @Req() req: any) {
    const account = await this.accountService.createAccount(
      body.username,
      body.password,
      body.name || "",
      body.phone || "",
      body.roleSlug
    );
    return account;
  }

  @Patch("/update")
  @UseBefore(Auth)
  @CheckAbility("update", Account)
  async updateAccount(
    @BodyParam("username") username: string,
    @Body() body: UpdateAccountDto,
    @Req() req: any
  ) {
    const account = await this.accountService.updateAccount(username, body);
    return account;
  }

  @Delete("/delete")
  @UseBefore(Auth)
  @CheckAbility("delete", Account)
  async deleteAccount(
    @BodyParam("username") username: string,
    @Req() req: any
  ) {
    const account = await this.accountService.deleteAccount(username);
    return account;
  }

  @Patch("/update-admin")
  @UseBefore(Admin)
  async updateAdmin(
    @BodyParam("username") username: string,
    @Body() body: UpdateAccountDto
  ) {
    const account = await this.accountService.updateAdmin(username, body);
    return account;
  }

  @Post("/verify-login")
  async verifyLogin(
    @BodyParam("username") username: string,
    @BodyParam("otp") otp: string,
    @Res() res: Response
  ) {
    // Legacy method - should return 501 but keeping for backwards compatibility
    // Client should use /account/login instead
    const account = await this.accountService.findAccountByUsername(username);
    const identifier = account.email || account.phone;
    if (!identifier) {
      throw new ValidationException("Account does not have email or phone to verify OTP");
    }

    const verified = await this.otpService.verifyOtp(identifier, otp);
    if (!verified) {
      throw new ValidationException("OTP is wrong or expired");
    }

    const tokens = await this.accountService.login({
      identifier: username,
      password: "", // OTP login doesn't need password
    });

    res.cookie("refreshToken", tokens.newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return tokens.accessToken;
  }
}
