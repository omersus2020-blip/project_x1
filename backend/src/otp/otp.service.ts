import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OtpService {
    private transporter: nodemailer.Transporter;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Generate a 6-digit OTP, store it (hashed), and send it to the user's email.
     */
    async generateAndSendOtp(userId: string, channel: string = 'email', isPending: boolean = false): Promise<{ message: string }> {
        let identifierField = isPending ? 'pendingUserId' : 'userId';
        let email: string;
        let name: string;

        if (isPending) {
            const pendingUser = await this.prisma.pendingUser.findUnique({ where: { id: userId } });
            if (!pendingUser) throw new BadRequestException('Pending user not found');
            email = pendingUser.email;
            name = pendingUser.name;
        } else {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new BadRequestException('User not found');
            email = user.email;
            name = user.name;
        }

        // Rate-limit: max 5 OTPs per 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentOtps = await this.prisma.otpCode.count({
            where: {
                userId: isPending ? undefined : userId,
                pendingUserId: isPending ? userId : undefined,
                createdAt: { gte: tenMinutesAgo },
            },
        });

        if (recentOtps >= 5) {
            throw new BadRequestException('Too many OTP requests. Please wait a few minutes before trying again.');
        }

        // Invalidate any existing unused OTPs for this user
        await this.prisma.otpCode.updateMany({
            where: {
                userId: isPending ? undefined : userId,
                pendingUserId: isPending ? userId : undefined,
                used: false,
            },
            data: { used: true },
        });

        // Generate a random 6-digit code
        const plainCode = crypto.randomInt(100000, 999999).toString();

        // Hash the code for storage
        const hashedCode = crypto.createHash('sha256').update(plainCode).digest('hex');

        // Store with 5-minute expiry
        await this.prisma.otpCode.create({
            data: {
                userId: isPending ? null : userId,
                pendingUserId: isPending ? userId : null,
                code: hashedCode,
                channel,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        // Send via email
        if (channel === 'email') {
            await this.sendOtpEmail(email, name, plainCode);
        }

        return { message: `OTP sent to your ${channel}` };
    }

    /**
     * Verify the user-submitted OTP code.
     */
    async verifyOtp(userId: string, submittedCode: string): Promise<{ user: any; token: string }> {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: {
                OR: [
                    { userId },
                    { pendingUserId: userId }
                ],
                used: false,
                expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('No valid OTP found. Please request a new one.');
        }

        // Check max attempts
        if (otpRecord.attempts >= 5) {
            await this.prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { used: true },
            });
            throw new ForbiddenException('Too many incorrect attempts. Please request a new OTP.');
        }

        // Hash the submitted code and compare
        const hashedSubmitted = crypto.createHash('sha256').update(submittedCode).digest('hex');

        if (hashedSubmitted !== otpRecord.code) {
            // Increment attempt counter
            await this.prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } },
            });
            const remaining = 4 - otpRecord.attempts;
            throw new BadRequestException(
                `Incorrect OTP code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}`,
            );
        }

        // Mark OTP as used
        await this.prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { used: true },
        });

        let user;

        if (otpRecord.pendingUserId) {
            // Handle pending user registration
            const pendingUser = await this.prisma.pendingUser.findUnique({
                where: { id: otpRecord.pendingUserId }
            });

            if (!pendingUser) {
                throw new BadRequestException('Pending registration not found.');
            }

            // Create actual user
            user = await this.prisma.user.create({
                data: {
                    name: pendingUser.name,
                    email: pendingUser.email,
                    phone: pendingUser.phone,
                    password: pendingUser.password,
                    isVerified: true,
                    role: 'CUSTOMER',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
            });

            // Cleanup
            await this.prisma.pendingUser.delete({ where: { id: pendingUser.id } });
        } else {
            // Mark existing user as verified (e.g. for login or verification retry)
            user = await this.prisma.user.update({
                where: { id: otpRecord.userId! },
                data: { isVerified: true },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
            });
        }

        // Generate JWT
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return { user, token };
    }

    /**
     * Resend OTP — just a wrapper around generateAndSendOtp with a user-friendly name.
     */
    /**
     * Resend OTP — handles both regular and pending users.
     */
    async resendOtp(id: string, channel: string = 'email'): Promise<{ message: string }> {
        // Try finding as user first
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (user) {
            return this.generateAndSendOtp(id, channel, false);
        }

        // Try finding as pending user
        const pending = await this.prisma.pendingUser.findUnique({ where: { id } });
        if (pending) {
            return this.generateAndSendOtp(id, channel, true);
        }

        throw new BadRequestException('User not found');
    }

    /**
     * Send styled OTP email.
     */
    private async sendOtpEmail(to: string, name: string, code: string): Promise<void> {
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="440" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Group Deals</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Verify your account</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#1a1a2e;font-size:16px;">Hi <strong>${name}</strong>,</p>
              <p style="margin:0 0 24px;color:#4a4a68;font-size:15px;line-height:1.5;">
                Use the following verification code to complete your registration. This code expires in <strong>5 minutes</strong>.
              </p>
              <!-- OTP Code -->
              <div style="text-align:center;margin:0 0 28px;">
                <div style="display:inline-block;background:#f0f0ff;border:2px dashed #667eea;border-radius:12px;padding:16px 40px;">
                  <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#1a1a2e;">${code}</span>
                </div>
              </div>
              <p style="margin:0 0 8px;color:#4a4a68;font-size:14px;line-height:1.5;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background-color:#f9fafb;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Group Deals. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        await this.transporter.sendMail({
            from: process.env.OTP_FROM_EMAIL || `"Group Deals" <${process.env.SMTP_USER}>`,
            to,
            subject: `${code} is your Group Deals verification code`,
            text: `Your Group Deals verification code is: ${code}. It expires in 5 minutes.`,
            html,
        });
    }
}
