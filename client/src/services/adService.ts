import { apiClient } from './api';

export interface Ad {
    id: string;
    title: string;
    description: string;
    price: {
        amount: number;
        currency: string;
    };
    location: {
        city: string;
        postalCode: string;
        country: string;
    };
    category: string;
    status: 'DRAFT' | 'PUBLISHED' | 'SOLD';
    sellerId: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdDto {
    title: string;
    description: string;
    price: number;
    currency?: string;
    city: string;
    postalCode: string;
    category: string;
    images?: string[];
}

export interface AdFilters {
    sellerId?: string;
    status?: string;
}

export const adService = {
    async getAds(filters?: AdFilters): Promise<Ad[]> {
        const response = await apiClient.get<Ad[]>('/api/v1/ads', { params: filters });
        return response.data;
    },

    async getAdById(id: string): Promise<Ad> {
        const response = await apiClient.get<Ad>(`/api/v1/ads/${id}`);
        return response.data;
    },

    async createAd(data: CreateAdDto): Promise<Ad> {
        const response = await apiClient.post<Ad>('/api/v1/ads', data);
        return response.data;
    },

    async publishAd(id: string): Promise<void> {
        await apiClient.patch(`/api/v1/ads/${id}/publish`);
    },

    async markAsSold(id: string): Promise<void> {
        await apiClient.patch(`/api/v1/ads/${id}/sold`);
    },
};
