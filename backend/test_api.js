import { PrismaClient } from '@prisma/client';
import "dotenv/config";
import jwt from 'jsonwebtoken';

async function test() {
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst();
    if (!user) { console.log('no user'); return; }
    
    // sign token
    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback', { expiresIn: '1h' });
    
    const res = await fetch('http://127.0.0.1:3000/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            label: "Home",
            street: "Test empty city",
            city: "",
            country: ""
        })
    });
    console.log(res.status);
    console.log(await res.text());
    await prisma.$disconnect();
}
test();
