import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const tables = [
    'user',
    'pendingUser',
    'tender',
    'tenderTier',
    'order',
    'customerEnrollment',
    'supplierBid',
    'notification',
    'address',
    'paymentMethod',
    'savedTender',
    'otpCode'
  ];

  console.log('--- Database Row Counts ---');
  for (const table of tables) {
    try {
      // @ts-ignore
      const count = await prisma[table].count();
      console.log(`${table}: ${count}`);
    } catch (e) {
      console.log(`${table}: ERROR (${e.message.split('\n')[0]})`);
    }
  }
  await prisma.$disconnect();
}

main();
