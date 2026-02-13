import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';


dotenv.config();

// Fix for __dirname in ESM if needed, though transpile-only usually handles CJS
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

async function runMigrations() {
    console.log('Running migrations...');

    const db = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        const migrationFiles = [
            '../src/modules/users/infrastructure/persistence/migrations/001_create_users_table.sql',
            '../src/modules/ads/infrastructure/persistence/migrations/001_create_ads_table.sql',
            '../src/modules/messaging/infrastructure/persistence/migrations/001_create_messages_table.sql',
        ];

        for (const relativePath of migrationFiles) {
            const filePath = path.join(__dirname, relativePath);
            if (fs.existsSync(filePath)) {
                console.log(`Executing migration: ${relativePath}`);
                const sql = fs.readFileSync(filePath, 'utf8');
                try {
                    await db.query(sql);
                    console.log(`Migration successful: ${relativePath}`);
                } catch (err: any) {
                    if (err.code === '42P07' || err.code === '42710') {
                        console.log(`Migration skipped (already exists): ${relativePath}`);
                    } else {
                        throw err;
                    }
                }
            } else {
                console.warn(`Migration file not found: ${filePath}`);
            }
        }

    } catch (error) {
        console.error('Error running migrations:', error);
    } finally {
        await db.end();
    }
}

runMigrations();
