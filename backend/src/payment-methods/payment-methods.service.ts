import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PaymentMethodsService {
    constructor(private prisma: PrismaService) {}

    async getAll(userId: string) {
        return this.prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async create(userId: string, data: {
        label?: string;
        last4: string;
        brand?: string;
        expiryMonth: number;
        expiryYear: number;
        isDefault?: boolean;
    }) {
        if (data.isDefault) {
            await this.prisma.paymentMethod.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.paymentMethod.create({
            data: { userId, ...data },
        });
    }

    async delete(id: string, userId: string) {
        return this.prisma.paymentMethod.delete({
            where: { id, userId },
        });
    }
}
