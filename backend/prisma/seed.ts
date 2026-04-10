import { PrismaClient, TenderStatus, BidStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting full-scale database seed...');
  const now = new Date();

  // 1. Wipe everything (ordered by dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.order.deleteMany();
  await (prisma as any).supplierBid.deleteMany();
  await prisma.customerEnrollment.deleteMany();
  await prisma.tenderTier.deleteMany();
  await prisma.savedTender.deleteMany();
  await prisma.tender.deleteMany();
  await (prisma as any).supplier.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.address.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  console.log('👥 Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Global Admin',
      email: 'admin@blip.com',
      password: 'hashed_password_123',
      role: (Role as any).ADMIN || 'ADMIN',
      isVerified: true
    }
  });

  const customers: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const cust = await prisma.user.create({
      data: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: 'hashed_password_123',
        role: Role.CUSTOMER,
        isVerified: true,
      }
    });
    customers.push(cust);
  }

  // 3. Create Suppliers
  console.log('🏢 Creating suppliers...');
  const supplierData = [
    { name: 'Tnuva Corp', email: 'tnuva@suppliers.com', sector: 'Food & Groceries' },
    { name: 'Samsung Israel', email: 'samsung@suppliers.com', sector: 'Electronics' },
    { name: 'Dyson Official', email: 'dyson@suppliers.com', sector: 'Home & Kitchen' },
  ];

  const suppliers: any[] = [];
  for (const s of supplierData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password: 'supplier_password_123',
        role: Role.SUPPLIER,
        isVerified: true,
      }
    });

    const supplier = await (prisma as any).supplier.create({
      data: {
        userId: user.id,
        name: s.name,
        email: s.email,
        companyNumber: `51${Math.floor(Math.random() * 90000000) + 10000000}`,
        bankAccount: `IBAN${Math.random().toString(36).substring(7).toUpperCase()}`,
        businessAddress: `Industrial Zone ${Math.floor(Math.random() * 10) + 1}, Israel`,
        businessSector: s.sector,
        contactName: `Manager ${s.name.split(' ')[0]}`,
        contactPhone: `050-${Math.floor(Math.random() * 9000000) + 1000000}`
      }
    });
    suppliers.push(supplier);
  }

  // 4. Create Tenders
  console.log('📦 Creating tenders...');
  const tendersData = [
    {
      title: 'Sony PlayStation 5 Pro',
      description: 'The ultimate gaming console. Group buy to get it at wholesale price directly from the importer.',
      originalPrice: 2499,
      currentPrice: 2199,
      targetParticipants: 50,
      currentParticipants: 42,
      category: 'Electronics',
      status: TenderStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Dyson V15 Detect Vacuum',
      description: 'Powerful cordless vacuum with laser illumination. High demand product!',
      originalPrice: 3200,
      currentPrice: 2850,
      targetParticipants: 30,
      currentParticipants: 12,
      category: 'Home & Kitchen',
      status: TenderStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Espresso Machine Sage Barista',
      description: 'Professional coffee at home. Stainless steel finish.',
      originalPrice: 4500,
      currentPrice: 3900,
      targetParticipants: 20,
      currentParticipants: 20, // Full
      category: 'Home & Kitchen',
      status: (TenderStatus as any).COMPLETED || 'COMPLETED',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800',
      endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Ended yesterday
    },
    {
        title: 'Fresh Milk 1L - Bulk Case (12 units)',
        description: 'Tnuva official distribution. Minimum 20 cases for group price.',
        originalPrice: 84,
        currentPrice: 72,
        targetParticipants: 20,
        currentParticipants: 2,
        category: 'Food & Groceries',
        status: TenderStatus.ACTIVE,
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e91082a119d2?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'iPhone 15 Pro Max 256GB',
        description: 'Titanium design, A17 Pro chip. The most powerful iPhone ever.',
        originalPrice: 5800,
        currentPrice: 5200,
        targetParticipants: 40,
        currentParticipants: 38,
        category: 'Electronics',
        status: TenderStatus.ACTIVE,
        imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Organic Olive Oil 5L',
        description: 'Extra virgin olive oil from local orchards.',
        originalPrice: 280,
        currentPrice: 220,
        targetParticipants: 100,
        currentParticipants: 100,
        category: 'Food & Groceries',
        status: (TenderStatus as any).COMPLETED || 'COMPLETED',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Galaxy AI is here. Epic zoom, epic performance.',
        originalPrice: 5100,
        currentPrice: 4600,
        targetParticipants: 25,
        currentParticipants: 5,
        category: 'Electronics',
        status: (TenderStatus as any).ACTIVE || 'ACTIVE',
        imageUrl: 'https://images.unsplash.com/photo-1707064826897-a252e61be1ec?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Wholesale Avocado Box (4kg)',
        description: 'Premium quality avocados ready for ripening.',
        originalPrice: 60,
        currentPrice: 45,
        targetParticipants: 50,
        currentParticipants: 0,
        category: 'Food & Groceries',
        status: (TenderStatus as any).PENDING_APPROVAL || 'PENDING_APPROVAL',
        imageUrl: 'https://images.unsplash.com/photo-1523472553351-36f88e13cd0d?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Dyson Airwrap Multi-Styler',
        description: 'Curl. Shape. Smooth and hide flyaways. With no extreme heat.',
        originalPrice: 2000,
        currentPrice: 1750,
        targetParticipants: 15,
        currentParticipants: 12,
        category: 'Health & Beauty',
        status: TenderStatus.ACTIVE,
        imageUrl: 'https://images.unsplash.com/photo-1643185539104-3622eb1f0ff6?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
    {
        title: 'Ninja Foodi 11-in-1 Smartlid',
        description: 'Pressure cooker, air fryer, and more.',
        originalPrice: 1400,
        currentPrice: 1150,
        targetParticipants: 30,
        currentParticipants: 28,
        category: 'Home & Kitchen',
        status: TenderStatus.ACTIVE,
        imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800',
        endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    }
  ];

  const createdTenders: any[] = [];
  for (const tData of tendersData) {
    // Determine primary supplier based on category
    let supplierIndex = 0;
    if (tData.category === 'Electronics') supplierIndex = 1; // Samsung
    if (tData.category === 'Food & Groceries') supplierIndex = 0; // Tnuva
    if (tData.category === 'Home & Kitchen') supplierIndex = 2; // Dyson

    const tender = await prisma.tender.create({
      data: {
        ...tData,
        supplierId: suppliers[supplierIndex].id,
      }
    });
    createdTenders.push(tender);

    // Add Tiers
    const step = Math.max(1, Math.floor(tender.targetParticipants / 4));
    await prisma.tenderTier.createMany({
        data: [
            { tenderId: tender.id, minParticipants: step, discountPercent: 2 },
            { tenderId: tender.id, minParticipants: step * 2, discountPercent: 5 },
            { tenderId: tender.id, minParticipants: step * 3, discountPercent: 8 },
            { tenderId: tender.id, minParticipants: tender.targetParticipants, discountPercent: 12 },
        ]
    });

    console.log(`Created: ${tender.title}`);
  }

  // 5. Create Bids (Competing)
  console.log('⚖️ Creating competing bids...');
  for (const tender of createdTenders) {
    // Primary Bid (The owner)
    const bid1 = await (prisma as any).supplierBid.create({
      data: {
        tenderId: tender.id,
        supplierId: tender.supplierId,
        bidPrice: tender.currentPrice,
        status: tender.status === TenderStatus.COMPLETED ? BidStatus.WON : BidStatus.PENDING,
        tenderTitle: tender.title,
        supplierName: suppliers.find(s => s.id === tender.supplierId).name
      }
    });

    // Competitor Bid (Random other supplier)
    const otherSuppliers = suppliers.filter(s => s.id !== tender.supplierId);
    const competitor = otherSuppliers[Math.floor(Math.random() * otherSuppliers.length)];
    const bid2 = await (prisma as any).supplierBid.create({
        data: {
          tenderId: tender.id,
          supplierId: competitor.id,
          bidPrice: tender.currentPrice * (1 + (Math.random() * 0.1)), // Slightly more expensive
          status: tender.status === TenderStatus.COMPLETED ? BidStatus.LOST : BidStatus.PENDING,
          tenderTitle: tender.title,
          supplierName: competitor.name
        }
    });

    // 6. Create Enrollments and Orders for Completed tenders
    if (tender.status === TenderStatus.COMPLETED) {
        console.log(`📑 Generating orders for finished tender: ${tender.title}`);
        for (let i = 0; i < 3; i++) {
            const customer = customers[i];
            await prisma.customerEnrollment.create({
                data: {
                    tenderId: tender.id,
                    userId: customer.id,
                    quantity: 1,
                    userName: customer.name,
                    userEmail: customer.email,
                    tenderTitle: tender.title
                }
            });

            await prisma.order.create({
                data: {
                    tenderId: tender.id,
                    userId: customer.id,
                    supplierBidId: bid1.id,
                    finalPrice: tender.currentPrice,
                    quantity: 1,
                    totalPrice: tender.currentPrice,
                    status: i === 0 ? 'DELIVERED' : 'PROCESSING',
                    deliveryAddress: 'Herzel St 1, Tel Aviv',
                    userName: customer.name,
                    userEmail: customer.email,
                    tenderTitle: tender.title
                }
            });
        }
    }
  }

  console.log('✅ Seeding complete! Added:');
  console.log('- 1 Admin, 5 Customers');
  console.log('- 3 Verified Suppliers with Profiles');
  console.log('- 10 Tenders with Tiers');
  console.log('- 20 Competing Bids');
  console.log('- 6 Sample Orders');
}

main()
  .catch((e) => {
    console.error('❌ ERROR during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
