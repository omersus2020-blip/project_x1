import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) {}

    async findByUser(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                tender: {
                    select: { id: true, title: true, imageUrl: true },
                },
            },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
}
