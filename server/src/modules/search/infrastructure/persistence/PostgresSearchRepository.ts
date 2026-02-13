import { ISearchRepository } from '../../application/ports/ISearchRepository';
import { Ad } from '../../../ads/domain/entities/Ad';
import { AdStatus } from '../../../ads/domain/enums/AdStatus';
import { SearchQuery } from '../../domain/value-objects/SearchQuery';
import { Price } from '../../../ads/domain/value-objects/Price';
import { Location } from '../../../ads/domain/value-objects/Location';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';

interface AdRow {
    id: string;
    title: string;
    description: string;
    price_amount: string;
    price_currency: string;
    city: string;
    postal_code: string;
    country: string;
    category: string;
    seller_id: string;
    status: AdStatus;
    images: string[] | null;
    created_at: Date;
    updated_at: Date;
}

export class PostgresSearchRepository implements ISearchRepository {
    constructor(private db: PostgresClient) { }

    public async search(query: SearchQuery): Promise<Ad[]> {
        const { sql, params } = this.buildSearchQuery(query, true);
        const result = await this.db.query<AdRow>(sql, params);
        return result.rows.map((row) => this.mapRowToAd(row));
    }

    public async count(query: SearchQuery): Promise<number> {
        const { sql, params } = this.buildSearchQuery(query, false);
        const result = await this.db.query<{ count: string }>(sql, params);
        return parseInt(result.rows[0].count);
    }

    private buildSearchQuery(
        query: SearchQuery,
        withPagination: boolean
    ): { sql: string; params: any[] } {
        const conditions: string[] = ['status = $1'];
        const params: any[] = [AdStatus.PUBLISHED];
        let paramIndex = 2;


        if (query.keyword) {
            conditions.push(
                `to_tsvector('french', title || ' ' || description) @@ plainto_tsquery('french', $${paramIndex})`
            );
            params.push(query.keyword);
            paramIndex++;
        }


        if (query.category) {
            conditions.push(`category = $${paramIndex}`);
            params.push(query.category);
            paramIndex++;
        }


        if (query.minPrice !== undefined) {
            conditions.push(`price_amount >= $${paramIndex}`);
            params.push(query.minPrice);
            paramIndex++;
        }

        if (query.maxPrice !== undefined) {
            conditions.push(`price_amount <= $${paramIndex}`);
            params.push(query.maxPrice);
            paramIndex++;
        }


        if (query.city) {
            conditions.push(`LOWER(city) = LOWER($${paramIndex})`);
            params.push(query.city);
            paramIndex++;
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        if (withPagination) {
            const offset = (query.page - 1) * query.limit;
            const sql = `
        SELECT * FROM ads
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
            params.push(query.limit, offset);
            return { sql, params };
        } else {
            const sql = `
        SELECT COUNT(*) as count FROM ads
        ${whereClause}
      `;
            return { sql, params };
        }
    }

    private mapRowToAd(row: AdRow): Ad {
        const price = Price.create(parseFloat(row.price_amount), row.price_currency);
        const location = Location.create(row.city, row.postal_code, row.country);

        return Ad.reconstituteFromDb({
            id: row.id,
            title: row.title,
            description: row.description,
            price,
            location,
            category: row.category,
            sellerId: row.seller_id,
            status: row.status,
            images: row.images || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}
