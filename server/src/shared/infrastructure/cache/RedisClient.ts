import Redis from 'ioredis';

export class RedisClient {
    private static instance: RedisClient;
    private client: Redis;

    private constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        });

        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        this.client.on('connect', () => {
            console.log('Redis connected successfully');
        });
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    public async set(
        key: string,
        value: any,
        ttlSeconds?: number
    ): Promise<void> {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        } else {
            await this.client.set(key, serialized);
        }
    }

    public async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    public async deletePattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }

    public async increment(key: string): Promise<number> {
        return await this.client.incr(key);
    }

    public async expire(key: string, seconds: number): Promise<void> {
        await this.client.expire(key, seconds);
    }

    public async healthCheck(): Promise<boolean> {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch {
            return false;
        }
    }

    public async close(): Promise<void> {
        await this.client.quit();
    }
}
