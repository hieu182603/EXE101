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
} from "../dtos/account.dto";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { Response } from "express";
import { OtpService } from "../otp/otp.service";
import { Account } from "./account.entity";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { ValidationException } from "@/exceptions/http-exceptions";

@Service()
@Controller("/account")
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly otpService: OtpService
  ) {}

  @Post("/register")
  async register(@Body() body: CreateAccountDto) {
    const account = await this.accountService.register(body);
    await this.otpService.sendOtp(account.phone);
    return {
      account: account,
      message: "Check OTP message to complete registration",
    };
  }

  @Post("/verify-register")
  async verifyRegister(@Body() body: VerifyRegisterDto, @Res() res: Response) {
    const result = await this.otpService.verifyOtp(body.phone, body.otp);
    if (!result) throw new ValidationException("OTP is wrong or is expired");
    const tokens = await this.accountService.finalizeRegistration(
      body.username,
      body.password,
      body.phone,
      body.roleSlug
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
  async resendOtp(@BodyParam("phone") phone: string) {
    await this.otpService.sendOtp(phone);
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
    await this.otpService.sendOtp(account.phone);
    return "Check OTP message to complete password change";
  }

  @Post("/verify-change-password")
  async verifyChangePassword(
    @BodyParam("username") username: string,
    @BodyParam("otp") otp: string,
    @BodyParam("newPassword") newPassword: string
  ) {
    const account = await this.accountService.findAccountByUsername(username);
    const result = await this.otpService.verifyOtp(account.phone, otp);
    if (!result) return "OTP is wrong or is expired";
    const token = await this.accountService.changePassword(
      account,
      newPassword
    );
    return token;
  }

  @Post("/forgot-password")
  async forgotPassword(@BodyParam("username") username: string) {
    const account = await this.accountService.findAccountByUsername(username);
    await this.otpService.sendOtp(account.phone);
    return "Check OTP message to reset password";
  }

  @Post("/send-otp")
  async sendOtp(@BodyParam("username") username: string) {
    const account = await this.accountService.findAccountByUsername(username);
    return await this.otpService.sendOtp(account.phone);
  }

  @Post("/verify-otp")
  async verifyOtp(
    @BodyParam("username") username: string,
    @BodyParam("otp") otp: string
  ) {
    const account = await this.accountService.findAccountByUsername(username);
    const verify = await this.otpService.verifyOtp(account.phone, otp);
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
      body.name,
      body.phone,
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
}
