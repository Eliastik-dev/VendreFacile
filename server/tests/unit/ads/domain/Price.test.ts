import { Price } from '../../../src/modules/ads/domain/value-objects/Price';
import { ValidationException } from '../../../src/shared/domain/exceptions/DomainException';

describe('Price Value Object', () => {
    describe('Creation', () => {
        it('should create a valid price', () => {
            const price = Price.create(99.99, 'EUR');

            expect(price.amount).toBe(99.99);
            expect(price.currency).toBe('EUR');
        });

        it('should use EUR as default currency', () => {
            const price = Price.create(50);

            expect(price.currency).toBe('EUR');
        });

        it('should reject negative amounts', () => {
            expect(() => {
                Price.create(-10, 'EUR');
            }).toThrow(ValidationException);
        });

        it('should reject amounts exceeding maximum', () => {
            expect(() => {
                Price.create(1000001, 'EUR');
            }).toThrow(ValidationException);
        });

        it('should reject invalid currency', () => {
            expect(() => {
                Price.create(100, 'XYZ');
            }).toThrow(ValidationException);
        });

        it('should accept valid currencies', () => {
            expect(() => Price.create(100, 'EUR')).not.toThrow();
            expect(() => Price.create(100, 'USD')).not.toThrow();
            expect(() => Price.create(100, 'GBP')).not.toThrow();
        });
    });

    describe('Equality', () => {
        it('should be equal when amount and currency match', () => {
            const price1 = Price.create(100, 'EUR');
            const price2 = Price.create(100, 'EUR');

            expect(price1.equals(price2)).toBe(true);
        });

        it('should not be equal when amounts differ', () => {
            const price1 = Price.create(100, 'EUR');
            const price2 = Price.create(200, 'EUR');

            expect(price1.equals(price2)).toBe(false);
        });

        it('should not be equal when currencies differ', () => {
            const price1 = Price.create(100, 'EUR');
            const price2 = Price.create(100, 'USD');

            expect(price1.equals(price2)).toBe(false);
        });
    });

    describe('String representation', () => {
        it('should format as "amount currency"', () => {
            const price = Price.create(99.99, 'EUR');

            expect(price.toString()).toBe('99.99 EUR');
        });
    });
});
