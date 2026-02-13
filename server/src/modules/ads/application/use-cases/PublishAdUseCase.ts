import { IAdRepository } from '../ports/IAdRepository';
import { NotFoundException } from '../../../../shared/domain/exceptions/DomainException';

export class PublishAdUseCase {
    constructor(private adRepository: IAdRepository) { }

    public async execute(adId: string): Promise<void> {
        const ad = await this.adRepository.findById(adId);
        if (!ad) {
            throw new NotFoundException('Ad', adId);
        }


        ad.publish();

        await this.adRepository.save(ad);

        const events = ad.getDomainEvents();
        ad.clearDomainEvents();
        console.log('Ad published:', events);
    }
}
