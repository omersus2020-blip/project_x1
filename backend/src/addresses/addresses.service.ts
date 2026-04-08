import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) {}

    async getAll(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async create(userId: string, data: {
        label?: string;
        street: string;
        city: string;
        state?: string;
        country?: string;
        isDefault?: boolean;
    }) {
        // If setting as default, unset other defaults
        if (data.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.create({
            data: { userId, ...data },
        });
    }

    async update(id: string, userId: string, data: {
        label?: string;
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        isDefault?: boolean;
    }) {
        if (data.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id, userId },
            data,
        });
    }

    async delete(id: string, userId: string) {
        return this.prisma.address.delete({
            where: { id, userId },
        });
    }
}
