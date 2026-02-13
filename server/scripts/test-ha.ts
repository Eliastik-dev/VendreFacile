import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);

const PRIMARY_PORT = 5432;
const REPLICA_PORT = 5433;

const IN_DOCKER = process.env.DB_HOST === 'postgres-primary' || require('fs').existsSync('/.dockerenv');

const DB_CONFIG = {
    user: process.env.DB_USER || 'vendrefacile',
    password: process.env.DB_PASSWORD || 'dev_password_change_in_production',
    database: process.env.DB_NAME || 'vendrefacile_db',
    host: IN_DOCKER ? 'postgres-primary' : 'localhost',
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHA() {
    console.log('🚀 Starting HA / Replication Test...');
    console.log(`Environment: ${IN_DOCKER ? 'Docker Container' : 'Host Machine'}`);
    console.log(`Target Host: ${DB_CONFIG.host}`);

    // Adjust ports for Docker service-to-service communication (always 5432 internally)
    const primaryPort = IN_DOCKER ? 5432 : PRIMARY_PORT;
    const replicaPort = IN_DOCKER ? 5432 : REPLICA_PORT;

    // For Replica connection in Docker, we need valid hostname
    const replicaConfig = { ...DB_CONFIG, host: IN_DOCKER ? 'postgres-replica' : 'localhost', port: replicaPort };
    const primaryConfig = { ...DB_CONFIG, host: IN_DOCKER ? 'postgres-primary' : 'localhost', port: primaryPort };

    // 1. Initial Health Check
    console.log('\n🔍 Phase 1: Initial Health Check');
    // ... use primaryConfig / replicaConfig instead of PRIMARY_PORT/REPLICA_PORT consts

    // (Redefine getPgRole to accept config object is cleaner, but let's just create pools here)
    const getRole = async (config: any) => {
        const pool = new Pool(config);
        try {
            const res = await pool.query('SELECT pg_is_in_recovery()');
            return res.rows[0].pg_is_in_recovery ? 'REPLICA' : 'PRIMARY';
        } catch (e) {
            return 'DOWN';
        } finally {
            await pool.end();
        }
    };

    let pRole = await getRole(primaryConfig);
    let rRole = await getRole(replicaConfig);
    console.log(`Primary (${primaryConfig.host}): ${pRole}`);
    console.log(`Replica (${replicaConfig.host}): ${rRole}`);

    if (pRole !== 'PRIMARY' || rRole !== 'REPLICA') {
        console.error('❌ Check failed: Infrastructure not in correct initial state.');
        return;
    }

    // 2. Write to Primary
    console.log('\n✍️ Phase 2: Write to Primary');
    const primaryPool = new Pool(primaryConfig);
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
    const replicaPool = new Pool(replicaConfig);
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
    console.log('\n💥 Phase 4: Failover Simulation');

    if (IN_DOCKER) {
        console.log('⚠️  Running in Docker: Cannot control sibling containers automatically.');
        console.log('👉 ACTION REQUIRED: Open another terminal and run:');
        console.log('   docker stop vendrefacile_postgres_primary');
        console.log('   docker exec -u postgres vendrefacile_postgres_replica pg_ctl promote -D /var/lib/postgresql/data');
        console.log('\n⏳ Waiting 30s for you to perform these actions...');
        await sleep(30000);
    } else {
        // Automatic mode on host
        console.log('Stopping Primary Container...');
        await execAsync('docker stop vendrefacile_postgres_primary');

        console.log('Promoting Replica to Primary...');
        await execAsync('docker exec -u postgres vendrefacile_postgres_replica pg_ctl promote -D /var/lib/postgresql/data');
        await sleep(2000);
    }

    // Check new role
    const newRole = await getRole(replicaConfig);
    console.log(`New Replica Role: ${newRole}`);

    if (newRole === 'PRIMARY') {
        console.log('✅ Promotion Successful!');
        // 5. Write to New Primary
        // ...
        const newPrimaryPool = new Pool(replicaConfig);
        const newTestId = testId + 1;
        await newPrimaryPool.query('INSERT INTO ha_test (id) VALUES ($1)', [newTestId]);
        console.log(`✅ Inserted ID ${newTestId} into new primary.`);
        await newPrimaryPool.end();
    } else {
        console.error('❌ Promotion Failed (or timed out).');
    }
}

testHA();
