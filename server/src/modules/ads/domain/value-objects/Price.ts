import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class Price {
    private constructor(
        public readonly amount: number,
        public readonly currency: string
    ) { }

    public static create(amount: number, currency: string = 'EUR'): Price {
        if (amount < 0) {
            throw new ValidationException('Price amount cannot be negative');
        }
        if (amount > 1000000) {
            throw new ValidationException('Price amount cannot exceed 1,000,000');
        }
        if (!['EUR', 'USD', 'GBP'].includes(currency)) {
            throw new ValidationException('Invalid currency');
        }
        return new Price(amount, currency);
    }

    public equals(other: Price): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    public toString(): string {
        return `${this.amount} ${this.currency}`;
    }
}
