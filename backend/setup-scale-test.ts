import { PrismaClient, TenderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 --- Initializing Large-Scale Tender Test --- 🚀\n');

  // 1. Preparation
  const supplierEmail = 'supplier@blip.com';
  let supplier = await prisma.user.findUnique({ where: { email: supplierEmail } });

  if (!supplier) {
    console.log('📦 Creating supplier...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    supplier = await prisma.user.create({
      data: {
        name: 'Scale Test Supplier',
        email: supplierEmail,
        password: hashedPassword,
        role: 'SUPPLIER',
      },
    });
  }

  // 2. Clear old test data to avoid confusion
  console.log('🧹 Clearing old "Mega Test" data...');
  const oldTenders = await prisma.tender.findMany({ where: { title: 'Mega Test: 60+ Users Goal' } });
  for (const t of oldTenders) {
    await prisma.customerEnrollment.deleteMany({ where: { tenderId: t.id } });
    await prisma.supplierBid.deleteMany({ where: { tenderId: t.id } });
    await prisma.tenderTier.deleteMany({ where: { tenderId: t.id } });
    await prisma.tender.delete({ where: { id: t.id } });
  }

  // 3. Create the Mega Tender
  console.log('📝 Creating Mega Test Tender (Expires in 10 minutes)...');
  const now = new Date();
  const expireTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

  const megaTender = await prisma.tender.create({
    data: {
      title: 'Mega Test: 60+ Users Goal',
      description: 'Join this extreme test! If we hit 60 participants, the price drops to $120. We already have 58 excited users waiting!',
      originalPrice: 200,
      currentPrice: 150, // Initial price for current participants (will be updated by tiers)
      targetParticipants: 100,
      currentParticipants: 0,
      endDate: expireTime,
      imageUrl: 'https://images.unsplash.com/photo-1546868889-4e0c6819757c?auto=format&fit=crop&q=80&w=800',
      status: TenderStatus.ACTIVE,
      category: 'Electronics',
      supplierId: supplier.id,
    },
  });

  // Create tiers
  await prisma.tenderTier.createMany({
    data: [
      { tenderId: megaTender.id, minParticipants: 20, discountPercent: 10 }, // $180
      { tenderId: megaTender.id, minParticipants: 40, discountPercent: 25 }, // $150
      { tenderId: megaTender.id, minParticipants: 60, discountPercent: 40 }, // $120
    ],
  });

  // 4. Create and Enroll 58 Users
  console.log('👥 Creating and Enrolling 58 simulated users...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  for (let i = 1; i <= 58; i++) {
    const email = `testuser${i}@test.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `Test User ${i}`,
        email,
        password: hashedPassword,
        isVerified: true,
        role: 'CUSTOMER',
      },
    });

    // Add address if not exists
    const addr = await prisma.address.findFirst({ where: { userId: user.id } });
    if (!addr) {
      await prisma.address.create({
        data: {
          userId: user.id,
          street: `Street ${i}`,
          city: 'Test City',
          isDefault: true,
        },
      });
    }

    // Enroll in the tender
    await (prisma.customerEnrollment.create as any)({
         data: {
             tenderId: megaTender.id,
             userId: user.id,
             userName: user.name,
             userEmail: user.email,
             tenderTitle: megaTender.title
         }
    });
  }

  // Update participants count and current price manually for the setup
  await prisma.tender.update({
    where: { id: megaTender.id },
    data: {
        currentParticipants: 58,
        currentPrice: 150 // Price at 58 participants (40-60 tier)
    }
  });

  // 5. Create a Winning Bid from a competitor
  console.log('💰 Creating winning competitor bid...');
  let competitor = await prisma.user.findUnique({ where: { email: 'competitor@test.com' } });
  if (!competitor) {
    competitor = await prisma.user.create({
        data: {
            name: 'Competitor Brand',
            email: 'competitor@test.com',
            password: hashedPassword,
            role: 'SUPPLIER'
        }
    });
  }

  await (prisma.supplierBid.create as any)({
    data: {
      tenderId: megaTender.id,
      userId: competitor.id,
      bidPrice: 110,
      supplierName: competitor.name,
      supplierEmail: competitor.email,
      tenderTitle: megaTender.title
    }
  });

  console.log('\n✅ SETUP COMPLETE!');
  console.log('--------------------------------------------------');
  console.log(`Tender ID: ${megaTender.id}`);
  console.log(`Current Participants: 58/100`);
  console.log(`Current Price: $150`);
  console.log(`Expires at: ${expireTime.toLocaleTimeString()}`);
  console.log('--------------------------------------------------');
  console.log('\n🔑 TEST CREDENTIALS (for verification):');
  console.log('1. testuser1@test.com / password123');
  console.log('2. testuser2@test.com / password123');
  console.log('--------------------------------------------------\n');
  console.log('👉 ACTION: Now go to your phone and sign up 3 new users to hit the 60 goal!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
