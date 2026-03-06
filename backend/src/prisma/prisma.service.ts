import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        // אנחנו מעבירים אובייקט "לא ריק" (לוגים) כדי לספק את הדרישה הקשיחה של פריזמה 7
        super({
            adapter,
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