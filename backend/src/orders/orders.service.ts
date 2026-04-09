import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async findByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                tender: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        category: true,
                        originalPrice: true,
                        currentPrice: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                tender: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        category: true,
                        originalPrice: true,
                        currentPrice: true,
                    }
                },
                supplierBid: {
                    select: {
                        supplierName: true,
                        bidPrice: true,
                    }
                }
            }
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        return order;
    }
}
