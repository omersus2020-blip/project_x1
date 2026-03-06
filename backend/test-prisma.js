import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('Testing Prisma Client Initialization...');
    try {
        const prisma = new PrismaClient();
        console.log('Prisma Client instance created successfully.');
        await prisma.$connect();
        console.log('Connected to the database successfully.');
        await prisma.$disconnect();
    } catch (error) {
        console.error('Failed:', error);
    }
}

main();
