import { Router, Request, Response } from 'express';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';
import { PostgresMessagingRepository } from '../persistence/PostgresMessagingRepository';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';
import {
    AuthenticatedRequest,
    AuthMiddleware,
} from '../../../../shared/infrastructure/middleware/AuthMiddleware';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class MessagingController {
    public router: Router;
    private sendMessageUseCase: SendMessageUseCase;
    private messagingRepository: PostgresMessagingRepository;
    private authMiddleware: AuthMiddleware;

    constructor() {
        this.router = Router();
        this.authMiddleware = new AuthMiddleware();

        const db = PostgresClient.getInstance();
        this.messagingRepository = new PostgresMessagingRepository(db);
        this.sendMessageUseCase = new SendMessageUseCase(this.messagingRepository);

        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.post(
            '/messages',
            this.authMiddleware.authenticate,
            this.sendMessage.bind(this)
        );
        this.router.get(
            '/conversations',
            this.authMiddleware.authenticate,
            this.getConversations.bind(this)
        );
        this.router.get(
            '/conversations/:id/messages',
            this.authMiddleware.authenticate,
            this.getMessages.bind(this)
        );
    }

    private async sendMessage(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> {
        try {
            const { receiverId, adId, content } = req.body;

            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const message = await this.sendMessageUseCase.execute({
                senderId: req.user.userId,
                receiverId,
                adId,
                content,
            });

            res.status(201).json({
                id: message.getId(),
                conversationId: message.getConversationId(),
                content: message.getContent(),
                createdAt: message.getCreatedAt(),
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async getConversations(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const conversations =
                await this.messagingRepository.findConversationsByUserId(
                    req.user.userId
                );

            res.status(200).json(
                conversations.map((conv) => ({
                    id: conv.getId(),
                    adId: conv.getAdId(),
                    buyerId: conv.getBuyerId(),
                    sellerId: conv.getSellerId(),
                    lastMessageAt: conv.getLastMessageAt(),
                }))
            );
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async getMessages(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> {
        try {
            const { id } = req.params;

            const messages =
                await this.messagingRepository.findMessagesByConversationId(id);

            res.status(200).json(
                messages.map((msg) => ({
                    id: msg.getId(),
                    senderId: msg.getSenderId(),
                    receiverId: msg.getReceiverId(),
                    content: msg.getContent(),
                    isRead: msg.getIsRead(),
                    createdAt: msg.getCreatedAt(),
                }))
            );
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: unknown, res: Response): void {
        if (error instanceof ValidationException) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
