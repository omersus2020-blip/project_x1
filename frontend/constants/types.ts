export interface PriceTier {
    minParticipants: number;
    discountPercent: number;
}

export interface Tender {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startingPrice: number;
    targetPrice: number;
    currentPrice: number;
    endDate: string; // ISO date string
    currentParticipants: number;
    targetParticipants: number;
    category: string;
    status: 'OPEN' | 'CLOSED' | 'DELIVERED';
    priceTiers: PriceTier[];
}

export interface Bid {
    id: string;
    tenderId: string;
    userId: string;
    amount: number;
    status: 'ACTIVE' | 'WON' | 'LOST' | 'CANCELLED';
    date: string;
}

export interface TenderHistoryEntry {
    id: string;
    title: string;
    date: string;
    savings: number;
    icon: string; // MaterialIcons name
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    totalSavings: number;
    tenderHistory: TenderHistoryEntry[];
}
