import { IAdRepository } from '../ports/IAdRepository';
import { Ad } from '../../domain/entities/Ad';
import { AdStatus } from '../../domain/enums/AdStatus';

export class GetAdsUseCase {
    constructor(private adRepository: IAdRepository) { }

    public async execute(filters?: {
        sellerId?: string;
        status?: AdStatus;
    }): Promise<Ad[]> {
        if (filters?.sellerId) {
            return await this.adRepository.findBySellerId(filters.sellerId);
        }

        if (filters?.status) {
            return await this.adRepository.findByStatus(filters.status);
        }

        return await this.adRepository.findByStatus(AdStatus.PUBLISHED);
    }
}
