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
   * @param purpose - Mục đích sử dụng OTP (optional)
   * @returns Promise<Otp>
   */
  async sendOtp(
    identifier: string, 
    username?: string,
    purpose: "registration" | "password-change" | "forgot-password" | "verification" = "verification"
  ): Promise<Otp> {
    const otp = new Otp();
    otp.code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");

    // Kiểm tra xem identifier là email hay phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    if (isEmail) {
      otp.email = identifier;
      // Gửi OTP qua email - throw error nếu fail để caller biết
      try {
        await this.emailService.sendOtpEmail(identifier, otp.code, username, purpose);
      } catch (error) {
        // Nếu gửi email fail, không lưu OTP và throw error
        console.error(`Failed to send OTP email to ${identifier}:`, error);
        throw error;
      }
    } else {
      // Fallback: sử dụng phone (tìm account để lấy email nếu có)
      otp.phone = identifier;
      try {
        const account = await this.accountService.findAccountByPhone(identifier);
        if (account.email) {
          otp.email = account.email;
          try {
            await this.emailService.sendOtpEmail(account.email, otp.code, account.name || username, purpose);
          } catch (error) {
            // Nếu gửi email fail, không lưu OTP và throw error
            console.error(`Failed to send OTP email to ${account.email}:`, error);
            throw error;
          }
        } else {
          // Account tồn tại nhưng không có email - chỉ lưu OTP với phone
          console.warn(`Account with phone ${identifier} does not have email. OTP saved with phone only.`);
        }
      } catch (error) {
        // Account không tồn tại (có thể là trường hợp đăng ký mới)
        // Trong trường hợp này, chỉ lưu OTP với phone, không gửi email
        if (error instanceof AccountNotFoundException) {
          console.log(`Account with phone ${identifier} not found. This might be a new registration. OTP saved with phone only.`);
        } else {
          // Nếu là lỗi khác, throw lại
          console.error(`Error finding account for phone ${identifier}:`, error);
          throw error;
        }
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
      console.log(`OTP not found for ${identifier} with code ${code}`);
      return false;
    }
    
    // Check if OTP is already verified
    if (otp.verified) {
      console.log(`OTP already verified for ${identifier}`);
      return false;
    }
    
    // Check expiration: OTP expires after 3 minutes
    const now = new Date();
    const otpAge = now.getTime() - otp.createdAt.getTime();
    const expirationTime = 3 * 60 * 1000; // 3 minutes in milliseconds
    
    if (otpAge > expirationTime) {
      console.log(`OTP expired for ${identifier}. Age: ${Math.floor(otpAge / 1000)}s`);
      return false;
    }
    
    // Verify OTP
    otp.verified = true;
    await otp.save();
    console.log(`OTP verified successfully for ${identifier}`);
    return true;
  }

  async getActiveOtp(): Promise<Otp[]> {
    const otp = await Otp.find();
    const now = new Date();
    const expirationTime = 3 * 60 * 1000; // 3 minutes in milliseconds
    const expired = otp.filter(
      (otp) => now.getTime() - otp.createdAt.getTime() > expirationTime
    );
    await Otp.remove(expired);
    return otp.filter(
      (otp) => now.getTime() - otp.createdAt.getTime() <= expirationTime
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

