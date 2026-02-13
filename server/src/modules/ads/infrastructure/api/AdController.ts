import { Router, Request, Response } from 'express';
import { CreateAdUseCase } from '../../application/use-cases/CreateAdUseCase';
import { PublishAdUseCase } from '../../application/use-cases/PublishAdUseCase';
import { MarkAdAsSoldUseCase } from '../../application/use-cases/MarkAdAsSoldUseCase';
import { GetAdsUseCase } from '../../application/use-cases/GetAdsUseCase';
import { PostgresAdRepository } from '../persistence/PostgresAdRepository';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';
import { AuthenticatedRequest, AuthMiddleware } from '../../../../shared/infrastructure/middleware/AuthMiddleware';
import {
    ValidationException,
    AuthorizationException,
    NotFoundException,
} from '../../../../shared/domain/exceptions/DomainException';

export class AdController {
    public router: Router;
    private createAdUseCase: CreateAdUseCase;
    private publishAdUseCase: PublishAdUseCase;
    private markAdAsSoldUseCase: MarkAdAsSoldUseCase;
    private getAdsUseCase: GetAdsUseCase;
    private authMiddleware: AuthMiddleware;

    constructor() {
        this.router = Router();
        this.authMiddleware = new AuthMiddleware();


        const db = PostgresClient.getInstance();
        const adRepository = new PostgresAdRepository(db);
        this.createAdUseCase = new CreateAdUseCase(adRepository);
        this.publishAdUseCase = new PublishAdUseCase(adRepository);
        this.markAdAsSoldUseCase = new MarkAdAsSoldUseCase(adRepository);
        this.getAdsUseCase = new GetAdsUseCase(adRepository);

        this.setupRoutes();
    }

    private setupRoutes(): void {

        this.router.get('/ads', this.getAds.bind(this));
        this.router.get('/ads/:id', this.getAdById.bind(this));


        this.router.post('/ads', this.authMiddleware.authenticate, this.createAd.bind(this));
        this.router.patch('/ads/:id/publish', this.authMiddleware.authenticate, this.publishAd.bind(this));
        this.router.patch('/ads/:id/sold', this.authMiddleware.authenticate, this.markAsSold.bind(this));
    }

    private async createAd(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { title, description, price, currency, city, postalCode, category, images } = req.body;

            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const ad = await this.createAdUseCase.execute({
                title,
                description,
                price,
                currency,
                city,
                postalCode,
                category,
                sellerId: req.user.userId,
                images,
            });

            res.status(201).json({
                id: ad.getId(),
                title: ad.getTitle(),
                description: ad.getDescription(),
                price: {
                    amount: ad.getPrice().amount,
                    currency: ad.getPrice().currency,
                },
                location: {
                    city: ad.getLocation().city,
                    postalCode: ad.getLocation().postalCode,
                    country: ad.getLocation().country,
                },
                category: ad.getCategory(),
                status: ad.getStatus(),
                images: ad.getImages(),
                createdAt: ad.getCreatedAt(),
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async publishAd(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.publishAdUseCase.execute(id);
            res.status(200).json({ message: 'Ad published successfully' });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async markAsSold(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            await this.markAdAsSoldUseCase.execute(id, req.user.userId);
            res.status(200).json({ message: 'Ad marked as sold' });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async getAds(req: Request, res: Response): Promise<void> {
        try {
            const { sellerId, status } = req.query;
            const ads = await this.getAdsUseCase.execute({
                sellerId: sellerId as string,
                status: status as any,
            });

            res.status(200).json(
                ads.map((ad) => ({
                    id: ad.getId(),
                    title: ad.getTitle(),
                    description: ad.getDescription(),
                    price: {
                        amount: ad.getPrice().amount,
                        currency: ad.getPrice().currency,
                    },
                    location: {
                        city: ad.getLocation().city,
                        postalCode: ad.getLocation().postalCode,
                    },
                    category: ad.getCategory(),
                    status: ad.getStatus(),
                    images: ad.getImages(),
                    createdAt: ad.getCreatedAt(),
                }))
            );
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async getAdById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const db = PostgresClient.getInstance();
            const repository = new PostgresAdRepository(db);
            const ad = await repository.findById(id);

            if (!ad) {
                res.status(404).json({ error: 'Ad not found' });
                return;
            }

            res.status(200).json({
                id: ad.getId(),
                title: ad.getTitle(),
                description: ad.getDescription(),
                price: {
                    amount: ad.getPrice().amount,
                    currency: ad.getPrice().currency,
                },
                location: {
                    city: ad.getLocation().city,
                    postalCode: ad.getLocation().postalCode,
                    country: ad.getLocation().country,
                },
                category: ad.getCategory(),
                sellerId: ad.getSellerId(),
                status: ad.getStatus(),
                images: ad.getImages(),
                createdAt: ad.getCreatedAt(),
                updatedAt: ad.getUpdatedAt(),
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: unknown, res: Response): void {
        if (error instanceof ValidationException) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof AuthorizationException) {
            res.status(403).json({ error: error.message });
        } else if (error instanceof NotFoundException) {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
