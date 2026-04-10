import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { TendersService } from './tenders.service.js';

@Controller('tenders')
export class TendersController {
    constructor(private readonly tendersService: TendersService) { }

    @Get()
    findAll() {
        return this.tendersService.findAll();
    }

    @Get('active')
    findActive() {
        return this.tendersService.findActive();
    }

    @Get('enrolled/:userId')
    findEnrolled(@Param('userId') userId: string) {
        return this.tendersService.findEnrolledByUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tendersService.findOne(id);
    }

    @Get(':id/enrollment-status/:userId')
    enrollmentStatus(@Param('id') id: string, @Param('userId') userId: string) {
        return this.tendersService.getEnrollmentStatus(id, userId);
    }

    @Post(':id/enroll')
    enroll(
        @Param('id') id: string,
        @Body('userId') userId: string,
        @Body('quantity') quantity: number = 1,
        @Body('addressId') addressId?: string,
        @Body('paymentMethodId') paymentMethodId?: string,
    ) {
        return this.tendersService.enroll(id, userId, quantity, addressId, paymentMethodId);
    }

    @Delete(':id/enroll')
    cancelEnrollment(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        return this.tendersService.cancelEnrollment(id, userId);
    }

    @Post(':id/bid')
    bid(@Param('id') id: string, @Body('userId') userId: string, @Body('bidPrice') bidPrice: number) {
        return this.tendersService.bid(id, userId, bidPrice);
    }

    @Post(':id/view')
    async incrementaView(@Param('id') id: string) {
        return this.tendersService.incrementviews(id);
    }

    @Get('admin/pending')
    findPending() {
        return this.tendersService.findPending();
    }

    @Post()
    create(@Body() data: any, @Body('supplierId') supplierId: string) {
        return this.tendersService.create(data, supplierId);
    }

    @Post(':id/approve')
    approve(@Param('id') id: string, @Body('adminId') adminId: string) {
        return this.tendersService.approve(id, adminId);
    }
}
