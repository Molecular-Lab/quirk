#!/bin/bash
set -euo pipefail

# Railway Database Migration Script
# This script runs database migrations on Railway PostgreSQL
#
# Usage:
#   1. Set DATABASE_URL environment variable (from Railway)
#   2. Run: ./scripts/railway-migrate.sh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[Railway Migration]${NC} Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    echo -e "${RED}ERROR:${NC} DATABASE_URL environment variable is not set"
    echo "Get your DATABASE_URL from Railway dashboard and run:"
    echo "  export DATABASE_URL='postgresql://...'"
    echo "  ./scripts/railway-migrate.sh"
    exit 1
fi

echo -e "${GREEN}✓${NC} DATABASE_URL is set"

# Check if we're in the project root
if [ ! -d "database/migrations" ]; then
    echo -e "${RED}ERROR:${NC} database/migrations directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found migrations directory"

# Download golang-migrate if not present
MIGRATE_VERSION="v4.16.2"
MIGRATE_BIN="./migrate"

if [ ! -f "$MIGRATE_BIN" ]; then
    echo -e "${YELLOW}→${NC} Downloading golang-migrate ${MIGRATE_VERSION}..."

    # Detect OS and architecture
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    if [ "$ARCH" = "x86_64" ]; then
        ARCH="amd64"
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        ARCH="arm64"
    fi

    MIGRATE_URL="https://github.com/golang-migrate/migrate/releases/download/${MIGRATE_VERSION}/migrate.${OS}-${ARCH}.tar.gz"

    echo "Downloading from: $MIGRATE_URL"
    curl -L "$MIGRATE_URL" | tar xz
    chmod +x migrate

    echo -e "${GREEN}✓${NC} golang-migrate downloaded"
else
    echo -e "${GREEN}✓${NC} golang-migrate already present"
fi

# Count migration files
UP_MIGRATIONS=$(ls -1 database/migrations/*.up.sql 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}→${NC} Found ${UP_MIGRATIONS} migration files"

# Run migrations
echo -e "${YELLOW}→${NC} Running migrations..."
$MIGRATE_BIN -path database/migrations -database "$DATABASE_URL" up

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Migrations completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show migration status
echo -e "${YELLOW}Current migration version:${NC}"
$MIGRATE_BIN -path database/migrations -database "$DATABASE_URL" version

echo ""
echo "Next steps:"
echo "1. Verify tables in Railway dashboard"
echo "2. Deploy b2b-api to Fly.io with this DATABASE_URL"
echo "3. Deploy frontend to Vercel"
