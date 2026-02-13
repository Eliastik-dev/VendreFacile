import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);

const PRIMARY_PORT = 5432;
const REPLICA_PORT = 5433;

const DB_CONFIG = {
    user: process.env.DB_USER || 'vendrefacile',
    password: process.env.DB_PASSWORD || 'dev_password_change_in_production',
    database: process.env.DB_NAME || 'vendrefacile_db',
    host: 'localhost',
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPgRole(port: number): Promise<string> {
    const pool = new Pool({ ...DB_CONFIG, port });
    try {
        const res = await pool.query('SELECT pg_is_in_recovery()');
        return res.rows[0].pg_is_in_recovery ? 'REPLICA' : 'PRIMARY';
    } catch (e) {
        return 'DOWN';
    } finally {
        await pool.end();
    }
}

async function testHA() {
    console.log('🚀 Starting HA / Replication Test...');

    // 1. Initial Health Check
    console.log('\n🔍 Phase 1: Initial Health Check');
    let primaryRole = await getPgRole(PRIMARY_PORT);
    let replicaRole = await getPgRole(REPLICA_PORT);
    console.log(`Port ${PRIMARY_PORT}: ${primaryRole}`);
    console.log(`Port ${REPLICA_PORT}: ${replicaRole}`);

    if (primaryRole !== 'PRIMARY' || replicaRole !== 'REPLICA') {
        console.error('❌ Check failed: Infrastructure not in correct initial state.');
        console.log('Please run: docker-compose up -d --build --force-recreate');
        return;
    }

    // 2. Write to Primary
    console.log('\n✍️ Phase 2: Write to Primary');
    const primaryPool = new Pool({ ...DB_CONFIG, port: PRIMARY_PORT });
    const testId = Math.floor(Math.random() * 100000);
    try {
        await primaryPool.query('CREATE TABLE IF NOT EXISTS ha_test (id INT, created_at TIMESTAMP DEFAULT NOW())');
        await primaryPool.query('INSERT INTO ha_test (id) VALUES ($1)', [testId]);
        console.log(`✅ Inserted test ID: ${testId}`);
    } finally {
        await primaryPool.end();
    }

    // 3. Read from Replica
    console.log('\n📖 Phase 3: Read from Replica');
    const replicaPool = new Pool({ ...DB_CONFIG, port: REPLICA_PORT });
    let found = false;
    for (let i = 0; i < 5; i++) {
        try {
            const res = await replicaPool.query('SELECT * FROM ha_test WHERE id = $1', [testId]);
            if (res.rows.length > 0) {
                console.log(`✅ Data replicated! Found ID: ${testId}`);
                found = true;
                break;
            }
        } catch (e) { }
        await sleep(2000);
    }
    await replicaPool.end();

    if (!found) {
        console.error('❌ Replication failed: Data not found in replica.');
        return;
    }

    // 4. Failover Simulation
    console.log('\n💥 Phase 4: Simulating Primary Failure & Failover');
    try {
        console.log('Stopping Primary Container...');
        await execAsync('docker stop vendrefacile_postgres_primary');

        console.log('Promoting Replica to Primary...');
        await execAsync('docker exec -u postgres vendrefacile_postgres_replica pg_ctl promote -D /var/lib/postgresql/data');

        await sleep(2000); // Wait for promotion

        const newRole = await getPgRole(REPLICA_PORT);
        console.log(`New Role (Port ${REPLICA_PORT}): ${newRole}`);

        if (newRole === 'PRIMARY') {
            console.log('✅ Promotion Successful!');
        } else {
            console.error('❌ Promotion Failed.');
            return;
        }

        // 5. Write to New Primary
        console.log('\n✍️ Phase 5: Write to New Primary');
        const newPrimaryPool = new Pool({ ...DB_CONFIG, port: REPLICA_PORT });
        const newTestId = testId + 1;
        await newPrimaryPool.query('INSERT INTO ha_test (id) VALUES ($1)', [newTestId]);
        console.log(`✅ Inserted ID ${newTestId} into new primary.`);
        await newPrimaryPool.end();

    } catch (e) {
        console.error('❌ Failover test error:', e);
    } finally {
        console.log('\n🔄 Cleanup Instructions:');
        console.log('To reset the environment, run:');
        console.log('docker-compose down -v');
        console.log('docker-compose up -d');
    }
}

testHA();
