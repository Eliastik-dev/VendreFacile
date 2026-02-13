import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class SearchQuery {
    private constructor(
        public readonly keyword?: string,
        public readonly category?: string,
        public readonly minPrice?: number,
        public readonly maxPrice?: number,
        public readonly city?: string,
        public readonly page: number = 1,
        public readonly limit: number = 20
    ) { }

    public static create(params: {
        keyword?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        city?: string;
        page?: number;
        limit?: number;
    }): SearchQuery {
        const page = params.page && params.page > 0 ? params.page : 1;
        const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20;

        if (params.minPrice && params.minPrice < 0) {
            throw new ValidationException('Minimum price cannot be negative');
        }

        if (params.maxPrice && params.maxPrice < 0) {
            throw new ValidationException('Maximum price cannot be negative');
        }

        if (params.minPrice && params.maxPrice && params.minPrice > params.maxPrice) {
            throw new ValidationException('Minimum price cannot be greater than maximum price');
        }

        return new SearchQuery(
            params.keyword,
            params.category,
            params.minPrice,
            params.maxPrice,
            params.city,
            page,
            limit
        );
    }

    public toCacheKey(): string {
        const parts = [
            this.keyword || '',
            this.category || '',
            this.minPrice?.toString() || '',
            this.maxPrice?.toString() || '',
            this.city || '',
            this.page.toString(),
            this.limit.toString(),
        ];
        return `search:${parts.join(':')}`;
    }
}
