import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const mockEmails = ['supplier@blip.com', 'customera@test.com', 'customerb@test.com', 'competitor@blip.com'];
    const users = await prisma.user.findMany({
        where: { NOT: { email: { in: mockEmails } } },
        select: { id: true, name: true, email: true, createdAt: true }
    });
    console.log(`Found ${users.length} non-mock users.`);
    users.forEach(u => console.log(`${u.createdAt.toISOString()} | ${u.id} | ${u.name} | ${u.email}`));
    await prisma.$disconnect();
}
main();
