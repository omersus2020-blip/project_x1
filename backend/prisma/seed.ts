import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.tender.deleteMany();

    const now = new Date();

    await prisma.tender.createMany({
        data: [
            {
                title: 'סל קניות שבועי',
                description: 'סל קניות משפחתי הכולל מוצרי מזון בסיסיים לשבוע שלם.',
                originalPrice: 350,
                currentPrice: 315,
                targetParticipants: 100,
                currentParticipants: 84,
                endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/3514/3514491.png',
                status: 'ACTIVE',
                category: 'מזון',
            },
            {
                title: 'מוצרי ניקיון',
                description: 'חבילת מוצרי ניקיון לבית - כולל אבקת כביסה, סבון כלים ועוד.',
                originalPrice: 120,
                currentPrice: 108,
                targetParticipants: 80,
                currentParticipants: 45,
                endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png',
                status: 'ACTIVE',
                category: 'מזון',
            },
            {
                title: 'ירקות מהמשק',
                description: 'מבחר ירקות טריים ישירות מהחקלאי.',
                originalPrice: 95,
                currentPrice: 85,
                targetParticipants: 60,
                currentParticipants: 30,
                endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/2329/2329865.png',
                status: 'ACTIVE',
                category: 'מזון',
            },
            {
                title: 'פירות מהמשק',
                description: 'מבחר פירות עונתיים טריים ישירות מהחקלאי.',
                originalPrice: 110,
                currentPrice: 99,
                targetParticipants: 70,
                currentParticipants: 55,
                endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/3194/3194766.png',
                status: 'ACTIVE',
                category: 'מזון',
            },
            {
                title: "תנור נינג'ה",
                description: "תנור אוויר חם נינג'ה דגם AF300 - בישול בריא וקל.",
                originalPrice: 650,
                currentPrice: 585,
                targetParticipants: 50,
                currentParticipants: 22,
                endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/3075/3075929.png',
                status: 'ACTIVE',
                category: 'חשמל',
            },
            {
                title: 'מקרר',
                description: 'מקרר דו דלתי 520 ליטר עם מקפיא תחתון.',
                originalPrice: 2200,
                currentPrice: 1980,
                targetParticipants: 30,
                currentParticipants: 12,
                endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/3474/3474360.png',
                status: 'ACTIVE',
                category: 'חשמל',
            },
        ],
    });

    const count = await prisma.tender.count();
    console.log(`✅ Seeded ${count} tenders successfully!`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
