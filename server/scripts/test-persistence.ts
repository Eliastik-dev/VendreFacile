import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function testPersistence() {
    const db = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        // 1. Create a test table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS persistence_test (
                id UUID PRIMARY KEY,
                data TEXT,
                created_at TIMESTAMP
            )
        `);

        // 2. Check for existing data
        const existing = await db.query('SELECT * FROM persistence_test ORDER BY created_at DESC LIMIT 1');

        if (existing.rows.length > 0) {
            console.log('\n✅ EXISTING DATA FOUND (Persistence Confirmed!):');
            console.log(existing.rows[0]);
            console.log('--------------------------------------------------');
        } else {
            console.log('\nℹ️ No existing test data found.');
        }

        // 3. Insert new data
        const id = uuidv4();
        const data = `Test run at ${new Date().toISOString()}`;
        await db.query('INSERT INTO persistence_test (id, data, created_at) VALUES ($1, $2, NOW())', [id, data]);

        console.log(`\n📝 INSERTED NEW DATA:`);
        console.log({ id, data });
        console.log('\n👉 Instructions:');
        console.log('1. Stop the server/database');
        console.log('2. Restart the server/database');
        console.log('3. Run this script again to verify the data above is found.');

    } catch (error) {
        console.error('Persistence test failed:', error);
    } finally {
        await db.end();
    }
}

testPersistence();
