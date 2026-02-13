import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { PostgresClient } from '../shared/infrastructure/database/PostgresClient';
import { EncryptionService } from '../shared/infrastructure/security/EncryptionService';
import { PostgresUserRepository } from '../modules/users/infrastructure/persistence/PostgresUserRepository';
import { User, UserRole } from '../modules/users/domain/entities/User';
import { Email } from '../modules/users/domain/value-objects/Email';

dotenv.config();

async function seed() {
    console.log('Seeding database...');

    const db = PostgresClient.getInstance();
    const encryptionService = new EncryptionService();
    const userRepository = new PostgresUserRepository(db, encryptionService);

    const adminEmailString = 'admin@admin.fr';

    // Check if admin already exists
    const existingAdmin = await userRepository.findByEmail(Email.create(adminEmailString));
    if (existingAdmin) {
        console.log('Admin user already exists.');
        await db.close();
        return;
    }

    const passwordHash = await encryptionService.hashPassword('admin123');

    const admin = User.create({
        id: uuidv4(),
        email: Email.create(adminEmailString),
        passwordHash: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        phone: '0600000000',
        role: UserRole.ADMIN,
    });

    await userRepository.save(admin);

    console.log('Admin user seeded successfully.');
    console.log('Email: admin@admin.fr');
    console.log('Password: admin123');

    await db.close();
}

seed().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});
