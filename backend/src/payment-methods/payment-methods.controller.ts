import { Controller, Get, Post, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PaymentMethodsService } from './payment-methods.service.js';

@Controller('payment-methods')
export class PaymentMethodsController {
    constructor(
        private paymentMethodsService: PaymentMethodsService,
        private jwtService: JwtService,
    ) {}

    private getUserId(authHeader: string): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = this.jwtService.verify(token);
        return payload.sub;
    }

    @Get()
    async getAll(@Headers('authorization') auth: string) {
        const userId = this.getUserId(auth);
        return this.paymentMethodsService.getAll(userId);
    }

    @Post()
    async create(
        @Headers('authorization') auth: string,
        @Body() body: { label?: string; last4: string; brand?: string; expiryMonth: number; expiryYear: number; isDefault?: boolean },
    ) {
        const userId = this.getUserId(auth);
        return this.paymentMethodsService.create(userId, body);
    }

    @Delete(':id')
    async delete(
        @Headers('authorization') auth: string,
        @Param('id') id: string,
    ) {
        const userId = this.getUserId(auth);
        return this.paymentMethodsService.delete(id, userId);
    }
}
