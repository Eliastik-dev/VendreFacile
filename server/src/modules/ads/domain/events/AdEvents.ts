export interface DomainEvent {
    occurredAt: Date;
    aggregateId: string;
}

export class AdPublished implements DomainEvent {
    public readonly occurredAt: Date;

    constructor(
        public readonly aggregateId: string,
        public readonly title: string,
        public readonly sellerId: string
    ) {
        this.occurredAt = new Date();
    }
}

export class AdSold implements DomainEvent {
    public readonly occurredAt: Date;

    constructor(
        public readonly aggregateId: string,
        public readonly title: string,
        public readonly sellerId: string
    ) {
        this.occurredAt = new Date();
    }
}
