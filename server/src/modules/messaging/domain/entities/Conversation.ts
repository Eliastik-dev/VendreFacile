import { v4 as uuidv4 } from 'uuid';

export class Conversation {
    private constructor(
        private readonly id: string,
        private readonly adId: string,
        private readonly buyerId: string,
        private readonly sellerId: string,
        private lastMessageAt: Date,
        private readonly createdAt: Date
    ) { }

    public static create(
        adId: string,
        buyerId: string,
        sellerId: string
    ): Conversation {
        const now = new Date();
        return new Conversation(uuidv4(), adId, buyerId, sellerId, now, now);
    }

    public static reconstituteFromDb(
        id: string,
        adId: string,
        buyerId: string,
        sellerId: string,
        lastMessageAt: Date,
        createdAt: Date
    ): Conversation {
        return new Conversation(
            id,
            adId,
            buyerId,
            sellerId,
            lastMessageAt,
            createdAt
        );
    }

    public updateLastMessageTime(): void {
        this.lastMessageAt = new Date();
    }

    public getId(): string {
        return this.id;
    }

    public getAdId(): string {
        return this.adId;
    }

    public getBuyerId(): string {
        return this.buyerId;
    }

    public getSellerId(): string {
        return this.sellerId;
    }

    public getLastMessageAt(): Date {
        return this.lastMessageAt;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}
