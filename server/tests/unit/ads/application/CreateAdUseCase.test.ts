import { CreateAdUseCase } from '@/modules/ads/application/use-cases/CreateAdUseCase';
import { IAdRepository } from '@/modules/ads/application/ports/IAdRepository';
import { Ad } from '@/modules/ads/domain/entities/Ad';
import { ValidationException } from '@/shared/domain/exceptions/DomainException';

// Mock repository
class MockAdRepository implements IAdRepository {
    private ads: Map<string, Ad> = new Map();

    async save(ad: Ad): Promise<void> {
        this.ads.set(ad.getId(), ad);
    }

    async findById(id: string): Promise<Ad | null> {
        return this.ads.get(id) || null;
    }

    async findBySellerId(sellerId: string): Promise<Ad[]> {
        return Array.from(this.ads.values()).filter(
            (ad) => ad.getSellerId() === sellerId
        );
    }

    async findByStatus(status: any): Promise<Ad[]> {
        return Array.from(this.ads.values()).filter(
            (ad) => ad.getStatus() === status
        );
    }

    async delete(id: string): Promise<void> {
        this.ads.delete(id);
    }
}

describe('CreateAdUseCase', () => {
    let useCase: CreateAdUseCase;
    let mockRepository: MockAdRepository;

    beforeEach(() => {
        mockRepository = new MockAdRepository();
        useCase = new CreateAdUseCase(mockRepository);
    });

    it('should create an ad with valid data', async () => {
        const dto = {
            title: 'Gaming Laptop',
            description: 'High performance gaming laptop with RTX 4080 graphics card',
            price: 1500,
            currency: 'EUR',
            city: 'Paris',
            postalCode: '75001',
            category: 'electronics',
            sellerId: 'user-123',
            images: ['image1.jpg', 'image2.jpg'],
        };

        const ad = await useCase.execute(dto);

        expect(ad.getTitle()).toBe(dto.title);
        expect(ad.getDescription()).toBe(dto.description);
        expect(ad.getPrice().amount).toBe(dto.price);
        expect(ad.getCategory()).toBe(dto.category);
        expect(ad.getSellerId()).toBe(dto.sellerId);
    });

    it('should save the ad to the repository', async () => {
        const dto = {
            title: 'Test Product',
            description: 'This is a test product with sufficient description',
            price: 100,
            city: 'Lyon',
            postalCode: '69001',
            category: 'other',
            sellerId: 'seller-456',
        };

        const ad = await useCase.execute(dto);
        const savedAd = await mockRepository.findById(ad.getId());

        expect(savedAd).not.toBeNull();
        expect(savedAd?.getId()).toBe(ad.getId());
    });

    it('should reject invalid price', async () => {
        const dto = {
            title: 'Invalid Ad',
            description: 'This ad has an invalid price value',
            price: -100,
            city: 'Paris',
            postalCode: '75001',
            category: 'electronics',
            sellerId: 'user-123',
        };

        await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should reject invalid category', async () => {
        const dto = {
            title: 'Invalid Category',
            description: 'This ad has an invalid category',
            price: 100,
            city: 'Paris',
            postalCode: '75001',
            category: 'invalid-category',
            sellerId: 'user-123',
        };

        await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should reject short title', async () => {
        const dto = {
            title: 'Hi',
            description: 'This ad has a title that is too short',
            price: 100,
            city: 'Paris',
            postalCode: '75001',
            category: 'other',
            sellerId: 'user-123',
        };

        await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });
});
