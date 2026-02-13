import { Email } from '../../domain/value-objects/Email';
import { IUserRepository } from '../ports/IUserRepository';
import { EncryptionService } from '../../../../shared/infrastructure/security/EncryptionService';
import { JwtService } from '../../../../shared/infrastructure/security/JwtService';
import { RedisClient } from '../../../../shared/infrastructure/cache/RedisClient';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
}

export class LoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private encryptionService: EncryptionService,
        private jwtService: JwtService,
        private redisClient: RedisClient
    ) { }

    public async execute(dto: LoginDto): Promise<LoginResult> {
        const email = Email.create(dto.email);


        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new ValidationException('Invalid email or password');
        }


        const isValidPassword = await this.encryptionService.comparePassword(
            dto.password,
            user.getPasswordHash()
        );
        if (!isValidPassword) {
            throw new ValidationException('Invalid email or password');
        }


        const payload = {
            userId: user.getId(),
            email: user.getEmail().value,
            role: user.getRole(),
        };

        const accessToken = this.jwtService.generateAccessToken(payload);
        const refreshToken = this.jwtService.generateRefreshToken(payload);


        await this.redisClient.set(
            `session:${user.getId()}`,
            { refreshToken, createdAt: new Date() },
            24 * 60 * 60
        );

        return {
            accessToken,
            refreshToken,
            userId: user.getId(),
            email: user.getEmail().value,
            role: user.getRole(),
        };
    }
}
