import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendOtpEmailOptions {
  to: string;
  fullName: string;
  otp: string;
  expiresInMinutes?: number;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') || 'WeShare <onboarding@resend.dev>';

    if (apiKey && !apiKey.startsWith('re_sample')) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY is missing or using placeholder key. Emails will be logged to console in simulation mode.',
      );
    }
  }

  async sendOtpEmail(options: SendOtpEmailOptions): Promise<boolean> {
    const { to, fullName, otp, expiresInMinutes = 10 } = options;

    // Always log OTP in console for fast local debugging
    this.logger.log(
      `📧 [OTP DISPATCH] Recipient: ${to} | Name: ${fullName} | OTP Code: [ ${otp} ] | Valid: ${expiresInMinutes} mins`,
    );

    if (!this.resend) {
      this.logger.log(`Simulated sending OTP email to ${to}`);
      return true;
    }

    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeShare Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #6366f1;">
                WeShare
              </h1>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Connect, Share & Empower Communities</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 10px 36px 30px 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #f1f5f9; font-weight: 600;">
                Hello ${fullName || 'there'},
              </h2>
              <p style="margin: 0 0 24px 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                Thank you for joining WeShare! To complete your registration and secure your account, please enter the following One-Time Password (OTP):
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #818cf8;">
                  ${otp}
                </span>
                <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 13px;">
                  ⏱ This code expires in <strong style="color: #cbd5e1;">${expiresInMinutes} minutes</strong>
                </p>
              </div>

              <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                ⚠️ If you did not request this registration, please ignore this email or reach out to our security team. Never share this code with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} WeShare Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: `[WeShare] ${otp} is your verification code`,
        html: htmlContent,
      });

      if (result.error) {
        this.logger.error(
          `Resend API returned error for ${to}: ${result.error.name} - ${result.error.message}`,
        );
        return false;
      }

      this.logger.log(`✅ Email successfully sent to ${to} (ID: ${result.data?.id})`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email via Resend to ${to}: ${error.message}`, error.stack);
      return false;
    }
  }
}
