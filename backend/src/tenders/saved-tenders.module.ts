import { Module } from '@nestjs/common';
import { SavedTendersController } from './saved-tenders.controller';
import { SavedTendersService } from './saved-tenders.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedTendersController],
  providers: [SavedTendersService],
  exports: [SavedTendersService],
})
export class SavedTendersModule {}
