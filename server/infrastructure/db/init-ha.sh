#!/bin/bash
set -e

# Create replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER replication_user WITH REPLICATION ENCRYPTED PASSWORD 'replication_password';
EOSQL

# Allow replication from any host (for Docker network)
echo "host replication all all trust" >> "$PGDATA/pg_hba.conf"
# Note: config reload happens automatically at end of initdb
