import { Ad } from '../../../ads/domain/entities/Ad';
import { SearchQuery } from '../../domain/value-objects/SearchQuery';
import { ISearchRepository } from '../ports/ISearchRepository';
import { SearchCache } from '../../infrastructure/cache/SearchCache';

export interface SearchResultDto {
    ads: Ad[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class SearchAdsUseCase {
    constructor(
        private searchRepository: ISearchRepository,
        private searchCache: SearchCache
    ) { }

    public async execute(query: SearchQuery): Promise<SearchResultDto> {
        const startTime = Date.now();


        const cacheKey = query.toCacheKey();
        const cachedResult = await this.searchCache.get<SearchResultDto>(cacheKey);

        if (cachedResult) {
            const duration = Date.now() - startTime;
            console.log(`Search cache HIT: ${duration}ms`);
            return cachedResult;
        }


        const [ads, total] = await Promise.all([
            this.searchRepository.search(query),
            this.searchRepository.count(query),
        ]);

        const result: SearchResultDto = {
            ads,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };


        await this.searchCache.set(cacheKey, result);

        const duration = Date.now() - startTime;
        console.log(`Search executed: ${duration}ms`);

        return result;
    }
}
