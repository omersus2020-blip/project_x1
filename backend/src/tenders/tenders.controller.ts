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

    @Post(':id/join')
    join(@Param('id') id: string, @Body('userId') userId: string) {
        return this.tendersService.join(id, userId);
    }
}
