import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AddressesService } from './addresses.service.js';

@Controller('addresses')
export class AddressesController {
    constructor(
        private addressesService: AddressesService,
        private jwtService: JwtService,
    ) {}

    private getUserId(authHeader: string): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = this.jwtService.verify(token);
        return payload.sub;
    }

    @Get()
    async getAll(@Headers('authorization') auth: string) {
        const userId = this.getUserId(auth);
        return this.addressesService.getAll(userId);
    }

    @Post()
    async create(
        @Headers('authorization') auth: string,
        @Body() body: { label?: string; street: string; city: string; state?: string; country?: string; isDefault?: boolean },
    ) {
        const userId = this.getUserId(auth);
        return this.addressesService.create(userId, body);
    }

    @Patch(':id')
    async update(
        @Headers('authorization') auth: string,
        @Param('id') id: string,
        @Body() body: { label?: string; street?: string; city?: string; state?: string; country?: string; isDefault?: boolean },
    ) {
        const userId = this.getUserId(auth);
        return this.addressesService.update(id, userId, body);
    }

    @Delete(':id')
    async delete(
        @Headers('authorization') auth: string,
        @Param('id') id: string,
    ) {
        const userId = this.getUserId(auth);
        return this.addressesService.delete(id, userId);
    }
}
