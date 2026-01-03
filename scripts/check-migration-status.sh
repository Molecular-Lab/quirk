#!/bin/bash
set -e

echo "📊 Checking database migration status..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='your-railway-postgres-url'"
    exit 1
fi

cd "$(dirname "$0")/.."

# Check if golang-migrate is installed
if ! command -v migrate &> /dev/null; then
    echo "❌ golang-migrate is not installed"
    echo "Run ./scripts/migrate-railway.sh to install it and run migrations"
    exit 1
fi

echo "Current migration version:"
migrate -path database/migrations -database "$DATABASE_URL" version

echo ""
echo "Available migrations in database/migrations/:"
ls -1 database/migrations/*.up.sql | sed 's/.*\///' | sed 's/\.up\.sql//'

echo ""
echo "To apply migrations:"
echo "  ./scripts/migrate-railway.sh"
