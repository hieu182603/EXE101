import { Service } from "typedi";
import { Twilio } from "twilio";
import { AccountService } from "@/auth/account/account.service";
import { Account } from "@/auth/account/account.entity";

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || "";


@Service()
export class TwilioService {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  async sendOtp(phone: string): Promise<string> {
    await twilioClient.verify.v2.services(verifyServiceSid).verifications.create({
      to: phone,
      channel: 'sms',
    });
    return "OTP sent";
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {

    const result = await twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: phone,
      code: otp,
    });

    return result.status === 'approved';
  }

  async sendOtpRegister(username: string, phone: string): Promise<String>{
    await twilioClient.verify.v2.services(verifyServiceSid).verifications.create({
      to: phone,
      channel: 'sms',
    });
    return "OTP sent";
  }

  async verifyOtpRegister(phone: string, otp: string): Promise<boolean>{
    const result = await twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({
        to: phone,
        code: otp,
        });
    return result.status === 'approved';
  }
}
