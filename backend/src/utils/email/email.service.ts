import { Service } from "typedi";
import nodemailer from "nodemailer";
import { HttpException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";

// Cấu hình NodeMailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

@Service()
export class EmailService {
  constructor() {
    // Kiểm tra cấu hình
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ WARNING: SMTP configuration is missing. Please set SMTP_USER and SMTP_PASS environment variables!");
    }
  }

  /**
   * Gửi OTP qua email
   * @param email - Email người nhận
   * @param otpCode - Mã OTP
   * @param username - Tên người dùng (optional)
   * @returns Promise<boolean>
   */
  async sendOtpEmail(
    email: string,
    otpCode: string,
    username?: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Technical Store" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Mã OTP xác thực - Technical Store",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #00d9ff; text-align: center;">Xác thực OTP</h2>
            <p>Xin chào${username ? ` ${username}` : ""},</p>
            <p>Mã OTP của bạn là:</p>
            <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
              <h1 style="color: #00d9ff; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h1>
            </div>
            <p style="color: #888;">Mã OTP này có hiệu lực trong <strong>3 phút</strong>.</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">
              Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
            </p>
            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Technical Store. All rights reserved.
            </p>
          </div>
        `,
        text: `
          Xác thực OTP - Technical Store
          
          Xin chào${username ? ` ${username}` : ""},
          
          Mã OTP của bạn là: ${otpCode}
          
          Mã OTP này có hiệu lực trong 3 phút.
          
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
          
          © ${new Date().getFullYear()} Technical Store. All rights reserved.
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new HttpException(500, "Failed to send email: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  /**
   * Gửi email thông báo
   * @param email - Email người nhận
   * @param subject - Tiêu đề email
   * @param htmlContent - Nội dung HTML
   * @param textContent - Nội dung text (optional)
   * @returns Promise<boolean>
   */
  async sendEmail(
    email: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Technical Store" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ""),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new HttpException(500, "Failed to send email: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }
}

