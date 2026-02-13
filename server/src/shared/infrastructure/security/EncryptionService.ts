import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;
    private readonly saltRounds = 12;

    constructor() {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey || encryptionKey.length !== 32) {
            throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
        }
        this.key = Buffer.from(encryptionKey, 'utf-8');
    }


    public encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();


        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    public decrypt(encryptedText: string): string {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }


    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    public async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
