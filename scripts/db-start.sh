#!/bin/bash

# Proxify Database Startup Script
# Starts PostgreSQL with Docker and runs migrations

set -e

echo "🐘 Starting Proxify PostgreSQL Database..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=30
counter=0

while ! docker exec proxify-postgres pg_isready -U proxify_user -d proxify_dev > /dev/null 2>&1; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo "❌ Timeout waiting for PostgreSQL to start"
        exit 1
    fi
    echo "   Waiting... ($counter/$timeout)"
    sleep 1
done

echo "✅ PostgreSQL is ready!"
echo ""

# Display connection info
echo "📊 Database Connection Info:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: proxify_dev"
echo "   User: proxify_user"
echo "   Password: proxify_password"
echo ""
echo "   Connection URL:"
echo "   postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev"
echo ""

# Run migrations
echo "🔄 Running migrations..."
docker exec -i proxify-postgres psql -U proxify_user -d proxify_dev < packages/core/migrations/001_create_user_wallets_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "⚠️  Migration already applied or failed (this is normal if re-running)"
fi

echo ""
echo "🎉 Database is ready to use!"
echo ""
echo "💡 Useful commands:"
echo "   • Stop database:     docker-compose stop postgres"
echo "   • View logs:         docker-compose logs -f postgres"
echo "   • Connect to DB:     docker exec -it proxify-postgres psql -U proxify_user -d proxify_dev"
echo "   • pgAdmin (UI):      http://localhost:5050 (admin@proxify.local / admin)"
echo ""
