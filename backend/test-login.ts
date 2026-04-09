import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing hash for user...');
    const hash = await bcrypt.hash('omer123#', 12);
    await prisma.user.update({
        where: { email: 'omersus2020@gmail.com' },
        data: { password: hash }
    });
    console.log('Password hash updated successfully!');
}

main().finally(() => prisma.$disconnect());
