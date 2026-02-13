import { apiClient } from './api';
import type { Ad } from './adService';

export interface SearchParams {
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    page?: number;
    limit?: number;
}

export interface SearchResult {
    ads: Ad[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const CACHE_DURATION = 5 * 60 * 1000;
const searchCache = new Map<string, { data: SearchResult; timestamp: number }>();

function getCacheKey(params: SearchParams): string {
    return JSON.stringify(params);
}

export const searchService = {
    async search(params: SearchParams): Promise<SearchResult> {
        const cacheKey = getCacheKey(params);
        const cached = searchCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('[Search] Cache hit');
            return cached.data;
        }

        const response = await apiClient.get<SearchResult>('/api/v1/search', { params });
        searchCache.set(cacheKey, { data: response.data, timestamp: Date.now() });

        return response.data;
    },

    clearCache(): void {
        searchCache.clear();
    },
};
