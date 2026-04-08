import { Controller, Post, Get, Patch, Delete, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './register.dto.js';
import { UpdateProfileDto } from './update-profile.dto.js';
import { ForgotPasswordDto } from './forgot-password.dto.js';
import { ForcePasswordDto } from './force-password.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(
        @Body() body: RegisterDto,
    ) {
        return this.authService.register(body.name, body.email, body.password, body.phone);
    }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
    ) {
        return this.authService.login(body.email, body.password);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.authService.forgotPassword(body.email);
    }

    @Get('me')
    async getProfile(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = await this.authService.validateToken(token);
        return this.authService.getProfile(payload.sub);
    }

    @Patch('profile')
    async updateProfile(
        @Headers('authorization') authHeader: string,
        @Body() body: UpdateProfileDto,
    ) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = await this.authService.validateToken(token);
        return this.authService.updateProfile(payload.sub, body);
    }

    @Patch('password')
    async changePassword(
        @Headers('authorization') authHeader: string,
        @Body() body: { currentPassword: string; newPassword: string },
    ) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = await this.authService.validateToken(token);
        return this.authService.changePassword(payload.sub, body.currentPassword, body.newPassword);
    }

    @Patch('force-password')
    async forcePassword(
        @Headers('authorization') authHeader: string,
        @Body() body: ForcePasswordDto,
    ) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = await this.authService.validateToken(token);
        return this.authService.forcePassword(payload.sub, body.newPassword);
    }

    @Delete('account')
    async deleteAccount(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = await this.authService.validateToken(token);
        return this.authService.deleteAccount(payload.sub);
    }
}
