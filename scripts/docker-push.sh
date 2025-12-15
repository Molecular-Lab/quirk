#!/bin/bash
set -euo pipefail

# Docker Push Script for Proxify
# Usage: ./scripts/docker-push.sh [VERSION]
#
# This script pushes Docker images to Docker Hub registry
#
# Prerequisites:
# - Docker images must be built first (run docker-build.sh)
# - Docker Hub login required: docker login
#
# Environment Variables:
# - DOCKER_REGISTRY: Container registry URL (default: docker.io)
# - DOCKER_USERNAME: Docker Hub username (required)

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
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
VERSION="${1:-latest}"

print_info "========================================"
print_info "  Proxify Docker Push Script"
print_info "========================================"
print_info "Registry: $DOCKER_REGISTRY"
print_info "Version: $VERSION"
print_info "========================================"

# Validate Docker username
if [ -z "$DOCKER_USERNAME" ]; then
    print_error "DOCKER_USERNAME is not set!"
    print_info ""
    print_info "Please set your Docker Hub username:"
    print_info "  export DOCKER_USERNAME=yourusername"
    print_info ""
    print_info "Or provide it when running the script:"
    print_info "  DOCKER_USERNAME=yourusername ./scripts/docker-push.sh"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if user is logged in to Docker Hub
print_step "Checking Docker Hub authentication..."
if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
    print_warning "Not logged in to Docker Hub. Attempting login..."
    print_info "Please enter your Docker Hub password:"

    docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" || {
        print_error "Docker Hub login failed"
        print_info ""
        print_info "Please login manually:"
        print_info "  docker login"
        exit 1
    }

    print_info "✅ Successfully logged in to Docker Hub"
else
    print_info "✅ Already logged in to Docker Hub as $DOCKER_USERNAME"
fi

# Services to push
SERVICES=("b2b-api" "whitelabel-web")

# Function to push a service image
push_service() {
    local service_name=$1
    local image_name="${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-${service_name}"

    print_step "Pushing ${service_name}..."

    # Check if image exists locally
    if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "${image_name}:${VERSION}"; then
        print_error "Image ${image_name}:${VERSION} not found locally"
        print_info "Please build the image first:"
        print_info "  ./scripts/docker-build.sh ${VERSION}"
        return 1
    fi

    # Push versioned tag
    print_info "Pushing ${image_name}:${VERSION}..."
    docker push "${image_name}:${VERSION}" || {
        print_error "Failed to push ${image_name}:${VERSION}"
        return 1
    }

    # Push latest tag if this is the latest version
    if [ "$VERSION" == "latest" ] || [ -z "$(docker images --format '{{.Repository}}:{{.Tag}}' | grep "${image_name}:latest")" ]; then
        print_info "Pushing ${image_name}:latest..."
        docker push "${image_name}:latest" || {
            print_error "Failed to push ${image_name}:latest"
            return 1
        }
    fi

    print_info "✅ Successfully pushed ${service_name}"

    # Show image digest
    local digest=$(docker inspect "${image_name}:${VERSION}" --format='{{index .RepoDigests 0}}' 2>/dev/null || echo "N/A")
    if [ "$digest" != "N/A" ]; then
        print_info "   Digest: ${digest}"
    fi
}

# Push all services
print_step "Starting image push to Docker Hub..."

for service in "${SERVICES[@]}"; do
    push_service "$service" || {
        print_error "Failed to push $service"
        exit 1
    }
    print_info ""
done

print_info "========================================"
print_info "✅ All images pushed successfully!"
print_info "========================================"

print_info ""
print_info "Images pushed:"
for service in "${SERVICES[@]}"; do
    print_info "  • ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-${service}:${VERSION}"
    print_info "  • ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-${service}:latest"
done

print_info ""
print_info "Next steps:"
print_info "  1. Verify images on Docker Hub:"
print_info "     https://hub.docker.com/u/${DOCKER_USERNAME}"
print_info ""
print_info "  2. Deploy to production:"
print_info "     DOCKER_USERNAME=${DOCKER_USERNAME} VERSION=${VERSION} ./scripts/deploy.sh"
print_info ""
print_info "  3. Or pull and run on any machine:"
print_info "     docker pull ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-b2b-api:${VERSION}"
print_info "     docker pull ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/proxify-whitelabel-web:${VERSION}"
print_info ""
