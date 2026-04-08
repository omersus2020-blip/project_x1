import { Module } from '@nestjs/common';
import { TendersController } from './tenders.controller.js';
import { TendersService } from './tenders.service.js';
import { TenderTasksService } from './tender-tasks.service.js';

@Module({
    controllers: [TendersController],
    providers: [TendersService, TenderTasksService],
    exports: [TendersService],
})
export class TendersModule { }
