# 🚀 Proxify Deployment Guide

Complete guide for deploying the Proxify B2B2C Earn-as-a-Service platform to production.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Quick Start (VPS)](#quick-start-vps)
5. [Docker Setup](#docker-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Migrations](#database-migrations)
8. [SSL/TLS Setup](#ssltls-setup)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup & Recovery](#backup--recovery)
12. [Troubleshooting](#troubleshooting)
13. [Security Checklist](#security-checklist)

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Internet                      │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Load Balancer  │ (Nginx/Cloudflare)
         │   (SSL/TLS)     │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼───┐
│  Web  │   │   API   │   │ Agent │
│ :3000 │   │  :8080  │   │ :8000 │
└───┬───┘   └────┬────┘   └───┬───┘
    │            │             │
    └────────────┼─────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐   ┌──────▼──────┐
    │Postgres │   │    Redis    │
    │  :5432  │   │    :6379    │
    └─────────┘   └─────────────┘
```

## Prerequisites

- **Server Requirements:**
  - Ubuntu 22.04 LTS or newer
  - Minimum 2 CPU cores
  - 4GB RAM (8GB recommended)
  - 40GB SSD storage
  - Docker 24.0+
  - Docker Compose v2.20+

- **Domain & DNS:**
  - Domain name pointed to server IP
  - SSL certificate (Let's Encrypt recommended)

- **External Services:**
  - Privy account for Web3 authentication
  - Alchemy API key for blockchain RPC
  - OpenAI API key for AI features

## Deployment Options

### Option 1: Single VPS (Recommended for MVP)
- **Cost:** $20-50/month
- **Providers:** DigitalOcean, Linode, Vultr, Hetzner
- **Best for:** Early stage, <1000 users

### Option 2: Container Platform
- **Cost:** $100-300/month
- **Providers:** AWS ECS, Google Cloud Run, Azure Container Instances
- **Best for:** Scaling phase, 1000-10000 users

### Option 3: Kubernetes
- **Cost:** $200-500/month
- **Providers:** AWS EKS, Google GKE, Azure AKS
- **Best for:** High scale, >10000 users

## Quick Start (VPS)

### 1. Setup Server

```bash
# SSH into your server
ssh root@your-server-ip

# Run the setup script
curl -fsSL https://raw.githubusercontent.com/your-org/proxify/main/scripts/setup-vps.sh | sudo bash

# Or clone the repo first
git clone https://github.com/your-org/proxify.git
cd proxify
sudo bash scripts/setup-vps.sh
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production

# Required variables to change:
# - DB_PASSWORD
# - REDIS_PASSWORD
# - PRIVY_APP_ID & PRIVY_APP_SECRET
# - ALCHEMY_API_KEY
# - OPENAI_API_KEY
# - JWT_SECRET & SESSION_SECRET
```

### 3. Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Docker Setup

### Building Images

```bash
# Set your Docker Hub username
export DOCKER_USERNAME=your_dockerhub_username

# Build all images using the optimized build script
./scripts/docker-build.sh

# Or build with specific version tag
./scripts/docker-build.sh v1.0.0

# Manual build with docker-compose
docker-compose -f docker-compose.production.yml build

# Build specific service
docker-compose -f docker-compose.production.yml build b2b-api
```

### Pushing to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push images using the push script
DOCKER_USERNAME=your_dockerhub_username ./scripts/docker-push.sh

# Or push with specific version
DOCKER_USERNAME=your_dockerhub_username ./scripts/docker-push.sh v1.0.0

# Verify on Docker Hub
open https://hub.docker.com/u/your_dockerhub_username
```

### Image Sizes (Optimized with Turbo Prune)
- **b2b-api:** ~200-300MB (vs ~1GB without optimization)
- **whitelabel-web:** ~50-100MB (nginx + static files)

### Running Services

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Start specific service
docker-compose -f docker-compose.production.yml up -d b2b-api

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart service
docker-compose -f docker-compose.production.yml restart b2b-api

# View logs
docker-compose -f docker-compose.production.yml logs -f b2b-api
```

### Health Check Script

```bash
# Run comprehensive health checks
./scripts/health-check.sh

# Run with verbose output (shows logs, resource usage)
./scripts/health-check.sh --verbose
```

## Environment Configuration

### Production Variables

Create `.env.production` with these critical settings:

```bash
# Database (use strong passwords!)
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Security
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Configure for your domain
API_URL=https://api.your-domain.com
VITE_APP_URL=https://app.your-domain.com
CORS_ORIGINS=https://app.your-domain.com
```

### Environment-Specific Files

- `.env.production` - Production environment
- `.env.staging` - Staging environment
- `.env.development` - Local development

## Database Migrations

### Run Migrations

```bash
# Using docker-compose
docker-compose -f docker-compose.production.yml run --rm migrate

# Or manually
docker-compose exec postgres psql -U postgres -d proxify < database/migrations/000001_init_schema.up.sql
docker-compose exec postgres psql -U postgres -d proxify < database/migrations/000002_add_wallet_stages.up.sql
```

### Rollback Migrations

```bash
# Rollback last migration
docker-compose exec postgres psql -U postgres -d proxify < database/migrations/000002_add_wallet_stages.down.sql
```

### Backup Before Migration

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres proxify > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres proxify < backup_20240101_120000.sql
```

## SSL/TLS Setup

### Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal (added automatically)
sudo certbot renew --dry-run
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## CI/CD Pipeline

### GitHub Actions Setup

1. **Add GitHub Secrets:**
   ```
   Settings → Secrets → Actions → New repository secret

   Required secrets:
   - DEPLOY_HOST (your server IP)
   - DEPLOY_USER (deploy)
   - DEPLOY_PATH (/opt/proxify)
   - DEPLOY_SSH_KEY (private SSH key)
   - DOCKER_REGISTRY_TOKEN
   ```

2. **Deployment Workflow:**
   - Automatic deployment on push to `main` (production)
   - Automatic deployment on push to `develop` (staging)
   - Manual deployment via workflow dispatch

### Automated Deployment Script

```bash
# Deploy using automated script (recommended)
cd /opt/proxify
DOCKER_USERNAME=your_dockerhub_username ./scripts/deploy.sh production

# The script will:
# 1. Backup current database
# 2. Pull latest images
# 3. Run migrations
# 4. Start services
# 5. Run health checks
# 6. Rollback automatically if health checks fail
```

### Manual Deployment

```bash
# Or deploy manually
cd /opt/proxify
git pull origin main

# Build images
DOCKER_USERNAME=your_dockerhub_username ./scripts/docker-build.sh

# Push to Docker Hub (if remote deployment)
DOCKER_USERNAME=your_dockerhub_username ./scripts/docker-push.sh

# Deploy
docker-compose -f docker-compose.production.yml pull
docker-compose --profile migrate run --rm migrate
docker-compose -f docker-compose.production.yml up -d

# Verify
./scripts/health-check.sh
```

## Monitoring & Logging

### Application Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs -f b2b-api

# Last 100 lines
docker-compose logs --tail=100 b2b-api
```

### System Monitoring

```bash
# Docker stats
docker stats

# System resources
htop

# Disk usage
df -h

# Database connections
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

### Health Checks

```bash
# API health
curl http://localhost:8080/health

# Frontend health
curl http://localhost:3000/health

# Database health
docker-compose exec postgres pg_isready
```

## Backup & Recovery

### Automated Backups

The `postgres-backup` service in docker-compose runs daily backups:

```yaml
postgres-backup:
  image: prodrigestivill/postgres-backup-local:15-alpine
  environment:
    SCHEDULE: "@daily"
    BACKUP_KEEP_DAYS: 7
  volumes:
    - ./backups:/backups
```

### Manual Backup

```bash
# Full database backup
./scripts/backup.sh

# Backup specific tables
docker-compose exec postgres pg_dump -U postgres -t users -t clients proxify > users_clients_backup.sql
```

### Restore from Backup

```bash
# Stop application
docker-compose down

# Restore database
docker-compose up -d postgres
docker-compose exec -T postgres psql -U postgres proxify < backup_file.sql

# Start application
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check memory
free -m

# Reset and restart
docker-compose down
docker system prune -a
docker-compose up -d
```

#### 2. Database Connection Issues

```bash
# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Check connection count
docker-compose exec postgres psql -U postgres -c "SHOW max_connections;"

# Restart database
docker-compose restart postgres
```

#### 3. High Memory Usage

```bash
# Check container stats
docker stats

# Limit memory in docker-compose.yml
services:
  b2b-api:
    mem_limit: 1g
    memswap_limit: 2g
```

#### 4. Disk Space Issues

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove old logs
truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Remove old backups
find ./backups -mtime +30 -delete
```

## Security Checklist

- [ ] **SSL/TLS enabled** for all public endpoints
- [ ] **Strong passwords** for database and Redis
- [ ] **Environment variables** properly configured
- [ ] **Firewall rules** configured (only required ports open)
- [ ] **SSH key authentication** enabled (password auth disabled)
- [ ] **Regular updates** applied to OS and Docker
- [ ] **Backup strategy** implemented and tested
- [ ] **Rate limiting** configured on API
- [ ] **CORS** properly configured
- [ ] **Secrets rotated** regularly
- [ ] **Monitoring** and alerting configured
- [ ] **Audit logs** enabled and reviewed
- [ ] **Database encryption** at rest enabled
- [ ] **Network segmentation** between services

## Production Readiness Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Backups configured and tested
- [ ] Monitoring setup
- [ ] Rate limiting configured
- [ ] CORS configured
- [ ] Error tracking (Sentry) setup

### Post-Launch
- [ ] Monitor logs for errors
- [ ] Check resource usage
- [ ] Verify backup jobs running
- [ ] Test disaster recovery process
- [ ] Security scan (use Trivy)
- [ ] Performance testing
- [ ] Update documentation

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- GitHub Issues: [github.com/your-org/proxify/issues](https://github.com/your-org/proxify/issues)
- Documentation: [docs.proxify.io](https://docs.proxify.io)

---

**Remember:** Always test deployments in staging before production!