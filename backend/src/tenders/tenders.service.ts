import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenderStatus } from '@prisma/client';

@Injectable()
export class TendersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tender.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findActive() {
        return this.prisma.tender.findMany({
            where: { status: TenderStatus.ACTIVE },
            orderBy: { endDate: 'asc' },
        });
    }

    async findOne(id: string) {
        const tender = await this.prisma.tender.findUnique({ where: { id } });
        if (!tender) {
            throw new NotFoundException(`Tender with ID "${id}" not found`);
        }
        return tender;
    }

    async join(id: string, userId: string) {
        const tender = await this.findOne(id);
        if (tender.status !== TenderStatus.ACTIVE) {
            throw new NotFoundException(`Tender "${id}" is no longer active`);
        }

        const updated = await this.prisma.tender.update({
            where: { id },
            data: {
                currentParticipants: { increment: 1 },
            },
        });

        return {
            message: `User ${userId} joined tender "${updated.title}"`,
            currentParticipants: updated.currentParticipants,
            currentPrice: updated.currentPrice,
        };
    }
}
