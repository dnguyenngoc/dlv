#!/bin/bash

# Database migration script for DLV

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="dlv"

echo "🔄 Running database migrations..."

# Read migration files
MIGRATIONS=(
    "pkg/database/migrations/001_create_users.sql"
    "pkg/database/migrations/002_create_lineage_tables.sql"
    "pkg/database/migrations/003_create_data_sources.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        echo "📄 Running migration: $migration"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
        if [ $? -eq 0 ]; then
            echo "✅ Migration $migration completed successfully"
        else
            echo "❌ Migration $migration failed"
            exit 1
        fi
    else
        echo "⚠️  Migration file not found: $migration"
    fi
done

echo "🎉 All migrations completed successfully!"
