import { Router, Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { PostgresUserRepository } from '../persistence/PostgresUserRepository';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';
import { EncryptionService } from '../../../../shared/infrastructure/security/EncryptionService';
import { JwtService } from '../../../../shared/infrastructure/security/JwtService';
import { RedisClient } from '../../../../shared/infrastructure/cache/RedisClient';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export class UserController {
    public router: Router;
    private registerUserUseCase: RegisterUserUseCase;
    private loginUseCase: LoginUseCase;

    constructor() {
        this.router = Router();

        const db = PostgresClient.getInstance();
        const encryptionService = new EncryptionService();
        const jwtService = new JwtService();
        const redisClient = RedisClient.getInstance();

        const userRepository = new PostgresUserRepository(db, encryptionService);

        this.registerUserUseCase = new RegisterUserUseCase(
            userRepository,
            encryptionService
        );
        this.loginUseCase = new LoginUseCase(
            userRepository,
            encryptionService,
            jwtService,
            redisClient
        );

        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.post('/register', this.register.bind(this));
        this.router.post('/login', this.login.bind(this));
    }

    private async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, phone } = req.body;

            const user = await this.registerUserUseCase.execute({
                email,
                password,
                firstName,
                lastName,
                phone,
            });

            res.status(201).json({
                id: user.getId(),
                email: user.getEmail().value,
                firstName: user.getFirstName(),
                lastName: user.getLastName(),
                createdAt: user.getCreatedAt(),
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await this.loginUseCase.execute({ email, password });

            res.status(200).json(result);
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
