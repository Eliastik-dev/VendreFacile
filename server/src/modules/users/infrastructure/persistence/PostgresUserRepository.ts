import { IUserRepository } from '../../application/ports/IUserRepository';
import { User, UserRole } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { PostgresClient } from '../../../../shared/infrastructure/database/PostgresClient';
import { EncryptionService } from '../../../../shared/infrastructure/security/EncryptionService';

interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    first_name_encrypted: string;
    last_name_encrypted: string;
    phone_encrypted: string | null;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
}

export class PostgresUserRepository implements IUserRepository {
    constructor(
        private db: PostgresClient,
        private encryptionService: EncryptionService
    ) { }

    public async save(user: User): Promise<void> {

        const firstNameEncrypted = this.encryptionService.encrypt(user.getFirstName());
        const lastNameEncrypted = this.encryptionService.encrypt(user.getLastName());
        const phoneEncrypted = user.getPhone()
            ? this.encryptionService.encrypt(user.getPhone())
            : null;

        const query = `
      INSERT INTO users (
        id, email, password_hash, first_name_encrypted, last_name_encrypted,
        phone_encrypted, role, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        first_name_encrypted = EXCLUDED.first_name_encrypted,
        last_name_encrypted = EXCLUDED.last_name_encrypted,
        phone_encrypted = EXCLUDED.phone_encrypted,
        role = EXCLUDED.role,
        updated_at = EXCLUDED.updated_at
    `;

        const params = [
            user.getId(),
            user.getEmail().value,
            user.getPasswordHash(),
            firstNameEncrypted,
            lastNameEncrypted,
            phoneEncrypted,
            user.getRole(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
        ];

        await this.db.query(query, params);
    }

    public async findById(id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await this.db.query<UserRow>(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToUser(result.rows[0]);
    }

    public async findByEmail(email: Email): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.db.query<UserRow>(query, [email.value]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToUser(result.rows[0]);
    }

    public async delete(id: string): Promise<void> {
        const query = 'DELETE FROM users WHERE id = $1';
        await this.db.query(query, [id]);
    }

    private mapRowToUser(row: UserRow): User {

        const firstName = this.encryptionService.decrypt(row.first_name_encrypted);
        const lastName = this.encryptionService.decrypt(row.last_name_encrypted);
        const phone = row.phone_encrypted
            ? this.encryptionService.decrypt(row.phone_encrypted)
            : undefined;

        return User.reconstituteFromDb({
            id: row.id,
            email: Email.create(row.email),
            passwordHash: row.password_hash,
            firstName,
            lastName,
            phone,
            role: row.role,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}
