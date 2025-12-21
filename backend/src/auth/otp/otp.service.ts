import { Service } from "typedi";
import { Otp } from "./otp.entity";
import { EmailService } from "@/utils/email/email.service";
import { AccountService } from "@/auth/account/account.service";
import { AccountNotFoundException } from "@/exceptions/http-exceptions";

@Service()
export class OtpService {
  constructor(
    private readonly emailService: EmailService,
    private readonly accountService: AccountService
  ) {}

  /**
   * Gửi OTP qua email (ưu tiên) hoặc phone (fallback)
   * @param identifier - Email hoặc phone
   * @param username - Username để hiển thị trong email (optional)
   * @returns Promise<Otp>
   */
  async sendOtp(identifier: string, username?: string): Promise<Otp> {
    const otp = new Otp();
    otp.code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");

    // Kiểm tra xem identifier là email hay phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    if (isEmail) {
      otp.email = identifier;
      // Gửi OTP qua email
      await this.emailService.sendOtpEmail(identifier, otp.code, username);
    } else {
      // Fallback: sử dụng phone (tìm account để lấy email nếu có)
      otp.phone = identifier;
      try {
        const account = await this.accountService.findAccountByPhone(identifier);
        if (account.email) {
          otp.email = account.email;
          await this.emailService.sendOtpEmail(account.email, otp.code, account.name || username);
        } else {
          console.warn(`Account with phone ${identifier} does not have email. OTP saved but not sent.`);
        }
      } catch (error) {
        // Account không tồn tại hoặc không có email, chỉ lưu OTP
        console.warn(`Could not send email OTP for ${identifier}:`, error);
      }
    }

    await otp.save();
    return otp;
  }

  /**
   * Xác thực OTP bằng email hoặc phone
   * @param identifier - Email hoặc phone
   * @param code - Mã OTP
   * @returns Promise<boolean>
   */
  async verifyOtp(identifier: string, code: string): Promise<boolean> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    const whereCondition = isEmail 
      ? { email: identifier, code } 
      : { phone: identifier, code };
    
    const otp = await Otp.findOne({ where: whereCondition });
    if (!otp) {
      return false;
    }
    
    const now = new Date(Date.now() - 14 * 60 * 60 * 1000);
    if (now.getTime() - otp.createdAt.getTime() > 3 * 60 * 1000) {
      console.log("otp expired");
      return false;
    }
    otp.verified = true;
    await otp.save();
    return true;
  }

  async getActiveOtp(): Promise<Otp[]> {
    const otp = await Otp.find();
    const now = new Date(Date.now() - 14 * 60 * 60 * 1000);
    const expired = otp.filter(
      (otp) => now.getTime() - otp.createdAt.getTime() > 3 * 60 * 1000
    );
    await Otp.remove(expired);
    return otp.filter(
      (otp) => now.getTime() - otp.createdAt.getTime() <= 3 * 60 * 1000
    );
  }

  /**
   * Gửi OTP cho account bằng email (nếu có) hoặc phone
   * @param accountIdentifier - Username hoặc phone
   * @returns Promise<Otp>
   */
  async sendOtpByAccount(accountIdentifier: string): Promise<Otp> {
    try {
      // Thử tìm account bằng username
      const account = await this.accountService.findAccountByUsername(accountIdentifier);
      if (account.email) {
        return await this.sendOtp(account.email, account.name);
      } else if (account.phone) {
        return await this.sendOtp(account.phone, account.name);
      }
      throw new Error("Account does not have email or phone");
    } catch (error) {
      // Nếu không tìm thấy bằng username, thử dùng identifier trực tiếp
      return await this.sendOtp(accountIdentifier);
    }
  }
}
