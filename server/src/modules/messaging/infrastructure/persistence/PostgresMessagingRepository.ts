import { IMessagingRepository } from '../../application/ports/IMessagingRepository';
import { Message } from '../../domain/entities/Message';
import { Conversation } from '../../domain/entities/Conversation';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';

interface MessageRow {
    id: string;
    conversation_id: string;
    sender_id: string;
    receiver_id: string;
    ad_id: string;
    content: string;
    is_read: boolean;
    created_at: Date;
}

interface ConversationRow {
    id: string;
    ad_id: string;
    buyer_id: string;
    seller_id: string;
    last_message_at: Date;
    created_at: Date;
}

export class PostgresMessagingRepository implements IMessagingRepository {
    constructor(private db: PostgresClient) { }

    public async saveConversation(conversation: Conversation): Promise<void> {
        const query = `
      INSERT INTO conversations (id, ad_id, buyer_id, seller_id, last_message_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        last_message_at = EXCLUDED.last_message_at
    `;

        await this.db.query(query, [
            conversation.getId(),
            conversation.getAdId(),
            conversation.getBuyerId(),
            conversation.getSellerId(),
            conversation.getLastMessageAt(),
            conversation.getCreatedAt(),
        ]);
    }

    public async saveMessage(message: Message): Promise<void> {
        const query = `
      INSERT INTO messages (id, conversation_id, sender_id, receiver_id, ad_id, content, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

        await this.db.query(query, [
            message.getId(),
            message.getConversationId(),
            message.getSenderId(),
            message.getReceiverId(),
            message.getAdId(),
            message.getContent(),
            message.getIsRead(),
            message.getCreatedAt(),
        ]);
    }

    public async findConversationByParticipants(
        adId: string,
        buyerId: string,
        sellerId: string
    ): Promise<Conversation | null> {
        const query = `
      SELECT * FROM conversations 
      WHERE ad_id = $1 AND buyer_id = $2 AND seller_id = $3
    `;

        const result = await this.db.query<ConversationRow>(query, [
            adId,
            buyerId,
            sellerId,
        ]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return Conversation.reconstituteFromDb(
            row.id,
            row.ad_id,
            row.buyer_id,
            row.seller_id,
            row.last_message_at,
            row.created_at
        );
    }

    public async findConversationsByUserId(userId: string): Promise<Conversation[]> {
        const query = `
      SELECT * FROM conversations 
      WHERE buyer_id = $1 OR seller_id = $1
      ORDER BY last_message_at DESC
    `;

        const result = await this.db.query<ConversationRow>(query, [userId]);

        return result.rows.map((row) =>
            Conversation.reconstituteFromDb(
                row.id,
                row.ad_id,
                row.buyer_id,
                row.seller_id,
                row.last_message_at,
                row.created_at
            )
        );
    }

    public async findMessagesByConversationId(
        conversationId: string
    ): Promise<Message[]> {
        const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `;

        const result = await this.db.query<MessageRow>(query, [conversationId]);

        return result.rows.map((row) =>
            Message.reconstituteFromDb(
                row.id,
                row.conversation_id,
                row.sender_id,
                row.receiver_id,
                row.ad_id,
                row.content,
                row.is_read,
                row.created_at
            )
        );
    }
}
