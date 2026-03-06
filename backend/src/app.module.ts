import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TendersModule } from './tenders/tenders.module.js';

@Module({
  imports: [PrismaModule, TendersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
