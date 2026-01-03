#!/bin/bash
set -e

echo "🗄️  Running database migrations on Railway PostgreSQL..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='your-railway-postgres-url'"
    echo ""
    echo "You can find it in Railway dashboard:"
    echo "  1. Go to your Railway project"
    echo "  2. Click on PostgreSQL service"
    echo "  3. Go to 'Connect' tab"
    echo "  4. Copy 'Postgres Connection URL'"
    exit 1
fi

echo "Database URL: ${DATABASE_URL:0:30}..." # Show first 30 chars only
echo ""

cd "$(dirname "$0")/.."

# Check if golang-migrate is installed
if ! command -v migrate &> /dev/null; then
    echo "📦 Installing golang-migrate..."
    
    # Install based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install golang-migrate
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -L https://github.com/golang-migrate/migrate/releases/latest/download/migrate.linux-amd64.tar.gz | tar xvz
        sudo mv migrate /usr/local/bin/
    else
        echo "❌ Unsupported OS. Please install golang-migrate manually:"
        echo "   https://github.com/golang-migrate/migrate"
        exit 1
    fi
fi

echo "Running migrations..."
migrate -path database/migrations -database "$DATABASE_URL" up

echo ""
echo "✅ Migrations completed!"
echo ""
echo "To check migration status:"
echo "  migrate -path database/migrations -database \"\$DATABASE_URL\" version"
echo ""
echo "To rollback last migration:"
echo "  migrate -path database/migrations -database \"\$DATABASE_URL\" down 1"
