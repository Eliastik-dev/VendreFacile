#!/bin/bash
set -e

# Create replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER replication_user WITH REPLICATION ENCRYPTED PASSWORD 'replication_password';
EOSQL

# Allow replication connections
echo "host replication replication_user all md5" >> "$PGDATA/pg_hba.conf"

# Config changes are usually handled by args or separate volume mount, but we can do reload here
# However, pg_hba requires a reload or restart. Since this runs at init, the restart happens after.
