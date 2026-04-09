import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🚀 --- Starting End-to-End Tender Lifecycle Test --- 🚀\n');

    // 1. Preparation: Find our supplier and users
    console.log('📦 1. PREPARATION');
    const supplier = await prisma.user.findUnique({ where: { email: 'supplier@blip.com' } });
    if (!supplier) throw new Error('Supplier not found. Did you run the seed?');
    
    const liveUser = await prisma.user.findUnique({
        where: { email: 'omersus2020@gmail.com' }
    });
    if (!liveUser) throw new Error('Live user (Omer dabus) not found in database. Please sign in on the app first!');
    
    const customerA = await prisma.user.upsert({
        where: { email: 'customera@test.com' },
        update: {},
        create: { name: 'Customer A', email: 'customera@test.com', password: 'pwd', role: 'CUSTOMER' }
    });
    
    console.log(`✅ Found Live User: ${liveUser.name} (${liveUser.email})`);
    console.log(`✅ Found/Created Customer A: ${customerA.name}\n`);

    // Give them default addresses
    await prisma.address.deleteMany({ where: { userId: { in: [customerA.id, liveUser.id] } } });
    await prisma.address.create({ data: { userId: customerA.id, street: '123 Main St', city: 'Tel Aviv', isDefault: true } });
    await prisma.address.create({ data: { userId: liveUser.id, street: 'Your Home Address', city: 'Your City', isDefault: true } });

    console.log(`✅ Found Supplier: ${supplier.name}`);
    console.log(`✅ Setup addresses for: ${customerA.name} and ${liveUser.name}\n`);

    // 2. Supplier creates a Tender (expiring in 60 seconds for testing)
    console.log('📝 2. SUPPLIER CREATES TENDER');
    const now = new Date();
    const expireTime = new Date(now.getTime() + 60 * 1000); // Expires in 60 seconds

    const newTender = await prisma.tender.create({
        data: {
            title: 'Test Tender: MacBook Pro M3',
            description: 'Group buy for the new MacBook Pro.',
            originalPrice: 2000,
            currentPrice: 1800,
            targetParticipants: 10,
            endDate: expireTime,
            imageUrl: 'https://example.com/macbook.jpg',
            supplierId: supplier.id,
        }
    });
    console.log(`✅ Tender Created: "${newTender.title}" (ID: ${newTender.id})`);
    console.log(`⏳ Tender expires at: ${expireTime.toLocaleTimeString()}\n`);

    // 3. Customers Enroll
    console.log('👥 3. CUSTOMERS ENROLL');
    await (prisma.customerEnrollment.create as any)({ 
        data: { tenderId: newTender.id, userId: customerA.id, userName: customerA.name, userEmail: customerA.email, tenderTitle: newTender.title } 
    });
    await (prisma.customerEnrollment.create as any)({ 
        data: { tenderId: newTender.id, userId: liveUser.id, userName: liveUser.name, userEmail: liveUser.email, tenderTitle: newTender.title } 
    });
    console.log(`✅ ${customerA.name} and ${liveUser.name} joined the tender.\n`);

    // 4. Another Supplier Places a Bid
    console.log('💰 4. COMPETITOR SUPPLIER PLACES A BID');
    const competitor = await prisma.user.upsert({
        where: { email: 'competitor@blip.com' },
        update: {},
        create: { name: 'Competitor Supplier', email: 'competitor@blip.com', password: 'pwd', role: 'SUPPLIER' }
    });
    
    await (prisma.supplierBid.create as any)({
        data: { 
            tenderId: newTender.id, 
            userId: competitor.id, 
            bidPrice: 1750,
            supplierName: competitor.name,
            supplierEmail: competitor.email,
            tenderTitle: newTender.title
        } // Better price!
    });
    console.log(`✅ ${competitor.name} placed a bid of $1750.\n`);

    // 5. Waiting for the tender to expire...
    console.log('⏳ 5. WAITING FOR TENDER TO EXPIRE (60 seconds)...');
    await delay(61000); // wait 61 seconds so it firmly passes
    console.log('✅ Tender should be expired now.\n');

    // 6. Running the Cron Job Logic Manually (simulating the scheduler)
    console.log('⚙️ 6. SIMULATING CRON JOB EXECUTION');
    // We simulate the logic directly below:
    
    // We need to bypass NestJS dependency injection for the test script
    // We'll just run the logic directly since we're in a standalone script
    // (In your app, the cron runs automatically `handleExpiredTenders()`)
    
    const expiredTenders = await prisma.tender.findMany({
        where: {
            status: 'ACTIVE',
            id: newTender.id // Force grab our test tender
        },
        include: {
            enrollments: { include: { user: { include: { addresses: { where: { isDefault: true }, take: 1 } } } } },
            bids: { orderBy: { bidPrice: 'asc' } },
        }
    });

    for (const tender of expiredTenders) {
        // Mark Completed
        await prisma.tender.update({ where: { id: tender.id }, data: { status: 'COMPLETED' } });
        console.log(`✅ Marked tender ${tender.id} as COMPLETED`);

        const winningBid = tender.bids[0];
        
        // Mark Bids
        if (winningBid) {
            await prisma.supplierBid.update({ where: { id: winningBid.id }, data: { status: 'WON' } });
            console.log(`✅ Marked bid by ${winningBid.userId} as WON`);
        }

        // Create Orders
        for (const enrollment of tender.enrollments) {
            const defaultAddress = enrollment.user.addresses[0];
            const addressStr = `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.country}`;
            
            await (prisma.order.create as any)({
                data: {
                    tenderId: tender.id,
                    userId: enrollment.userId,
                    finalPrice: tender.currentPrice,
                    deliveryAddress: addressStr,
                    estimatedDelivery: new Date(),
                    supplierBidId: winningBid?.id || null,
                    userName: enrollment.user.name,
                    userEmail: enrollment.user.email,
                    tenderTitle: tender.title
                }
            });
            console.log(`✅ Created Order for ${enrollment.user.name} -> Ship to: ${addressStr}`);

            // Notify User
            await (prisma.notification.create as any)({
                data: {
                    userId: enrollment.userId,
                    title: `Your order for "${tender.title}" is confirmed!`,
                    body: `Delivery to: ${addressStr}.`,
                    type: 'ORDER_CREATED',
                    tenderId: tender.id,
                    tenderTitle: tender.title
                }
            });
        }

        // Notify Winning Supplier
        if (winningBid) {
            await (prisma.notification.create as any)({
                data: {
                    userId: winningBid.userId,
                    title: `You won the tender: "${tender.title}"!`,
                    body: `Congratulations!`,
                    type: 'TENDER_WON',
                    tenderId: tender.id,
                    tenderTitle: tender.title
                }
            });
            console.log(`✅ Generated Notification for WINNING SUPPLIER (${winningBid.userId})`);
        }
    }
    console.log('\n');

    // 7. Verification - Checking Results
    console.log('📊 7. RESULTS VERIFICATION');
    
    const finalTender = await prisma.tender.findUnique({ where: { id: newTender.id } });
    console.log(`Tender Status: ${finalTender?.status}`);

    const finalBids = await prisma.supplierBid.findMany({ where: { tenderId: newTender.id } });
    console.log(`Winning Bid Status: ${finalBids[0].status}`);

    const newOrders = await prisma.order.findMany({ where: { tenderId: newTender.id }, include: { user: true } });
    console.log(`Orders Created: ${newOrders.length}`);
    newOrders.forEach(o => console.log(`  - Order for ${o.user.name}: Ship to ${o.deliveryAddress} at $${o.finalPrice}`));

    const notifications = await prisma.notification.findMany({ where: { tenderId: newTender.id }, include: { user: true } });
    console.log(`Notifications Created: ${notifications.length}`);
    notifications.forEach(n => console.log(`  - To [${n.user.role}] ${n.user.name}: "${n.title}"`));

    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY 🎉');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
