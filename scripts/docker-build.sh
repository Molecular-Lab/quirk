#!/bin/bash
set -euo pipefail

# Docker Build Script for Proxify
# Usage: ./scripts/docker-build.sh [VERSION]
#
# This script builds production-ready Docker images for:
# - b2b-api (Node.js backend API)
# - whitelabel-web (React frontend with nginx)
#
# Features:
# - Multi-stage builds for optimized image size
# - Build caching with PNPM store
# - TurboRepo pruning for monorepo optimization
# - Production-ready configurations

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

# Configuration
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_USERNAME="${DOCKER_USERNAME:-yourname}"
VERSION="${1:-latest}"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
PARALLEL_BUILDS="${PARALLEL_BUILDS:-true}"

print_info "========================================"
print_info "  Proxify Docker Build Script"
print_info "========================================"
print_info "Registry: $DOCKER_REGISTRY"
print_info "Username: $DOCKER_USERNAME"
print_info "Version: $VERSION"
print_info "Git Commit: $GIT_COMMIT"
print_info "Build Date: $BUILD_DATE"
print_info "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if we're in the project root
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "docker-compose.production.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ] && [ ! -f ".env.production.example" ]; then
    print_warning "No .env.production file found. Make sure to configure environment variables before deploying."
fi

# Function to build a service
build_service() {
    local service_name=$1
    local image_name="${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-${service_name}:${VERSION}"

    print_step "Building ${service_name}..."

    docker build \
        --file "./apps/${service_name}/Dockerfile" \
        --tag "${image_name}" \
        --tag "${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-${service_name}:latest" \
        --label "org.opencontainers.image.created=${BUILD_DATE}" \
        --label "org.opencontainers.image.revision=${GIT_COMMIT}" \
        --label "org.opencontainers.image.version=${VERSION}" \
        --label "org.opencontainers.image.title=proxify-${service_name}" \
        --label "org.opencontainers.image.description=Proxify ${service_name} service" \
        --build-arg NODE_VERSION=22 \
        --build-arg BUILD_DATE="${BUILD_DATE}" \
        --build-arg GIT_COMMIT="${GIT_COMMIT}" \
        --progress=plain \
        . || {
        print_error "Failed to build ${service_name}"
        return 1
    }

    print_info "✅ Successfully built ${service_name}: ${image_name}"

    # Show image size
    local image_size=$(docker images "${image_name}" --format "{{.Size}}")
    print_info "   Image size: ${image_size}"
}

# Build services
print_step "Starting Docker builds..."

if [ "$PARALLEL_BUILDS" == "true" ]; then
    print_info "Building services in parallel..."

    # Build in parallel using background jobs
    build_service "b2b-api" &
    PID_API=$!

    build_service "whitelabel-web" &
    PID_WEB=$!

    # Wait for all background jobs
    wait $PID_API || {
        print_error "b2b-api build failed"
        exit 1
    }

    wait $PID_WEB || {
        print_error "whitelabel-web build failed"
        exit 1
    }
else
    print_info "Building services sequentially..."

    build_service "b2b-api" || exit 1
    build_service "whitelabel-web" || exit 1
fi

print_info ""
print_info "========================================"
print_info "✅ All builds completed successfully!"
print_info "========================================"

# Show all built images
print_info "Built images:"
docker images | grep "proxify-" | grep "${VERSION}"

print_info ""
print_info "Next steps:"
print_info "  1. Test the images locally:"
print_info "     docker-compose -f docker-compose.production.yml up"
print_info ""
print_info "  2. Push to Docker Hub:"
print_info "     ./scripts/docker-push.sh ${VERSION}"
print_info ""
print_info "  3. Deploy to production:"
print_info "     ./scripts/deploy.sh production"
print_info ""
