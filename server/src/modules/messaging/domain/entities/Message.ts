import { v4 as uuidv4 } from 'uuid';

export class Message {
    private constructor(
        private readonly id: string,
        private readonly conversationId: string,
        private readonly senderId: string,
        private readonly receiverId: string,
        private readonly adId: string,
        private readonly content: string,
        private isRead: boolean,
        private readonly createdAt: Date
    ) { }

    public static create(
        conversationId: string,
        senderId: string,
        receiverId: string,
        adId: string,
        content: string
    ): Message {
        return new Message(
            uuidv4(),
            conversationId,
            senderId,
            receiverId,
            adId,
            content,
            false,
            new Date()
        );
    }

    public static reconstituteFromDb(
        id: string,
        conversationId: string,
        senderId: string,
        receiverId: string,
        adId: string,
        content: string,
        isRead: boolean,
        createdAt: Date
    ): Message {
        return new Message(
            id,
            conversationId,
            senderId,
            receiverId,
            adId,
            content,
            isRead,
            createdAt
        );
    }

    public markAsRead(): void {
        this.isRead = true;
    }

    public getId(): string {
        return this.id;
    }

    public getConversationId(): string {
        return this.conversationId;
    }

    public getSenderId(): string {
        return this.senderId;
    }

    public getReceiverId(): string {
        return this.receiverId;
    }

    public getAdId(): string {
        return this.adId;
    }

    public getContent(): string {
        return this.content;
    }

    public getIsRead(): boolean {
        return this.isRead;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}
