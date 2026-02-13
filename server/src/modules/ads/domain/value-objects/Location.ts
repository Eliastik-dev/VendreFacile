import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class Location {
    private constructor(
        public readonly city: string,
        public readonly postalCode: string,
        public readonly country: string
    ) { }

    public static create(
        city: string,
        postalCode: string,
        country: string = 'France'
    ): Location {
        if (!city || city.trim().length === 0) {
            throw new ValidationException('City is required');
        }
        if (!postalCode || !/^\d{5}$/.test(postalCode)) {
            throw new ValidationException('Invalid postal code format');
        }
        return new Location(city.trim(), postalCode, country);
    }

    public toString(): string {
        return `${this.city}, ${this.postalCode}, ${this.country}`;
    }
}
