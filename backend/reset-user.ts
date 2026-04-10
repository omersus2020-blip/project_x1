import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log('Usage: npx ts-node reset-user.ts <email>');
        process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log(`❌ No user found with email: ${email}`);
        process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log('Deleting related data...');

    // Delete in correct order (respecting FK constraints)
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.savedTender.deleteMany({ where: { userId: user.id } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.customerEnrollment.deleteMany({ where: { userId: user.id } });
    // Handle Supplier-specific data
    const supplier = await (prisma as any).supplier.findUnique({ where: { userId: user.id } });
    if (supplier) {
        await (prisma as any).supplierBid.deleteMany({ where: { supplierId: supplier.id } });
        await (prisma as any).supplier.delete({ where: { id: supplier.id } });
        console.log('✅ Cleaned up Supplier profile and bids');
    }
    await prisma.address.deleteMany({ where: { userId: user.id } });
    await prisma.paymentMethod.deleteMany({ where: { userId: user.id } });
    await prisma.otpCode.deleteMany({ where: { userId: user.id } });

    // Now delete the user
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`✅ User "${user.name}" and all related data deleted successfully!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
