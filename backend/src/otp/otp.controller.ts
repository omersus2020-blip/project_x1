import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service.js';

@Controller('otp')
export class OtpController {
    constructor(private otpService: OtpService) {}

    @Post('send')
    async sendOtp(
        @Body() body: { userId: string; channel?: string },
    ) {
        return this.otpService.generateAndSendOtp(body.userId, body.channel || 'email');
    }

    @Post('verify')
    async verifyOtp(
        @Body() body: { userId: string; code: string },
    ) {
        return this.otpService.verifyOtp(body.userId, body.code);
    }

    @Post('resend')
    async resendOtp(
        @Body() body: { userId: string; channel?: string },
    ) {
        return this.otpService.resendOtp(body.userId, body.channel || 'email');
    }
}
