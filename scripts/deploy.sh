#!/bin/bash
set -euo pipefail

# Deployment script for Proxify
# Usage: ./deploy.sh [staging|production]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Default values
ENVIRONMENT=${1:-production}
DEPLOY_DIR="/opt/proxify"
BACKUP_DIR="/opt/proxify/backups"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_USERNAME="${DOCKER_USERNAME:-yourname}"
VERSION="${VERSION:-latest}"
ROLLBACK=false

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

print_info "Starting deployment to $ENVIRONMENT environment"

# Check if running in the correct directory
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "docker-compose.production.yml not found. Are you in the project root?"
    exit 1
fi

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    print_info "Loading environment variables from .env.$ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    print_error ".env.$ENVIRONMENT file not found"
    exit 1
fi

# Function to check if services are healthy
check_health() {
    print_info "Checking service health..."

    # Check API health
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        print_info "API is healthy"
    else
        print_error "API health check failed"
        return 1
    fi

    # Check frontend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_info "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi

    # Check database connection
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_info "Database is healthy"
    else
        print_error "Database health check failed"
        return 1
    fi

    return 0
}

# Function to backup database
backup_database() {
    print_step "Creating database backup..."

    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/proxify_${ENVIRONMENT}_${TIMESTAMP}.sql"

    mkdir -p $BACKUP_DIR

    docker-compose exec -T postgres pg_dump -U postgres proxify > $BACKUP_FILE

    if [ -f $BACKUP_FILE ]; then
        gzip $BACKUP_FILE
        print_info "Database backed up to ${BACKUP_FILE}.gz"

        # Keep only last 7 backups
        ls -t $BACKUP_DIR/*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm
    else
        print_error "Failed to create database backup"
        exit 1
    fi
}

# Function to run migrations
run_migrations() {
    print_step "Running database migrations..."

    # Check if migrate service exists in docker-compose
    if docker-compose config --services | grep -q "migrate"; then
        docker-compose run --rm migrate
    else
        # Run migrations manually
        docker-compose exec -T postgres psql -U postgres -d proxify < database/migrations/*.up.sql
    fi

    print_info "Migrations completed"
}

# Function to rollback
rollback() {
    print_error "Deployment failed. Rolling back..."

    # Stop current containers
    docker-compose down

    # Restore from previous images (tagged as 'previous')
    docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-b2b-api:previous \
               ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-b2b-api:latest
    docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-whitelabel-web:previous \
               ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-whitelabel-web:latest

    # Start services with previous version
    docker-compose up -d

    # Wait for services to be ready
    sleep 30

    if check_health; then
        print_warning "Rollback successful"
    else
        print_error "Rollback failed! Manual intervention required"
        exit 1
    fi
}

# Main deployment process
main() {
    print_step "Pre-deployment checks..."

    # Check Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi

    # Check if services are currently running
    if docker-compose ps | grep -q "Up"; then
        print_info "Services are currently running"

        # Backup database before deployment
        backup_database

        # Tag current images as 'previous' for rollback
        print_step "Tagging current images for rollback..."
        docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-b2b-api:latest \
                   ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-b2b-api:previous || true
        docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-whitelabel-web:latest \
                   ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/proxify-whitelabel-web:previous || true
    fi

    print_step "Pulling latest images..."
    docker-compose pull || {
        print_error "Failed to pull images"
        exit 1
    }

    print_step "Building images (if needed)..."
    docker-compose build --pull || {
        print_error "Failed to build images"
        exit 1
    }

    print_step "Running migrations..."
    docker-compose --profile migrate run --rm migrate || {
        print_error "Migration failed"
        if [ "$ENVIRONMENT" == "production" ]; then
            rollback
            exit 1
        fi
    }

    print_step "Starting services..."
    docker-compose up -d --remove-orphans || {
        print_error "Failed to start services"
        rollback
        exit 1
    }

    print_info "Waiting for services to be ready..."
    sleep 30

    # Health check
    if check_health; then
        print_info "✅ Deployment to $ENVIRONMENT successful!"

        # Clean up old images
        print_step "Cleaning up old images..."
        docker image prune -af --filter "until=24h" || true

        # Show running services
        print_info "Running services:"
        docker-compose ps

        # Show logs tail
        print_info "Recent logs:"
        docker-compose logs --tail=20
    else
        print_error "Health check failed after deployment"
        rollback
        exit 1
    fi
}

# Handle errors
trap 'print_error "Deployment failed on line $LINENO"' ERR

# Handle Ctrl+C
trap 'print_warning "Deployment cancelled by user"; exit 130' INT TERM

# Run main deployment
main

print_info "Deployment complete!"
print_info "Monitor logs with: docker-compose logs -f"
print_info "View service status: docker-compose ps"