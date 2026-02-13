import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class Email {
    private constructor(public readonly value: string) { }

    public static create(email: string): Email {
        const trimmed = email.trim().toLowerCase();

        if (!trimmed) {
            throw new ValidationException('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            throw new ValidationException('Invalid email format');
        }

        return new Email(trimmed);
    }

    public equals(other: Email): boolean {
        return this.value === other.value;
    }
}
