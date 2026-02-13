import { Request, Response, NextFunction } from 'express';
import { RedisClient } from '../cache/RedisClient';

export class RateLimitMiddleware {
    private redisClient: RedisClient;
    private windowMs: number;
    private maxRequests: number;

    constructor() {
        this.redisClient = RedisClient.getInstance();
        this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
        this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    }

    public limit = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const identifier = this.getIdentifier(req);
            const key = `rate_limit:${identifier}`;

            const current = await this.redisClient.increment(key);

            if (current === 1) {
                await this.redisClient.expire(key, Math.floor(this.windowMs / 1000));
            }

            const remaining = Math.max(0, this.maxRequests - current);

            res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', remaining.toString());

            if (current > this.maxRequests) {
                res.status(429).json({
                    error: 'Too many requests, please try again later',
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Rate limiting error:', error);

            next();
        }
    };

    private getIdentifier(req: Request): string {

        const user = (req as any).user;
        if (user?.userId) {
            return `user:${user.userId}`;
        }
        return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    }
}
