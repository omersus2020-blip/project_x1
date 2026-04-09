import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenderStatus } from '@prisma/client';

@Injectable()
export class TendersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tender.findMany({
            where: { status: TenderStatus.ACTIVE },
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
                },
                tiers: {
                    orderBy: { minParticipants: 'asc' }
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

    async enroll(id: string, userId: string, quantity: number = 1, addressId?: string, paymentMethodId?: string) {
        // Validate quantity
        if (quantity < 1 || quantity > 3) {
            throw new BadRequestException('Quantity must be between 1 and 3');
        }

        const tender = await this.prisma.tender.findUnique({
            where: { id },
            include: { tiers: { orderBy: { minParticipants: 'asc' } } }
        });
        if (!tender) {
            throw new NotFoundException(`Tender with ID "${id}" not found`);
        }
        if (tender.status !== TenderStatus.ACTIVE) {
            throw new BadRequestException(`Tender "${id}" is no longer active`);
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'CUSTOMER') {
            throw new NotFoundException(`User "${userId}" not found or not a CUSTOMER`);
        }

        // Validate address if provided
        if (addressId) {
            const address = await this.prisma.address.findFirst({
                where: { id: addressId, userId }
            });
            if (!address) {
                throw new BadRequestException('Invalid delivery address');
            }
        }

        // Validate payment method if provided
        if (paymentMethodId) {
            const pm = await this.prisma.paymentMethod.findFirst({
                where: { id: paymentMethodId, userId }
            });
            if (!pm) {
                throw new BadRequestException('Invalid payment method');
            }
        }

        const existingEnrollment = await this.prisma.customerEnrollment.findFirst({
            where: { tenderId: id, userId }
        });
        if (existingEnrollment) {
            throw new BadRequestException('You are already in this tender');
        }

        const enrollment = await this.prisma.customerEnrollment.create({
            data: {
                tenderId: id,
                userId: userId,
                quantity: quantity,
                addressId: addressId || null,
                paymentMethodId: paymentMethodId || null,
                userName: user.name,
                userEmail: user.email,
                tenderTitle: tender.title
            }
        });

        // Calculate smooth dynamic pricing
        const newParticipants = tender.currentParticipants + 1;
        let newDiscount = 0;

        if (tender.tiers && tender.tiers.length > 0) {
            // Find current tier and next tier
            let t1 = { minParticipants: 0, discountPercent: 0 };
            let t2 = tender.tiers[0];

            for (let i = 0; i < tender.tiers.length; i++) {
                if (newParticipants >= tender.tiers[i].minParticipants) {
                    t1 = tender.tiers[i];
                    t2 = tender.tiers[i + 1] || tender.tiers[i];
                }
            }

            if (t1 === t2 || newParticipants >= t2.minParticipants) {
                // Max discount reached or flat
                newDiscount = t1.discountPercent;
            } else {
                // Interpolate
                const diffParticipants = t2.minParticipants - t1.minParticipants;
                if (diffParticipants > 0) {
                    const progress = (newParticipants - t1.minParticipants) / diffParticipants;
                    newDiscount = t1.discountPercent + progress * (t2.discountPercent - t1.discountPercent);
                } else {
                    newDiscount = t1.discountPercent;
                }
            }
        }

        const newPrice = tender.originalPrice * (1 - newDiscount / 100);

        const updated = await this.prisma.tender.update({
            where: { id },
            data: {
                currentParticipants: newParticipants,
                currentPrice: newPrice
            },
        });

        return {
            message: `Customer ${user.name} enrolled in tender "${updated.title}"`,
            currentParticipants: updated.currentParticipants,
            currentPrice: updated.currentPrice,
            enrollmentId: enrollment.id,
            quantity: enrollment.quantity
        };
    }

    async cancelEnrollment(tenderId: string, userId: string) {
        const enrollment = await this.prisma.customerEnrollment.findFirst({
            where: { tenderId, userId },
        });
        if (!enrollment) {
            throw new NotFoundException('You are not enrolled in this tender');
        }

        const tender = await this.prisma.tender.findUnique({
            where: { id: tenderId },
            include: { tiers: { orderBy: { minParticipants: 'asc' } } }
        });
        if (!tender) {
            throw new NotFoundException('Tender not found');
        }
        if (tender.status !== TenderStatus.ACTIVE) {
            throw new BadRequestException('Cannot cancel enrollment on a completed tender');
        }

        // Calculate 5% cancellation fee
        const cancellationFee = tender.currentPrice * 0.05;

        // Remove the enrollment
        await this.prisma.customerEnrollment.delete({
            where: { id: enrollment.id }
        });

        // Update participant count and recalculate price
        const newParticipants = Math.max(0, tender.currentParticipants - 1);
        let newDiscount = 0;

        if (tender.tiers && tender.tiers.length > 0) {
            let t1 = { minParticipants: 0, discountPercent: 0 };
            let t2 = tender.tiers[0];

            for (let i = 0; i < tender.tiers.length; i++) {
                if (newParticipants >= tender.tiers[i].minParticipants) {
                    t1 = tender.tiers[i];
                    t2 = tender.tiers[i + 1] || tender.tiers[i];
                }
            }

            if (t1 === t2 || newParticipants >= t2.minParticipants) {
                newDiscount = t1.discountPercent;
            } else {
                const diffParticipants = t2.minParticipants - t1.minParticipants;
                if (diffParticipants > 0) {
                    const progress = (newParticipants - t1.minParticipants) / diffParticipants;
                    newDiscount = t1.discountPercent + progress * (t2.discountPercent - t1.discountPercent);
                } else {
                    newDiscount = t1.discountPercent;
                }
            }
        }

        const newPrice = tender.originalPrice * (1 - newDiscount / 100);

        await this.prisma.tender.update({
            where: { id: tenderId },
            data: {
                currentParticipants: newParticipants,
                currentPrice: newPrice
            }
        });

        return {
            message: 'Enrollment cancelled',
            cancellationFee: Number(cancellationFee.toFixed(2)),
            refundNote: `A cancellation fee of $${cancellationFee.toFixed(2)} (5% of current price) applies.`
        };
    }

    async findEnrolledByUser(userId: string) {
        const enrollments = await this.prisma.customerEnrollment.findMany({
            where: { userId },
            include: {
                tender: {
                    include: {
                        tiers: { orderBy: { minParticipants: 'asc' } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return enrollments.map(e => ({
            enrollmentId: e.id,
            quantity: e.quantity,
            addressId: e.addressId,
            paymentMethodId: e.paymentMethodId,
            enrolledAt: e.createdAt,
            tender: e.tender,
        }));
    }

    async getEnrollmentStatus(tenderId: string, userId: string) {
        const enrollment = await this.prisma.customerEnrollment.findFirst({
            where: { tenderId, userId }
        });
        return {
            isEnrolled: !!enrollment,
            quantity: enrollment?.quantity || 0,
            enrollmentId: enrollment?.id || null,
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
                supplierName: user.name,
                supplierEmail: user.email,
                tenderTitle: tender.title
            }
        });

        return {
            message: `Supplier ${user.name} bid ${bidPrice} on tender "${tender.title}"`,
            bidId: bid.id,
            bidPrice: bid.bidPrice
        };
    }

    async incrementviews(id: string) {
        return this.prisma.tender.update({
            where: { id },
            data: {
                views: { increment: 1 }
            }
        })
    }
}
