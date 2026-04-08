import { Tender, UserProfile } from './types';

// Helper: create an end date X hours from now
function hoursFromNow(hours: number): string {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return d.toISOString();
}

export const MOCK_TENDERS: Tender[] = [
    {
        id: '1',
        title: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        startingPrice: 199.99,
        targetPrice: 139.99,
        currentPrice: 179.99,
        endDate: hoursFromNow(-1), // expired
        currentParticipants: 45,
        targetParticipants: 100,
        category: 'Electronics',
        status: 'OPEN',
        priceTiers: [
            { minParticipants: 10, discountPercent: 0 },
            { minParticipants: 25, discountPercent: 5 },
            { minParticipants: 50, discountPercent: 10 },
            { minParticipants: 75, discountPercent: 15 },
            { minParticipants: 100, discountPercent: 20 },
        ],
    },
    {
        id: '2',
        title: 'Smart Coffee Maker with Timer',
        description: 'Programmable coffee maker with built-in grinder and thermal carafe.',
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=300&fit=crop',
        startingPrice: 99.99,
        targetPrice: 59.99,
        currentPrice: 79.99,
        endDate: hoursFromNow(-2), // expired
        currentParticipants: 78,
        targetParticipants: 80,
        category: 'Kitchen',
        status: 'OPEN',
        priceTiers: [
            { minParticipants: 10, discountPercent: 0 },
            { minParticipants: 25, discountPercent: 5 },
            { minParticipants: 50, discountPercent: 10 },
            { minParticipants: 65, discountPercent: 15 },
            { minParticipants: 80, discountPercent: 20 },
        ],
    },
    {
        id: '3',
        title: 'Ergonomic Office Chair',
        description: 'Adjustable office chair with lumbar support and breathable mesh back.',
        imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300&h=300&fit=crop',
        startingPrice: 299.99,
        targetPrice: 179.99,
        currentPrice: 239.99,
        endDate: hoursFromNow(20.65),
        currentParticipants: 32,
        targetParticipants: 50,
        category: 'Office',
        status: 'OPEN',
        priceTiers: [
            { minParticipants: 5, discountPercent: 0 },
            { minParticipants: 15, discountPercent: 10 },
            { minParticipants: 25, discountPercent: 15 },
            { minParticipants: 40, discountPercent: 20 },
            { minParticipants: 50, discountPercent: 25 },
        ],
    },
    {
        id: '4',
        title: 'Modern Minimalist Desk Lamp',
        description: 'LED desk lamp with adjustable brightness and color temperature.',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=300&h=300&fit=crop',
        startingPrice: 49.99,
        targetPrice: 29.99,
        currentPrice: 49.99,
        endDate: hoursFromNow(98),
        currentParticipants: 15,
        targetParticipants: 60,
        category: 'Home',
        status: 'OPEN',
        priceTiers: [
            { minParticipants: 10, discountPercent: 0 },
            { minParticipants: 20, discountPercent: 5 },
            { minParticipants: 35, discountPercent: 10 },
            { minParticipants: 50, discountPercent: 15 },
            { minParticipants: 60, discountPercent: 20 },
        ],
    },
    {
        id: '5',
        title: 'Wireless Gaming Mouse',
        description: 'High-precision wireless gaming mouse with RGB lighting and 16000 DPI.',
        imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop',
        startingPrice: 79.99,
        targetPrice: 47.99,
        currentPrice: 59.99,
        endDate: hoursFromNow(-3), // expired
        currentParticipants: 55,
        targetParticipants: 75,
        category: 'Electronics',
        status: 'OPEN',
        priceTiers: [
            { minParticipants: 10, discountPercent: 0 },
            { minParticipants: 20, discountPercent: 10 },
            { minParticipants: 40, discountPercent: 15 },
            { minParticipants: 60, discountPercent: 20 },
            { minParticipants: 75, discountPercent: 25 },
        ],
    },
];

export const MOCK_USER: UserProfile = {
    id: 'u1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    totalSavings: 124,
    tenderHistory: [
        {
            id: 'h1',
            title: 'Smart Coffee Maker with Timer',
            date: '02/15/26',
            savings: 20,
            icon: 'local-cafe',
        },
        {
            id: 'h2',
            title: 'Wireless Gaming Mouse',
            date: '03/01/26',
            savings: 20,
            icon: 'mouse',
        },
        {
            id: 'h3',
            title: 'Premium Wireless Headphones',
            date: '03/10/26',
            savings: 84,
            icon: 'headphones',
        },
    ],
};
