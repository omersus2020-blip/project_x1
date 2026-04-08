import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.notificationsService.findByUser(userId);
    }

    @Get('user/:userId/unread-count')
    getUnreadCount(@Param('userId') userId: string) {
        return this.notificationsService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('user/:userId/read-all')
    markAllAsRead(@Param('userId') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }
}
