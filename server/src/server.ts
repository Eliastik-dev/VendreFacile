import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { AdController } from './modules/ads/infrastructure/api/AdController';
import { UserController } from './modules/users/infrastructure/api/UserController';
import { MessagingController } from './modules/messaging/infrastructure/api/MessagingController';
import { SearchController } from './modules/search/infrastructure/api/SearchController';
import { PostgresClient } from './shared/infrastructure/database/PostgresClient';
import { RedisClient } from './shared/infrastructure/cache/RedisClient';
import { RateLimitMiddleware } from './shared/infrastructure/middleware/RateLimitMiddleware';


dotenv.config();

class Server {
    private app: Application;
    private port: number;
    private db: PostgresClient;
    private redis: RedisClient;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || '3000');
        this.db = PostgresClient.getInstance();
        this.redis = RedisClient.getInstance();

        this.setupMiddleware();
        this.setupRoutes();
        this.setupHealthCheck();
    }

    private setupMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        const rateLimiter = new RateLimitMiddleware();
        this.app.use(rateLimiter.limit);
    }

    private setupRoutes(): void {
        const apiPrefix = '/api/v1';

        const adController = new AdController();
        const userController = new UserController();
        const messagingController = new MessagingController();
        const searchController = new SearchController();
        this.app.use(apiPrefix, adController.router);
        this.app.use(apiPrefix, userController.router);
        this.app.use(apiPrefix, messagingController.router);
        this.app.use(apiPrefix, searchController.router);


        this.app.use((req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
    }

    private setupHealthCheck(): void {
        this.app.get('/health', async (req, res) => {
            try {
                const dbHealthy = await this.db.healthCheck();
                const redisHealthy = await this.redis.healthCheck();

                const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';
                const statusCode = status === 'healthy' ? 200 : 503;

                res.status(statusCode).json({
                    status,
                    timestamp: new Date().toISOString(),
                    services: {
                        database: dbHealthy ? 'up' : 'down',
                        redis: redisHealthy ? 'up' : 'down',
                    },
                });
            } catch (error) {
                res.status(503).json({
                    status: 'unhealthy',
                    error: 'Health check failed',
                });
            }
        });
    }

    public async start(): Promise<void> {
        try {

            const dbHealthy = await this.db.healthCheck();
            const redisHealthy = await this.redis.healthCheck();

            if (!dbHealthy) {
                throw new Error('Database connection failed');
            }

            if (!redisHealthy) {
                console.warn('Redis connection failed - caching will not work');
            }

            this.app.listen(this.port, () => {
                console.log(`
╔════════════════════════════════════════════╗
║      VendreFacile API Server               ║
╠════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'}
║  Port: ${this.port}
║  Database: ${dbHealthy ? '✓ Connected' : '✗ Failed'}
║  Redis: ${redisHealthy ? '✓ Connected' : '✗ Failed'}
╚════════════════════════════════════════════╝
        `);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    public async stop(): Promise<void> {
        console.log('Shutting down gracefully...');
        await this.db.close();
        await this.redis.close();
        console.log('Server stopped');
    }
}

const server = new Server();
server.start();
process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
});

export default server;
