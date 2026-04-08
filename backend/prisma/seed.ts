import { PrismaClient, TenderStatus } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data (order matters due to FK constraints)
    await prisma.notification.deleteMany();
    await prisma.order.deleteMany();
    await prisma.supplierBid.deleteMany();
    await prisma.customerEnrollment.deleteMany();
    await prisma.tenderTier.deleteMany();
    await prisma.tender.deleteMany();
    // Keep users and addresses if they exist

    const now = new Date();

    // 1. Create or find a supplier user
    const supplier = await prisma.user.upsert({
        where: { email: 'supplier@blip.com' },
        update: {},
        create: {
            name: 'Blip Supplier',
            email: 'supplier@blip.com',
            password: '$2b$10$dummyhashedpassword1234567890abc', // placeholder
            role: 'SUPPLIER',
        },
    });
    console.log(`✅ Supplier user: ${supplier.name} (${supplier.id})`);

    // 2. Create tenders linked to the supplier
    const tendersData = [
        {
            title: 'Sony PlayStation 5 Pro',
            description: 'The ultimate gaming console. Group buy to get it at wholesale price directly from the importer.',
            originalPrice: 499,
            currentPrice: 450,
            targetParticipants: 100,
            currentParticipants: 85,
            endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
            imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
            status: TenderStatus.ACTIVE,
            category: 'Electronics',
            supplierId: supplier.id,
        },
        {
            title: 'Dyson V15 Detect Vacuum',
            description: 'Powerful cordless vacuum with laser illumination. Need 50 buyers to unlock the massive discount!',
            originalPrice: 750,
            currentPrice: 590,
            targetParticipants: 50,
            currentParticipants: 12,
            endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
            imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
            status: TenderStatus.ACTIVE,
            category: 'Home & Kitchen',
            supplierId: supplier.id,
        },
        {
            title: 'Samsung 65" 4K OLED TV',
            description: 'Stunning picture quality. Group buy offer exclusively through this tender.',
            originalPrice: 1200,
            currentPrice: 999,
            targetParticipants: 30,
            currentParticipants: 28,
            endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day
            imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
            status: TenderStatus.ACTIVE,
            category: 'Electronics',
            supplierId: supplier.id,
        },
        {
            title: 'Nespresso Vertuo Next',
            description: 'Coffee and espresso maker with 3 boxes of capsules included.',
            originalPrice: 180,
            currentPrice: 135,
            targetParticipants: 200,
            currentParticipants: 45,
            endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
            imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800',
            status: TenderStatus.ACTIVE,
            category: 'Home & Kitchen',
            supplierId: supplier.id,
        },
    ];

    for (const data of tendersData) {
        const t = await prisma.tender.create({ data });

        // Add 5 price tiers that strictly increase
        const s = Math.max(1, Math.floor(t.targetParticipants / 5));
        await prisma.tenderTier.createMany({
            data: [
                { tenderId: t.id, minParticipants: s, discountPercent: 0 },
                { tenderId: t.id, minParticipants: s * 2, discountPercent: 5 },
                { tenderId: t.id, minParticipants: s * 3, discountPercent: 10 },
                { tenderId: t.id, minParticipants: s * 4, discountPercent: 15 },
                { tenderId: t.id, minParticipants: Math.max(s * 5, t.targetParticipants), discountPercent: 20 },
            ],
        });

        console.log(`Created Tender with Tiers: ${data.title}`);
    }

    console.log(`✅ Seeding finished. Added supplier + 4 tenders with pricing tiers.`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
