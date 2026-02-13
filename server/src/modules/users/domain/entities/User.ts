import { v4 as uuidv4 } from 'uuid';
import { Email } from '../value-objects/Email';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface UserProps {
    id?: string;
    email: Email;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    private readonly id: string;
    private email: Email;
    private passwordHash: string;
    private firstName: string;
    private lastName: string;
    private phone?: string;
    private role: UserRole;
    private readonly createdAt: Date;
    private updatedAt: Date;

    private constructor(props: UserProps) {
        this.id = props.id || uuidv4();
        this.email = props.email;
        this.passwordHash = props.passwordHash;
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.phone = props.phone;
        this.role = props.role || UserRole.USER;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }

    public static create(props: UserProps): User {
        User.validateName(props.firstName, 'First name');
        User.validateName(props.lastName, 'Last name');
        return new User(props);
    }

    public static reconstituteFromDb(props: Required<Omit<UserProps, 'phone'>> & { phone?: string }): User {
        return new User(props);
    }

    private static validateName(name: string, fieldName: string): void {
        if (!name || name.trim().length < 2) {
            throw new ValidationException(`${fieldName} must be at least 2 characters`);
        }
        if (name.length > 50) {
            throw new ValidationException(`${fieldName} cannot exceed 50 characters`);
        }
    }

    public updateProfile(updates: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): void {
        if (updates.firstName) {
            User.validateName(updates.firstName, 'First name');
            this.firstName = updates.firstName;
        }
        if (updates.lastName) {
            User.validateName(updates.lastName, 'Last name');
            this.lastName = updates.lastName;
        }
        if (updates.phone !== undefined) {
            this.phone = updates.phone;
        }
        this.updatedAt = new Date();
    }

    public updatePassword(newPasswordHash: string): void {
        this.passwordHash = newPasswordHash;
        this.updatedAt = new Date();
    }

    public getId(): string {
        return this.id;
    }

    public getEmail(): Email {
        return this.email;
    }

    public getPasswordHash(): string {
        return this.passwordHash;
    }

    public getFirstName(): string {
        return this.firstName;
    }

    public getLastName(): string {
        return this.lastName;
    }

    public getPhone(): string | undefined {
        return this.phone;
    }

    public getRole(): UserRole {
        return this.role;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public isAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }
}
