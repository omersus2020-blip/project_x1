import { Controller, Get, Param, Post, Body } from '@nestjs/common';
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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tendersService.findOne(id);
    }

    @Post(':id/enroll')
    enroll(@Param('id') id: string, @Body('userId') userId: string) {
        return this.tendersService.enroll(id, userId);
    }

    @Post(':id/bid')
    bid(@Param('id') id: string, @Body('userId') userId: string, @Body('bidPrice') bidPrice: number) {
        return this.tendersService.bid(id, userId, bidPrice);
    }
}
