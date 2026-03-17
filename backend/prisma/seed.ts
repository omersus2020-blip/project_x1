import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data (order matters due to foreign keys)
    await prisma.supplierBid.deleteMany();
    await prisma.customerEnrollment.deleteMany();
    await prisma.tender.deleteMany();
    await prisma.user.deleteMany();

    const now = new Date();

    // Create 1 Dummy Tender
    const tender = await prisma.tender.create({
        data: {
            title: 'Washing Machine',
            description: 'A brand new high end washing machine.',
            originalPrice: 1500,
            currentPrice: 1500,
            targetParticipants: 10,
            currentParticipants: 3,
            endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            imageUrl: 'https://cdn-icons-png.flaticon.com/512/3514/3514491.png',
            status: 'ACTIVE',
            category: 'חשמל',
        }
    });
    console.log(`Created Tender: ${tender.title}`);

    // Create 3 Customers
    const customer1 = await prisma.user.create({ data: { name: 'Customer One', email: 'c1@example.com', role: 'CUSTOMER' } });
    const customer2 = await prisma.user.create({ data: { name: 'Customer Two', email: 'c2@example.com', role: 'CUSTOMER' } });
    const customer3 = await prisma.user.create({ data: { name: 'Customer Three', email: 'c3@example.com', role: 'CUSTOMER' } });

    // Enroll them in the tender
    await prisma.customerEnrollment.createMany({
        data: [
            { tenderId: tender.id, userId: customer1.id },
            { tenderId: tender.id, userId: customer2.id },
            { tenderId: tender.id, userId: customer3.id },
        ]
    });
    console.log(`Created 3 Customers and enrolled them in the tender`);

    // Create 2 Suppliers
    const supplier1 = await prisma.user.create({ data: { name: 'Supplier One', email: 's1@example.com', role: 'SUPPLIER' } });
    const supplier2 = await prisma.user.create({ data: { name: 'Supplier Two', email: 's2@example.com', role: 'SUPPLIER' } });

    // Create Supplier Bids
    await prisma.supplierBid.createMany({
        data: [
            { tenderId: tender.id, userId: supplier1.id, bidPrice: 1400 },
            { tenderId: tender.id, userId: supplier2.id, bidPrice: 1350 },
        ]
    });
    console.log(`Created 2 Suppliers and submitted bids for the tender`);

    console.log(`✅ Seeding finished.`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
