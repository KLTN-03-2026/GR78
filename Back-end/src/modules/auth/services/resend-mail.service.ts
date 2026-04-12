import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendResetEmailPayload {
    toEmail: string;
    resetUrl: string;
    expiresInMinutes: number;
}

export interface SendPasswordChangedEmailPayload {
    toEmail: string;
    ipAddress: string | null;
    changedAt: Date;
}

@Injectable()
export class ResendMailService {
    private readonly logger = new Logger(ResendMailService.name);
    private readonly resend: Resend;
    private readonly fromEmail: string;
    private readonly appName: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
        this.fromEmail = this.configService.getOrThrow<string>('RESEND_FROM_EMAIL');
        this.appName = this.configService.get<string>('APP_NAME', 'MyApp');
        this.resend = new Resend(apiKey);
    }

    
    async sendResetPasswordEmail(payload: SendResetEmailPayload): Promise<void> {
        const { toEmail, resetUrl, expiresInMinutes } = payload;

        try {
            const { error } = await this.resend.emails.send({
                from: `${this.appName} <${this.fromEmail}>`,
                to: toEmail,
                subject: `[${this.appName}] Đặt lại mật khẩu của bạn`,
                html: this.buildResetEmailHtml({ resetUrl, expiresInMinutes, appName: this.appName }),
            });

            if (error) {
                this.logger.error(
                    `Resend failed to send reset email to ${toEmail}: ${JSON.stringify(error)}`,
                );
                return;
            }

            this.logger.log(`Reset password email sent to ${toEmail}`);
        } catch (err) {
            this.logger.error(`Unexpected error sending reset email to ${toEmail}`, err);
        }
    }

    
    async sendPasswordChangedEmail(payload: SendPasswordChangedEmailPayload): Promise<void> {
        const { toEmail, ipAddress, changedAt } = payload;

        try {
            const { error } = await this.resend.emails.send({
                from: `${this.appName} <${this.fromEmail}>`,
                to: toEmail,
                subject: `[${this.appName}] Mật khẩu của bạn đã được thay đổi`,
                html: this.buildPasswordChangedHtml({ ipAddress, changedAt, appName: this.appName }),
            });

            if (error) {
                this.logger.error(
                    `Resend failed to send password-changed email to ${toEmail}: ${JSON.stringify(error)}`,
                );
                return;
            }

            this.logger.log(`Password changed notification sent to ${toEmail}`);
        } catch (err) {
            this.logger.error(
                `Unexpected error sending password-changed email to ${toEmail}`,
                err,
            );
        }
    }

    // ─── HTML TEMPLATES ────────────────────────────────────────────────────────

    private buildResetEmailHtml(params: {
        resetUrl: string;
        expiresInMinutes: number;
        appName: string;
    }): string {
        const { resetUrl, expiresInMinutes, appName } = params;
        return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:#1a1a2e;padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">${appName}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a1a2e;margin:0 0 16px;">Đặt lại mật khẩu</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            Nhấn vào nút bên dưới để tiếp tục. Link sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.6;margin:24px 0 0;">
            Nếu bạn không yêu cầu điều này, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.<br><br>
            Hoặc copy link này vào trình duyệt:<br>
            <span style="color:#4f46e5;word-break:break-all;">${resetUrl}</span>
          </p>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:20px;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }

    private buildPasswordChangedHtml(params: {
        ipAddress: string | null;
        changedAt: Date;
        appName: string;
    }): string {
        const { ipAddress, changedAt, appName } = params;
        const timeStr = changedAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:#dc2626;padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">${appName}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a1a2e;margin:0 0 16px;">⚠️ Mật khẩu đã được thay đổi</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            Mật khẩu tài khoản của bạn vừa được đặt lại thành công.
          </p>
          <table style="background:#f4f4f4;border-radius:6px;padding:16px;width:100%;margin:0 0 24px;">
            <tr><td style="color:#555;font-size:14px;padding:4px 0;">
              <strong>Thời gian:</strong> ${timeStr}
            </td></tr>
            <tr><td style="color:#555;font-size:14px;padding:4px 0;">
              <strong>IP:</strong> ${ipAddress ?? 'Không xác định'}
            </td></tr>
          </table>
          <p style="color:#dc2626;font-weight:bold;margin:0 0 8px;">
            Nếu KHÔNG phải bạn thực hiện hành động này, vui lòng liên hệ hỗ trợ ngay lập tức!
          </p>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:20px;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }
}