import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TendersModule } from './tenders/tenders.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { SavedTendersModule } from './tenders/saved-tenders.module.js';
import { OtpModule } from './otp/otp.module.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    TendersModule,
    AuthModule,
    AddressesModule,
    PaymentMethodsModule,
    NotificationsModule,
    SavedTendersModule,
    OtpModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
