import { Injectable, ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private otpService: OtpService,
    ) {}

    async register(data: any) {
        const { name, email, password, phone, ...supplierData } = data;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('A user with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Create or update pending user
        const pendingUser = await this.prisma.pendingUser.upsert({
            where: { email },
            update: {
                name,
                phone: phone || null,
                password: hashedPassword,
                ...supplierData,
            },
            create: {
                name,
                email,
                phone: phone || null,
                password: hashedPassword,
                ...supplierData,
            },
        });
 
        // Send OTP to email
        await this.otpService.generateAndSendOtp(pendingUser.id, 'email', true);
 
        return {
            userId: pendingUser.id,
            email: pendingUser.email,
            message: 'Registration successful. Please verify your email with the OTP code sent to you.',
        };
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Block unverified users
        if (!user.isVerified) {
            // Re-send OTP so they can verify
            await this.otpService.generateAndSendOtp(user.id, 'email');
            throw new ForbiddenException(
                JSON.stringify({
                    code: 'UNVERIFIED',
                    userId: user.id,
                    message: 'Please verify your account. A new OTP has been sent to your email.',
                }),
            );
        }

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            },
            token,
        };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new BadRequestException('There is no such user signed with this email');
        }
        await this.otpService.generateAndSendOtp(user.id, 'email');
        return { message: 'OTP sent to your email', userId: user.id };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                supplierProfile: true, // Business details
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, data: any) {
        const { name, email, ...supplierData } = data;

        if (email) {
            const existing = await this.prisma.user.findFirst({
                where: { email, NOT: { id: userId } },
            });
            if (existing) {
                throw new ConflictException('This email is already in use');
            }
        }

        // Update User basic info
        await this.prisma.user.update({
            where: { id: userId },
            data: { name, email },
        });

        // Get user role to see if we need to update Supplier profile
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (user && user.role === Role.SUPPLIER) {
            await (this.prisma as any).supplier.upsert({
                where: { userId },
                update: {
                    ...supplierData,
                    name: name || user.name,
                    email: email || user.email,
                },
                create: {
                    ...supplierData,
                    userId,
                    name: name || user.name,
                    email: email || user.email,
                },
            });
        }

        return this.getProfile(userId);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Password changed successfully' };
    }

    async forcePassword(userId: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Password reset successfully' };
    }

    async deleteAccount(userId: string) {
        await this.prisma.user.delete({
            where: { id: userId },
        });

        return { message: 'Account deleted successfully' };
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

