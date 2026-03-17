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
        const tender = await this.prisma.tender.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrollments: true }
                },
                bids: {
                    orderBy: { bidPrice: 'asc' },
                    take: 1
                }
            }
        });

        if (!tender) {
            throw new NotFoundException(`Tender with ID "${id}" not found`);
        }

        const lowestBid = tender.bids.length > 0 ? tender.bids[0].bidPrice : null;
        const enrolledCount = tender._count.enrollments;

        return {
            ...tender,
            lowestBid,
            enrolledCount,
        };
    }

    async enroll(id: string, userId: string) {
        const tender = await this.prisma.tender.findUnique({ where: { id } });
        if (!tender) {
            throw new NotFoundException(`Tender with ID "${id}" not found`);
        }
        if (tender.status !== TenderStatus.ACTIVE) {
            throw new NotFoundException(`Tender "${id}" is no longer active`);
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'CUSTOMER') {
            throw new NotFoundException(`User "${userId}" not found or not a CUSTOMER`);
        }

        const enrollment = await this.prisma.customerEnrollment.create({
            data: {
                tenderId: id,
                userId: userId,
            }
        });

        const updated = await this.prisma.tender.update({
            where: { id },
            data: { currentParticipants: { increment: 1 } },
        });

        return {
            message: `Customer ${user.name} enrolled in tender "${updated.title}"`,
            currentParticipants: updated.currentParticipants,
            enrollmentId: enrollment.id
        };
    }

    async bid(id: string, userId: string, bidPrice: number) {
        const tender = await this.prisma.tender.findUnique({ where: { id } });
        if (!tender) {
            throw new NotFoundException(`Tender with ID "${id}" not found`);
        }
        if (tender.status !== TenderStatus.ACTIVE) {
            throw new NotFoundException(`Tender "${id}" is no longer active`);
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'SUPPLIER') {
            throw new NotFoundException(`User "${userId}" not found or not a SUPPLIER`);
        }

        const bid = await this.prisma.supplierBid.create({
            data: {
                tenderId: id,
                userId: userId,
                bidPrice: Number(bidPrice),
            }
        });

        return {
            message: `Supplier ${user.name} bid ${bidPrice} on tender "${tender.title}"`,
            bidId: bid.id,
            bidPrice: bid.bidPrice
        };
    }
}
