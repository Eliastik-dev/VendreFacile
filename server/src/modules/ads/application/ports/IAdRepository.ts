import { Ad } from '../../domain/entities/Ad';
import { AdStatus } from '../../domain/enums/AdStatus';

export interface IAdRepository {
    save(ad: Ad): Promise<void>;
    findById(id: string): Promise<Ad | null>;
    findBySellerId(sellerId: string): Promise<Ad[]>;
    findByStatus(status: AdStatus): Promise<Ad[]>;
    delete(id: string): Promise<void>;
}
