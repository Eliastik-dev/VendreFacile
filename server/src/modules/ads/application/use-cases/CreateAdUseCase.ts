import { Ad } from '../../domain/entities/Ad';
import { Price } from '../../domain/value-objects/Price';
import { Location } from '../../domain/value-objects/Location';
import { IAdRepository } from '../ports/IAdRepository';

export interface CreateAdDto {
    title: string;
    description: string;
    price: number;
    currency?: string;
    city: string;
    postalCode: string;
    category: string;
    sellerId: string;
    images?: string[];
}

export class CreateAdUseCase {
    constructor(private adRepository: IAdRepository) { }

    public async execute(dto: CreateAdDto): Promise<Ad> {
        // Create value objects
        const price = Price.create(dto.price, dto.currency);
        const location = Location.create(dto.city, dto.postalCode);

        // Create Ad aggregate
        const ad = Ad.create({
            title: dto.title,
            description: dto.description,
            price,
            location,
            category: dto.category,
            sellerId: dto.sellerId,
            images: dto.images,
        });

        await this.adRepository.save(ad);

        return ad;
    }
}
