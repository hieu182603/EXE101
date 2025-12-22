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
      console.log(`   Host: ${smtpHost}, Port: ${smtpPort}, User: ${smtpUser.substring(0, 3)}***`);
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Mã OTP xác thực - Technical Store</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 217, 255, 0.1);">
          
          <!-- Header với gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #00d9ff 0%, #0099cc 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Technical Store
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #1a1a2e;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Xin chào${username ? ` ${username}` : ""}! 👋
              </h2>
              
              <p style="margin: 0 0 30px 0; color: #b0b0b0; font-size: 16px; line-height: 1.6;">
                Cảm ơn bạn đã ${purposeTexts[purpose]} tại Technical Store. Để hoàn tất quá trình này, vui lòng sử dụng mã OTP bên dưới.
              </p>

              <!-- OTP Code Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); border: 2px solid rgba(0, 217, 255, 0.3); border-radius: 16px; padding: 30px 20px; box-shadow: 0 4px 20px rgba(0, 217, 255, 0.15);">
                      <p style="margin: 0 0 15px 0; color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Mã xác thực của bạn
                      </p>
                      <div style="display: inline-block; background: linear-gradient(135deg, #00d9ff 0%, #0099cc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                        ${otpCode}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <div style="background-color: rgba(0, 217, 255, 0.1); border-left: 4px solid #00d9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #00d9ff; font-size: 14px; font-weight: 600;">
                  ⏱️ Thời gian hiệu lực
                </p>
                <p style="margin: 0; color: #b0b0b0; font-size: 14px; line-height: 1.6;">
                  Mã OTP này có hiệu lực trong <strong style="color: #ffffff;">3 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
                </p>
              </div>

              <!-- Security Notice -->
              <div style="margin: 30px 0; padding: 20px; background-color: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; border-radius: 8px;">
                <p style="margin: 0; color: #ffc107; font-size: 14px; font-weight: 600;">
                  🔒 Lưu ý bảo mật
                </p>
                <p style="margin: 10px 0 0 0; color: #b0b0b0; font-size: 13px; line-height: 1.6;">
                  Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay lập tức. Technical Store sẽ không bao giờ yêu cầu bạn cung cấp mật khẩu hoặc mã OTP qua email.
                </p>
              </div>

              <!-- CTA Button (optional) -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px 0; color: #b0b0b0; font-size: 14px;">
                      Nhập mã này vào form xác thực để tiếp tục
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0a0a0a; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.6;">
                      © ${new Date().getFullYear()} <strong style="color: #00d9ff;">Technical Store</strong>. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="margin: 0; color: #555; font-size: 11px; line-height: 1.6;">
                      Email này được gửi tự động, vui lòng không trả lời trực tiếp.<br>
                      Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ khách hàng.
                    </p>
                  </td>
                </tr>
              </table>
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
      console.log(`✅ Email sent successfully to ${email}, messageId: ${info.messageId}`);
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

