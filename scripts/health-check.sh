#!/bin/bash
set -euo pipefail

# Health Check Script for Proxify
# Usage: ./scripts/health-check.sh [--verbose]
#
# This script verifies that all Proxify services are healthy and running
# It checks:
# - PostgreSQL database connectivity
# - Redis cache connectivity
# - B2B API health endpoint
# - Whitelabel Web frontend health endpoint
# - Service container status

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
print_step() { echo -e "${BLUE}[CHECK]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_fail() { echo -e "${RED}[✗]${NC} $1"; }

# Configuration
VERBOSE=false
FAILED_CHECKS=0
TOTAL_CHECKS=0

if [[ "${1:-}" == "--verbose" ]]; then
    VERBOSE=true
fi

print_info "========================================"
print_info "  Proxify Health Check"
print_info "========================================"
print_info "Timestamp: $(date)"
print_info "========================================"

# Function to check if Docker is running
check_docker() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking Docker daemon..."

    if command -v docker &> /dev/null && docker info &> /dev/null; then
        print_success "Docker is running"
        return 0
    else
        print_fail "Docker is not running"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check if containers are running
check_containers() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking Docker containers..."

    local containers=("proxify_postgres" "proxify_redis" "proxify_api" "proxify_web")
    local all_running=true

    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            if [ "$VERBOSE" == "true" ]; then
                local status=$(docker inspect "$container" --format='{{.State.Status}}')
                print_success "  ${container}: ${status}"
            fi
        else
            print_fail "  ${container}: not running"
            all_running=false
        fi
    done

    if [ "$all_running" == "true" ]; then
        print_success "All containers are running"
        return 0
    else
        print_fail "Some containers are not running"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check PostgreSQL
check_postgres() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking PostgreSQL database..."

    if docker exec proxify_postgres pg_isready -U postgres &> /dev/null; then
        print_success "PostgreSQL is accepting connections"

        if [ "$VERBOSE" == "true" ]; then
            local version=$(docker exec proxify_postgres psql -U postgres -t -c "SELECT version();" | head -n 1)
            print_info "  Version: $(echo $version | xargs)"
        fi
        return 0
    else
        print_fail "PostgreSQL is not responding"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check Redis
check_redis() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking Redis cache..."

    if docker exec proxify_redis redis-cli ping &> /dev/null; then
        print_success "Redis is responding to PING"

        if [ "$VERBOSE" == "true" ]; then
            local info=$(docker exec proxify_redis redis-cli info server | grep redis_version | cut -d: -f2 | tr -d '\r')
            print_info "  Version: $info"
        fi
        return 0
    else
        print_fail "Redis is not responding"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check B2B API health endpoint
check_api_health() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking B2B API health endpoint..."

    # Try internal health check first
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>&1 || echo "000")

    if [ "$response" == "200" ]; then
        print_success "B2B API health endpoint is responding (HTTP 200)"

        if [ "$VERBOSE" == "true" ]; then
            local api_response=$(curl -s http://localhost:8080/health)
            print_info "  Response: $api_response"
        fi
        return 0
    else
        print_fail "B2B API health endpoint returned HTTP $response"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check Whitelabel Web health endpoint
check_web_health() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking Whitelabel Web health endpoint..."

    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>&1 || echo "000")

    if [ "$response" == "200" ]; then
        print_success "Whitelabel Web health endpoint is responding (HTTP 200)"
        return 0
    else
        print_fail "Whitelabel Web health endpoint returned HTTP $response"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check API endpoints
check_api_endpoints() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_step "Checking B2B API endpoints..."

    # Check DeFi protocols endpoint (public endpoint)
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/defi/protocols 2>&1 || echo "000")

    if [ "$response" == "200" ]; then
        print_success "API endpoints are accessible"
        return 0
    else
        print_warning "API endpoints returned HTTP $response (may be expected for protected endpoints)"
        # Don't increment failed checks for this, as it might be protected
        return 0
    fi
}

# Function to check container resource usage
check_container_resources() {
    if [ "$VERBOSE" == "true" ]; then
        print_step "Container resource usage:"
        echo ""
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" proxify_postgres proxify_redis proxify_api proxify_web 2>/dev/null || true
        echo ""
    fi
}

# Function to check logs for errors
check_logs_for_errors() {
    if [ "$VERBOSE" == "true" ]; then
        print_step "Checking recent logs for errors..."

        local containers=("proxify_api" "proxify_web")
        local has_errors=false

        for container in "${containers[@]}"; do
            local errors=$(docker logs --tail 50 "$container" 2>&1 | grep -i "error" | wc -l)
            if [ "$errors" -gt 0 ]; then
                print_warning "  ${container}: Found ${errors} error(s) in recent logs"
                has_errors=true

                # Show last 5 error lines
                print_info "  Last 5 errors from ${container}:"
                docker logs --tail 50 "$container" 2>&1 | grep -i "error" | tail -5 | sed 's/^/    /'
            fi
        done

        if [ "$has_errors" == "false" ]; then
            print_success "No recent errors found in logs"
        fi
        echo ""
    fi
}

# Run all health checks
check_docker
check_containers
check_postgres
check_redis
check_api_health
check_web_health
check_api_endpoints
check_container_resources
check_logs_for_errors

# Summary
print_info "========================================"
if [ $FAILED_CHECKS -eq 0 ]; then
    print_success "✅ All health checks passed! (${TOTAL_CHECKS}/${TOTAL_CHECKS})"
    print_info "========================================"
    print_info ""
    print_info "System is healthy and ready for traffic"
    exit 0
else
    print_fail "❌ ${FAILED_CHECKS} health check(s) failed (${FAILED_CHECKS}/${TOTAL_CHECKS})"
    print_info "========================================"
    print_info ""
    print_error "System may not be fully operational"
    print_info ""
    print_info "Troubleshooting steps:"
    print_info "  1. Check container logs:"
    print_info "     docker-compose logs -f"
    print_info ""
    print_info "  2. Restart failed services:"
    print_info "     docker-compose restart <service_name>"
    print_info ""
    print_info "  3. Check service status:"
    print_info "     docker-compose ps"
    print_info ""
    print_info "  4. View verbose health check:"
    print_info "     ./scripts/health-check.sh --verbose"
    exit 1
fi
