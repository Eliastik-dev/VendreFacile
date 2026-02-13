import { v4 as uuidv4 } from 'uuid';
import { AdStatus } from '../enums/AdStatus';
import { Price } from '../value-objects/Price';
import { Location } from '../value-objects/Location';
import { DomainEvent, AdPublished, AdSold } from '../events/AdEvents';
import {
    ValidationException,
    AuthorizationException,
} from '../../../../shared/domain/exceptions/DomainException';

export interface AdProps {
    id?: string;
    title: string;
    description: string;
    price: Price;
    location: Location;
    category: string;
    sellerId: string;
    status?: AdStatus;
    images?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class Ad {
    private readonly id: string;
    private title: string;
    private description: string;
    private price: Price;
    private location: Location;
    private category: string;
    private readonly sellerId: string;
    private status: AdStatus;
    private images: string[];
    private readonly createdAt: Date;
    private updatedAt: Date;
    private domainEvents: DomainEvent[] = [];

    private constructor(props: AdProps) {
        this.id = props.id || uuidv4();
        this.title = props.title;
        this.description = props.description;
        this.price = props.price;
        this.location = props.location;
        this.category = props.category;
        this.sellerId = props.sellerId;
        this.status = props.status || AdStatus.DRAFT;
        this.images = props.images || [];
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }

    public static create(props: AdProps): Ad {
        this.validateTitle(props.title);
        this.validateDescription(props.description);
        this.validateCategory(props.category);
        return new Ad(props);
    }

    public static reconstituteFromDb(props: Required<AdProps>): Ad {
        return new Ad(props);
    }


    public publish(): void {
        if (this.status !== AdStatus.DRAFT) {
            throw new ValidationException('Only draft ads can be published');
        }
        this.status = AdStatus.PUBLISHED;
        this.updatedAt = new Date();
        this.domainEvents.push(
            new AdPublished(this.id, this.title, this.sellerId)
        );
    }


    public markAsSold(userId: string): void {
        this.ensureOwnership(userId);
        if (this.status !== AdStatus.PUBLISHED) {
            throw new ValidationException('Only published ads can be marked as sold');
        }
        this.status = AdStatus.SOLD;
        this.updatedAt = new Date();
        this.domainEvents.push(new AdSold(this.id, this.title, this.sellerId));
    }


    public update(
        userId: string,
        updates: {
            title?: string;
            description?: string;
            price?: Price;
            location?: Location;
            images?: string[];
        }
    ): void {
        this.ensureOwnership(userId);
        if (this.status === AdStatus.SOLD) {
            throw new ValidationException('Cannot update sold ads');
        }

        if (updates.title) {
            Ad.validateTitle(updates.title);
            this.title = updates.title;
        }
        if (updates.description) {
            Ad.validateDescription(updates.description);
            this.description = updates.description;
        }
        if (updates.price) {
            this.price = updates.price;
        }
        if (updates.location) {
            this.location = updates.location;
        }
        if (updates.images) {
            this.images = updates.images;
        }

        this.updatedAt = new Date();
    }


    private ensureOwnership(userId: string): void {
        if (this.sellerId !== userId) {
            throw new AuthorizationException('Only the seller can perform this action');
        }
    }

    private static validateTitle(title: string): void {
        if (!title || title.trim().length < 5) {
            throw new ValidationException('Title must be at least 5 characters');
        }
        if (title.length > 100) {
            throw new ValidationException('Title cannot exceed 100 characters');
        }
    }

    private static validateDescription(description: string): void {
        if (!description || description.trim().length < 20) {
            throw new ValidationException('Description must be at least 20 characters');
        }
        if (description.length > 2000) {
            throw new ValidationException('Description cannot exceed 2000 characters');
        }
    }

    private static validateCategory(category: string): void {
        const validCategories = [
            'electronics',
            'clothing',
            'home',
            'vehicles',
            'books',
            'sports',
            'other',
        ];
        if (!validCategories.includes(category)) {
            throw new ValidationException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }
    }


    public getId(): string {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public getPrice(): Price {
        return this.price;
    }

    public getLocation(): Location {
        return this.location;
    }

    public getCategory(): string {
        return this.category;
    }

    public getSellerId(): string {
        return this.sellerId;
    }

    public getStatus(): AdStatus {
        return this.status;
    }

    public getImages(): string[] {
        return [...this.images];
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public getDomainEvents(): DomainEvent[] {
        return [...this.domainEvents];
    }

    public clearDomainEvents(): void {
        this.domainEvents = [];
    }
}
