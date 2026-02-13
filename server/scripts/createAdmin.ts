import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { EncryptionService } from '../src/shared/infrastructure/security/EncryptionService';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function createAdmin() {
    console.log('Creating admin user...');

    const db = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    const encryptionService = new EncryptionService();

    try {
        const email = 'admin@admin.fr';
        const password = 'admin123';
        const firstName = 'Admin';
        const lastName = 'System';

        // Check if user exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        const passwordHash = await encryptionService.hashPassword(password);
        const firstNameEncrypted = encryptionService.encrypt(firstName);
        const lastNameEncrypted = encryptionService.encrypt(lastName);
        const id = uuidv4();
        const role = 'ADMIN';
        const now = new Date();

        const query = `
            INSERT INTO users (
                id, email, password_hash, first_name_encrypted, last_name_encrypted,
                role, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        await db.query(query, [
            id,
            email,
            passwordHash,
            firstNameEncrypted,
            lastNameEncrypted,
            role,
            now,
            now
        ]);

        console.log(`Admin user created successfully: ${email}`);
        console.log(`ID: ${id}`);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await db.end();
    }
}

createAdmin();
