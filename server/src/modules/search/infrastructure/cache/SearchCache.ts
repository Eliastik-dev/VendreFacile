import { RedisClient } from '../../../../shared/infrastructure/cache/RedisClient';

export class SearchCache {
    private readonly ttl: number;

    constructor(private redisClient: RedisClient) {
        this.ttl = parseInt(process.env.SEARCH_CACHE_TTL || '300'); // 5 minutes default
    }

    public async get<T>(key: string): Promise<T | null> {
        return await this.redisClient.get<T>(key);
    }

    public async set(key: string, value: any): Promise<void> {
        await this.redisClient.set(key, value, this.ttl);
    }

    public async invalidateAdRelated(adId: string): Promise<void> {

        await this.redisClient.deletePattern('search:*');
    }
}
