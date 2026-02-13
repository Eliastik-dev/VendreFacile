import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { IUserRepository } from '../ports/IUserRepository';
import { EncryptionService } from '../../../../shared/infrastructure/security/EncryptionService';
import { ValidationException } from '../../../../shared/domain/exceptions/DomainException';

export interface RegisterUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export class RegisterUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private encryptionService: EncryptionService
    ) { }

    public async execute(dto: RegisterUserDto): Promise<User> {

        this.validatePassword(dto.password);


        const email = Email.create(dto.email);


        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ValidationException('User with this email already exists');
        }


        const passwordHash = await this.encryptionService.hashPassword(dto.password);


        const user = User.create({
            email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
        });

        await this.userRepository.save(user);

        return user;
    }

    private validatePassword(password: string): void {
        if (password.length < 8) {
            throw new ValidationException('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            throw new ValidationException('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            throw new ValidationException('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            throw new ValidationException('Password must contain at least one number');
        }
    }
}
