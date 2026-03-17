import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('✅ השרת התחבר בהצלחה ל-Supabase!');
        } catch (error) {
            console.error('❌ שגיאה בחיבור למסד הנתונים:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}