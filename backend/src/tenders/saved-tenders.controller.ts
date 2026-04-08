import { Controller, Post, Get, Param, Body, NotFoundException } from '@nestjs/common';
import { SavedTendersService } from './saved-tenders.service';

@Controller('tenders/saved')
export class SavedTendersController {
  constructor(private readonly savedTendersService: SavedTendersService) {}

  @Post('toggle')
  async toggleSave(@Body() body: { userId: string; tenderId: string }) {
    return this.savedTendersService.toggleSave(body.tenderId, body.userId);
  }

  @Get('user/:userId')
  async getSavedByUserId(@Param('userId') userId: string) {
    return this.savedTendersService.getSavedByUserId(userId);
  }

  @Get('status/:userId/:tenderId')
  async isSaved(
    @Param('userId') userId: string,
    @Param('tenderId') tenderId: string,
  ) {
    return this.savedTendersService.isSaved(tenderId, userId);
  }
}
