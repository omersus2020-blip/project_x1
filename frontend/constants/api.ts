import { Platform } from 'react-native';

// Use your machine's local IP for Expo to connect to the backend properly
const getBaseUrl = () => {
    return 'http://192.168.1.210:3000';
};

export const API_URL = getBaseUrl();

export interface TenderFromAPI {
    id: string;
    title: string;
    description: string;
    originalPrice: number;
    currentPrice: number;
    targetParticipants: number;
    currentParticipants: number;
    endDate: string;
    imageUrl: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    category: string;
    createdAt: string;
    updatedAt: string;
}

export async function fetchActiveTenders(): Promise<TenderFromAPI[]> {
    const response = await fetch(`${API_URL}/tenders/active`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}

export async function fetchTenderById(id: string): Promise<TenderFromAPI> {
    const response = await fetch(`${API_URL}/tenders/${id}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}
