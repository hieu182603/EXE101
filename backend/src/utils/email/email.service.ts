import { Service } from "typedi";
import nodemailer from "nodemailer";
import { HttpException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";

@Service()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Support both EMAIL_* and SMTP_* environment variables for compatibility
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587");
    const smtpSecure = process.env.SMTP_SECURE === "true" || process.env.EMAIL_SECURE === "true";
    const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
    // Remove spaces from App Password (Gmail App Passwords sometimes have spaces)
    const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    // Kiểm tra cấu hình
    if (!smtpUser || !smtpPass) {
      console.error("❌ ERROR: SMTP/EMAIL configuration is missing!");
      console.error("Please set SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS environment variables!");
      console.error("Email sending will fail until SMTP credentials are configured.");
    } else {
      console.log("✅ SMTP configuration loaded successfully");
      
      // Create transporter with verified config
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      throw new HttpException(500, "SMTP transporter not initialized");
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ SMTP verification failed:", errorMessage);
      return false;
    }
  }

  /**
   * Tạo template email OTP chuyên nghiệp
   * @param otpCode - Mã OTP
   * @param username - Tên người dùng (optional)
   * @param purpose - Mục đích sử dụng OTP (đăng ký, đổi mật khẩu, etc.)
   * @returns HTML template string
   */
  private getOtpEmailTemplate(
    otpCode: string,
    username?: string,
    purpose: "registration" | "password-change" | "forgot-password" | "verification" = "verification"
  ): string {
    const purposeTexts = {
      registration: "đăng ký tài khoản",
      "password-change": "đổi mật khẩu",
      "forgot-password": "khôi phục mật khẩu",
      verification: "xác thực",
    };

    const purposeTitle = {
      registration: "Chào mừng đến với Technical Store!",
      "password-change": "Yêu cầu đổi mật khẩu",
      "forgot-password": "Khôi phục mật khẩu",
      verification: "Xác thực tài khoản",
    };

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Mã OTP - Technical Store</title>
</head>

<body style="margin:0;padding:0;background:#f5f6fa;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:32px 0;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;
               box-shadow:0 10px 30px rgba(0,0,0,0.12);">

          <!-- Header -->
          <tr>
            <td style="padding:24px;background:linear-gradient(135deg,#ff2e2e,#b80000);">
              <div style="color:#ffffff;font-size:22px;font-weight:800;">
                Technical Store
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px 26px 20px 26px;color:#111827;">

              <div style="font-size:18px;font-weight:700;margin-bottom:8px;">
                Xin chào${username ? ` ${username}` : ""}!
              </div>

              <div style="font-size:14px;color:#374151;line-height:1.6;margin-bottom:22px;">
                Bạn vừa yêu cầu <strong style="color:#b80000;">${purposeTexts[purpose]}</strong>.
                Vui lòng sử dụng mã OTP bên dưới.
              </div>

              <!-- OTP -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="
                      display:inline-block;
                      padding:16px 22px;
                      border-radius:14px;
                      background:#fff5f5;
                      border:1px solid #fecaca;
                      font-family:'Courier New',monospace;
                      font-size:40px;
                      font-weight:800;
                      letter-spacing:10px;
                      color:#b80000;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top:16px;font-size:13px;color:#6b7280;text-align:center;">
                Mã có hiệu lực trong <strong>3 phút</strong>.
              </div>

              <!-- Security -->
              <div style="
                margin-top:20px;
                padding:14px;
                background:#fff1f2;
                border-left:4px solid #ff2e2e;
                border-radius:8px;
                font-size:13px;
                color:#374151;
                line-height:1.6;">
                <strong style="color:#b80000;">Lưu ý:</strong>
                Không chia sẻ mã này cho bất kỳ ai. Technical Store không bao giờ yêu cầu mật khẩu hoặc OTP qua email.
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 26px;border-top:1px solid #f1f5f9;">
              <div style="font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Technical Store
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

    `;
  }

  /**
   * Gửi OTP qua email
   * @param email - Email người nhận
   * @param otpCode - Mã OTP
   * @param username - Tên người dùng (optional)
   * @param purpose - Mục đích sử dụng OTP (optional)
   * @returns Promise<boolean>
   */
  async sendOtpEmail(
    email: string,
    otpCode: string,
    username?: string,
    purpose: "registration" | "password-change" | "forgot-password" | "verification" = "verification"
  ): Promise<boolean> {
    // Kiểm tra cấu hình SMTP trước khi gửi
    if (!this.transporter) {
      const errorMsg = "SMTP configuration is missing. Please set SMTP_USER and SMTP_PASS environment variables.";
      console.error(`❌ ${errorMsg}`);
      throw new HttpException(500, errorMsg);
    }

    try {
      const purposeSubjects = {
        registration: "Chào mừng đến với Technical Store - Mã OTP đăng ký",
        "password-change": "Yêu cầu đổi mật khẩu - Mã OTP xác thực",
        "forgot-password": "Khôi phục mật khẩu - Mã OTP xác thực",
        verification: "Mã OTP xác thực - Technical Store",
      };

      const htmlTemplate = this.getOtpEmailTemplate(otpCode, username, purpose);
      
      // Plain text version for email clients that don't support HTML
      const textVersion = `
Xác thực OTP - Technical Store

Xin chào${username ? ` ${username}` : ""}!

Cảm ơn bạn đã ${purpose === "registration" ? "đăng ký tài khoản" : purpose === "password-change" ? "yêu cầu đổi mật khẩu" : purpose === "forgot-password" ? "yêu cầu khôi phục mật khẩu" : "xác thực"} tại Technical Store.

Mã OTP của bạn là: ${otpCode}

Mã OTP này có hiệu lực trong 3 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.

Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay lập tức.

© ${new Date().getFullYear()} Technical Store. All rights reserved.
      `.trim();

      const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || "";
      const mailOptions = {
        from: `"Technical Store" <${smtpUser}>`,
        to: email,
        subject: purposeSubjects[purpose],
        html: htmlTemplate,
        text: textVersion,
      };

      const info = await this.transporter.sendMail(mailOptions);
      // Email sent successfully - avoid logging sensitive information like messageId in production
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Error sending email to ${email}:`, errorMessage);
      
      // Cung cấp thông báo lỗi chi tiết hơn
      let userFriendlyMessage = "Failed to send email";
      if (errorMessage.includes("Invalid login")) {
        userFriendlyMessage = "SMTP authentication failed. Please check SMTP_USER and SMTP_PASS.";
      } else if (errorMessage.includes("ECONNECTION") || errorMessage.includes("ETIMEDOUT")) {
        userFriendlyMessage = "Cannot connect to SMTP server. Please check SMTP_HOST and SMTP_PORT.";
      } else if (errorMessage.includes("ENOTFOUND")) {
        userFriendlyMessage = "SMTP host not found. Please check SMTP_HOST configuration.";
      }
      
      throw new HttpException(500, `${userFriendlyMessage}: ${errorMessage}`);
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
      const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || "";
      const mailOptions = {
        from: `"Technical Store" <${smtpUser}>`,
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ""),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new HttpException(500, "Failed to send email: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }
}

