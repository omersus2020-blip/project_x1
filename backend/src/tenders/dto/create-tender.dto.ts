import { TenderStatus } from '../entities/tender.entity';

export class CreateTenderDto {
    title: string;
    description: string;
    imageUrl: string;
    startingPrice: number;
    targetPrice: number;
    endDate: string; // ISO date string
    targetParticipants: number;
    category: string;
    priceTiers: { minParticipants: number; discountPercent: number }[];
}
