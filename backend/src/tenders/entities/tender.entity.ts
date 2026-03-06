export enum TenderStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    DELIVERED = 'DELIVERED',
}

export class PriceTier {
    minParticipants: number;
    discountPercent: number;
}

export class Tender {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startingPrice: number;
    targetPrice: number;
    currentPrice: number;
    endDate: Date;
    currentParticipants: number;
    targetParticipants: number;
    category: string;
    status: TenderStatus;
    priceTiers: PriceTier[];
    createdAt: Date;
    updatedAt: Date;
}
