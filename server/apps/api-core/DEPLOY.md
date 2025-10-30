# Deploy API Core with PostgreSQL

## Quick Start

### 1. Setup

```bash
cd server/apps/api-core

# Configure environment
cp .env.example .env
nano .env  # Edit database credentials
```

### 2. Deploy

```bash
# Start API + PostgreSQL
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Check services
docker-compose ps
```

### 3. Configure .env

```env
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=defai_prod
API_PORT=8080
```

## Useful Commands

```bash
# View logs
docker-compose logs -f api-core
docker-compose logs -f postgres

# Restart
docker-compose restart

# Stop
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Database backup
docker exec defai-postgres pg_dump -U your_db_user defai_prod > backup.sql
```
