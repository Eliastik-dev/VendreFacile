import { IAdRepository } from '../../application/ports/IAdRepository';
import { Ad } from '../../domain/entities/Ad';
import { AdStatus } from '../../domain/enums/AdStatus';
import { Price } from '../../domain/value-objects/Price';
import { Location } from '../../domain/value-objects/Location';
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

export class PostgresAdRepository implements IAdRepository {
    constructor(private db: PostgresClient) { }

    public async save(ad: Ad): Promise<void> {
        const query = `
      INSERT INTO ads (
        id, title, description, price_amount, price_currency,
        city, postal_code, country, category, seller_id,
        status, images, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price_amount = EXCLUDED.price_amount,
        price_currency = EXCLUDED.price_currency,
        city = EXCLUDED.city,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        status = EXCLUDED.status,
        images = EXCLUDED.images,
        updated_at = EXCLUDED.updated_at
    `;

        const params = [
            ad.getId(),
            ad.getTitle(),
            ad.getDescription(),
            ad.getPrice().amount,
            ad.getPrice().currency,
            ad.getLocation().city,
            ad.getLocation().postalCode,
            ad.getLocation().country,
            ad.getCategory(),
            ad.getSellerId(),
            ad.getStatus(),
            ad.getImages(),
            ad.getCreatedAt(),
            ad.getUpdatedAt(),
        ];

        await this.db.query(query, params);
    }

    public async findById(id: string): Promise<Ad | null> {
        const query = 'SELECT * FROM ads WHERE id = $1';
        const result = await this.db.query<AdRow>(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToAd(result.rows[0]);
    }

    public async findBySellerId(sellerId: string): Promise<Ad[]> {
        const query = 'SELECT * FROM ads WHERE seller_id = $1 ORDER BY created_at DESC';
        const result = await this.db.query<AdRow>(query, [sellerId]);
        return result.rows.map((row) => this.mapRowToAd(row));
    }

    public async findByStatus(status: AdStatus): Promise<Ad[]> {
        const query = 'SELECT * FROM ads WHERE status = $1 ORDER BY created_at DESC LIMIT 100';
        const result = await this.db.query<AdRow>(query, [status]);
        return result.rows.map((row) => this.mapRowToAd(row));
    }

    public async delete(id: string): Promise<void> {
        const query = 'DELETE FROM ads WHERE id = $1';
        await this.db.query(query, [id]);
    }

    private mapRowToAd(row: AdRow): Ad {
        const price = Price.create(
            parseFloat(row.price_amount),
            row.price_currency
        );
        const location = Location.create(
            row.city,
            row.postal_code,
            row.country
        );

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
