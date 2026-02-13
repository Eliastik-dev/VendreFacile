import { Ad } from '@/modules/ads/domain/entities/Ad';
import { Price } from '@/modules/ads/domain/value-objects/Price';
import { Location } from '@/modules/ads/domain/value-objects/Location';
import { AdStatus } from '@/modules/ads/domain/enums/AdStatus';
import {
    ValidationException,
    AuthorizationException,
} from '@/shared/domain/exceptions/DomainException';

describe('Ad Domain Entity', () => {
    const validProps = {
        title: 'iPhone 14 Pro Max',
        description: 'Excellent condition, barely used. Comes with original box and accessories.',
        price: Price.create(899, 'EUR'),
        location: Location.create('Paris', '75001'),
        category: 'electronics',
        sellerId: 'seller-123',
    };

    describe('Creation', () => {
        it('should create a valid ad', () => {
            const ad = Ad.create(validProps);

            expect(ad.getTitle()).toBe(validProps.title);
            expect(ad.getDescription()).toBe(validProps.description);
            expect(ad.getPrice()).toBe(validProps.price);
            expect(ad.getCategory()).toBe(validProps.category);
            expect(ad.getStatus()).toBe(AdStatus.DRAFT);
        });

        it('should reject title shorter than 5 characters', () => {
            expect(() => {
                Ad.create({ ...validProps, title: 'ABC' });
            }).toThrow(ValidationException);
        });

        it('should reject title longer than 100 characters', () => {
            const longTitle = 'A'.repeat(101);
            expect(() => {
                Ad.create({ ...validProps, title: longTitle });
            }).toThrow(ValidationException);
        });

        it('should reject description shorter than 20 characters', () => {
            expect(() => {
                Ad.create({ ...validProps, description: 'Too short' });
            }).toThrow(ValidationException);
        });

        it('should reject invalid category', () => {
            expect(() => {
                Ad.create({ ...validProps, category: 'invalid' });
            }).toThrow(ValidationException);
        });
    });

    describe('Publishing', () => {
        it('should allow publishing a draft ad', () => {
            const ad = Ad.create(validProps);
            ad.publish();

            expect(ad.getStatus()).toBe(AdStatus.PUBLISHED);
            expect(ad.getDomainEvents().length).toBe(1);
            expect(ad.getDomainEvents()[0]).toHaveProperty('aggregateId', ad.getId());
        });

        it('should reject publishing an already published ad', () => {
            const ad = Ad.create(validProps);
            ad.publish();

            expect(() => {
                ad.publish();
            }).toThrow(ValidationException);
        });
    });

    describe('Marking as Sold', () => {
        it('should allow seller to mark published ad as sold', () => {
            const ad = Ad.create(validProps);
            ad.publish();
            ad.markAsSold(validProps.sellerId);

            expect(ad.getStatus()).toBe(AdStatus.SOLD);
            expect(ad.getDomainEvents().length).toBe(2);
        });

        it('should reject marking draft ad as sold', () => {
            const ad = Ad.create(validProps);

            expect(() => {
                ad.markAsSold(validProps.sellerId);
            }).toThrow(ValidationException);
        });

        it('should reject non-seller marking ad as sold', () => {
            const ad = Ad.create(validProps);
            ad.publish();

            expect(() => {
                ad.markAsSold('different-user-id');
            }).toThrow(AuthorizationException);
        });
    });

    describe('Updating', () => {
        it('should allow seller to update draft ad', () => {
            const ad = Ad.create(validProps);
            const newPrice = Price.create(799, 'EUR');

            ad.update(validProps.sellerId, { price: newPrice });

            expect(ad.getPrice()).toBe(newPrice);
        });

        it('should allow seller to update published ad', () => {
            const ad = Ad.create(validProps);
            ad.publish();

            const newTitle = 'iPhone 14 Pro Max - Price Reduced';
            ad.update(validProps.sellerId, { title: newTitle });

            expect(ad.getTitle()).toBe(newTitle);
        });

        it('should reject updating sold ad', () => {
            const ad = Ad.create(validProps);
            ad.publish();
            ad.markAsSold(validProps.sellerId);

            expect(() => {
                ad.update(validProps.sellerId, { title: 'New title' });
            }).toThrow(ValidationException);
        });

        it('should reject non-seller updating ad', () => {
            const ad = Ad.create(validProps);

            expect(() => {
                ad.update('different-user-id', { title: 'Hacked title' });
            }).toThrow(AuthorizationException);
        });
    });

    describe('Domain Events', () => {
        it('should accumulate domain events', () => {
            const ad = Ad.create(validProps);
            expect(ad.getDomainEvents().length).toBe(0);

            ad.publish();
            expect(ad.getDomainEvents().length).toBe(1);

            ad.markAsSold(validProps.sellerId);
            expect(ad.getDomainEvents().length).toBe(2);
        });

        it('should clear domain events', () => {
            const ad = Ad.create(validProps);
            ad.publish();

            expect(ad.getDomainEvents().length).toBe(1);
            ad.clearDomainEvents();
            expect(ad.getDomainEvents().length).toBe(0);
        });
    });
});
