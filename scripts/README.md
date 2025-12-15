# Deployment Scripts

This directory contains automated scripts for building, deploying, and managing the Proxify application.

## Available Scripts

### 🏗️ docker-build.sh
**Purpose**: Build production Docker images for b2b-api and whitelabel-web services.

**Usage**:
```bash
# Build with default version (latest)
./scripts/docker-build.sh

# Build with specific version
./scripts/docker-build.sh v1.0.0

# Build with custom registry
DOCKER_REGISTRY=docker.io DOCKER_USERNAME=yourname ./scripts/docker-build.sh
```

**Features**:
- Multi-stage builds for optimized image size
- TurboRepo pruning for monorepo optimization
- Parallel builds for faster execution
- Build metadata labels (version, git commit, build date)

**Output**: Docker images tagged with version and `latest`

---

### 📤 docker-push.sh
**Purpose**: Push built Docker images to Docker Hub registry.

**Usage**:
```bash
# Push with default version (latest)
DOCKER_USERNAME=yourname ./scripts/docker-push.sh

# Push with specific version
DOCKER_USERNAME=yourname ./scripts/docker-push.sh v1.0.0
```

**Prerequisites**:
- Docker Hub account
- Docker login: `docker login`
- Images must be built first

**Output**: Images available on Docker Hub at `docker.io/yourname/proxify-*`

---

### 🚀 deploy.sh
**Purpose**: Complete deployment workflow with automatic rollback on failure.

**Usage**:
```bash
# Deploy to production
DOCKER_USERNAME=yourname ./scripts/deploy.sh production

# Deploy to staging
DOCKER_USERNAME=yourname ./scripts/deploy.sh staging
```

**What it does**:
1. ✅ Pre-deployment validation
2. ✅ Database backup
3. ✅ Pull latest images
4. ✅ Run database migrations
5. ✅ Start services with zero-downtime
6. ✅ Run health checks
7. ✅ Automatic rollback if health checks fail

**Environment**: Requires `.env.production` or `.env.staging` file

---

### ✅ health-check.sh
**Purpose**: Verify all services are running and healthy.

**Usage**:
```bash
# Basic health check
./scripts/health-check.sh

# Verbose mode (shows logs, resource usage, errors)
./scripts/health-check.sh --verbose
```

**Checks**:
- Docker daemon status
- Container status (running/healthy)
- PostgreSQL connectivity
- Redis connectivity
- API health endpoint (HTTP 200)
- Frontend health endpoint (HTTP 200)
- Resource usage (verbose mode)
- Recent error logs (verbose mode)

**Exit Codes**:
- `0`: All checks passed
- `1`: One or more checks failed

---

### 🖥️ setup-vps.sh
**Purpose**: One-command VPS setup for new servers.

**Usage**:
```bash
# Run on a fresh Ubuntu server
sudo bash scripts/setup-vps.sh
```

**What it installs**:
- Docker & Docker Compose
- Essential system packages
- Security configurations
- Firewall rules

---

## Quick Start Guide

### 1️⃣ First Time Setup

```bash
# Clone repository
git clone https://github.com/your-org/proxify.git
cd proxify

# Configure environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# Set Docker Hub username
export DOCKER_USERNAME=your_dockerhub_username
```

### 2️⃣ Build & Push Images

```bash
# Build Docker images
./scripts/docker-build.sh v1.0.0

# Login to Docker Hub
docker login

# Push to Docker Hub
./scripts/docker-push.sh v1.0.0
```

### 3️⃣ Deploy to Server

```bash
# SSH into server
ssh your-user@your-server-ip

# Clone repository (if not already done)
git clone https://github.com/your-org/proxify.git
cd proxify

# Configure environment
cp .env.production.example .env.production
nano .env.production

# Deploy
DOCKER_USERNAME=your_dockerhub_username \
VERSION=v1.0.0 \
./scripts/deploy.sh production
```

### 4️⃣ Verify Deployment

```bash
# Run health checks
./scripts/health-check.sh --verbose

# View logs
docker-compose logs -f

# Check running services
docker-compose ps
```

---

## Environment Variables

All scripts support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKER_REGISTRY` | `docker.io` | Container registry URL |
| `DOCKER_USERNAME` | `yourname` | Docker Hub username (required) |
| `VERSION` | `latest` | Image version tag |
| `PARALLEL_BUILDS` | `true` | Build services in parallel |

**Example**:
```bash
DOCKER_REGISTRY=docker.io \
DOCKER_USERNAME=mycompany \
VERSION=v2.0.0 \
./scripts/docker-build.sh
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Images
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
        run: ./scripts/docker-build.sh ${{ github.sha }}

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Push Images
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
        run: ./scripts/docker-push.sh ${{ github.sha }}

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/proxify
            git pull origin main
            DOCKER_USERNAME=${{ secrets.DOCKER_USERNAME }} \
            VERSION=${{ github.sha }} \
            ./scripts/deploy.sh production
```

---

## Troubleshooting

### Build Fails

```bash
# Check Docker is running
docker info

# Check disk space
df -h

# Clean up Docker system
docker system prune -af

# Rebuild with no cache
docker-compose build --no-cache
```

### Push Fails

```bash
# Verify login
docker info | grep Username

# Re-login
docker logout
docker login

# Check image exists locally
docker images | grep proxify
```

### Deployment Fails

```bash
# Check logs
docker-compose logs -f

# Run health check
./scripts/health-check.sh --verbose

# Manual rollback
docker-compose down
docker-compose up -d

# View specific service logs
docker logs proxify_api --tail 100
```

---

## Best Practices

1. **Always test in staging first**
   ```bash
   ./scripts/deploy.sh staging
   ```

2. **Use version tags for production**
   ```bash
   ./scripts/docker-build.sh v1.0.0
   ./scripts/docker-push.sh v1.0.0
   ```

3. **Run health checks after deployment**
   ```bash
   ./scripts/health-check.sh --verbose
   ```

4. **Backup before major updates**
   ```bash
   docker exec proxify_postgres pg_dump -U postgres proxify > backup.sql
   ```

5. **Monitor logs during deployment**
   ```bash
   docker-compose logs -f
   ```

---

## Support

For issues or questions:
- See: [DEPLOYMENT.md](../DEPLOYMENT.md) for full deployment guide
- Check logs: `docker-compose logs -f`
- Run health check: `./scripts/health-check.sh --verbose`

---

**Last Updated**: December 2024
