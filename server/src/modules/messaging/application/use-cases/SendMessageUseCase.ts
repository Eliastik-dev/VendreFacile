import { Message } from '../../domain/entities/Message';
import { Conversation } from '../../domain/entities/Conversation';
import { IMessagingRepository } from '../ports/IMessagingRepository';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export interface SendMessageDto {
    senderId: string;
    receiverId: string;
    adId: string;
    content: string;
}

export class SendMessageUseCase {
    constructor(private messagingRepository: IMessagingRepository) { }

    public async execute(dto: SendMessageDto): Promise<Message> {
        if (!dto.content || dto.content.trim().length === 0) {
            throw new ValidationException('Message content cannot be empty');
        }

        if (dto.content.length > 2000) {
            throw new ValidationException('Message content cannot exceed 2000 characters');
        }


        let conversation = await this.messagingRepository.findConversationByParticipants(
            dto.adId,
            dto.senderId,
            dto.receiverId
        );

        if (!conversation) {
            conversation = Conversation.create(dto.adId, dto.senderId, dto.receiverId);
            await this.messagingRepository.saveConversation(conversation);
        }


        const message = Message.create(
            conversation.getId(),
            dto.senderId,
            dto.receiverId,
            dto.adId,
            dto.content
        );

        await this.messagingRepository.saveMessage(message);


        conversation.updateLastMessageTime();
        await this.messagingRepository.saveConversation(conversation);

        return message;
    }
}
