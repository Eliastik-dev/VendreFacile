import { Router, Request, Response } from 'express';
import { SearchAdsUseCase } from '../../application/use-cases/SearchAdsUseCase';
import { SearchQuery } from '../../domain/value-objects/SearchQuery';
import { PostgresSearchRepository } from '../persistence/PostgresSearchRepository';
import { SearchCache } from '../cache/SearchCache';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';
import { RedisClient } from '../../../../shared/infrastructure/cache/RedisClient';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class SearchController {
    public router: Router;
    private searchAdsUseCase: SearchAdsUseCase;

    constructor() {
        this.router = Router();

        const db = PostgresClient.getInstance();
        const redis = RedisClient.getInstance();

        const searchRepository = new PostgresSearchRepository(db);
        const searchCache = new SearchCache(redis);

        this.searchAdsUseCase = new SearchAdsUseCase(searchRepository, searchCache);

        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get('/search', this.search.bind(this));
    }

    private async search(req: Request, res: Response): Promise<void> {
        try {
            const { keyword, category, minPrice, maxPrice, city, page, limit } = req.query;

            const query = SearchQuery.create({
                keyword: keyword as string,
                category: category as string,
                minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
                city: city as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            const result = await this.searchAdsUseCase.execute(query);

            res.status(200).json({
                ads: result.ads.map((ad) => ({
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
                    images: ad.getImages(),
                    createdAt: ad.getCreatedAt(),
                })),
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: unknown, res: Response): void {
        if (error instanceof ValidationException) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
