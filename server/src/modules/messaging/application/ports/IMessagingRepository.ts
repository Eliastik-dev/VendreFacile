import { Message } from '../entities/Message';
import { Conversation } from '../entities/Conversation';

export interface IMessagingRepository {
    saveConversation(conversation: Conversation): Promise<void>;
    saveMessage(message: Message): Promise<void>;
    findConversationByParticipants(
        adId: string,
        buyerId: string,
        sellerId: string
    ): Promise<Conversation | null>;
    findConversationsByUserId(userId: string): Promise<Conversation[]>;
    findMessagesByConversationId(conversationId: string): Promise<Message[]>;
}
