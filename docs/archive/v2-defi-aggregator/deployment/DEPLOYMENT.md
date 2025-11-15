# DeFAI Liquidity Aggregator - Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Go 1.23+ (for local development)
- PostgreSQL 15+ (if running locally without Docker)

## Quick Start with Docker

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your actual values
nano .env
```

Required variables:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
- `DEFAI_API_KEY` - API key for DeFAI server authentication

### 2. Build and Run

```bash
# Build all services
make docker-build

# Start all services in detached mode
make docker-up

# Check service status
make docker-status

# View logs
make docker-logs              # All services
make docker-logs-bot          # Telegram bot only
make docker-logs-api          # API core only
```

### 3. Stop Services

```bash
# Stop services
make docker-down

# Stop and remove volumes (clean database)
make docker-clean
```

## Project Structure

```
server/
├── apps/
│   ├── api-core/              # REST API service
│   │   ├── cmd/main.go        # Entry point
│   │   ├── Dockerfile         # API Dockerfile
│   │   └── .dockerignore
│   └── defai-telegram-bot/    # Telegram bot service
│       ├── cmd/main.go        # Entry point
│       ├── handler/           # Bot handlers
│       ├── usecase/           # Business logic
│       ├── internal/config/   # Config loader
│       ├── Dockerfile         # Bot Dockerfile
│       └── .dockerignore
├── common/                    # Shared utilities
├── internal/                  # Internal packages
├── pkg/                       # Public packages
├── config.yaml                # Base configuration (dev)
├── docker-compose.yml         # Docker orchestration
├── .env.example               # Environment template
└── Makefile                   # Build commands
```

## Services

### 1. PostgreSQL Database
- **Container**: `defai-postgres`
- **Port**: `5432`
- **Volume**: `postgres_data`
- **Health Check**: Automated

### 2. API Core
- **Container**: `defai-api-core`
- **Port**: `8080`
- **Depends On**: postgres
- **Restart**: unless-stopped

### 3. Telegram Bot
- **Container**: `defai-telegram-bot`
- **Port**: `8081` (health checks)
- **Depends On**: api-core
- **Restart**: unless-stopped

## Configuration

### Environment Variables (docker-compose)

The application uses environment variables for configuration:

```yaml
# Telegram Bot
TELEGRAM_BOT_BOT_TOKEN         # Bot token from @BotFather
DEFAI_SERVER_API_URL           # Defaults to http://api-core:8080
DEFAI_SERVER_API_KEY           # API authentication key
DEFAI_SERVER_DEBUG             # Enable debug mode (true/false)

# Database
POSTGRES_USER                   # Database user
POSTGRES_PASSWORD               # Database password
POSTGRES_DB                     # Database name

# API Server
API_PORT                        # API server port (default: 8080)
```

### Config File (config.yaml)

Used for local development. In Docker, environment variables override these values.

```yaml
database:
  host: "localhost"
  port: "5432"
  user: "go_monorepo_postgres"
  password: "go_monorepo_password"
  dbname: "go_monorepo_dev"

server:
  port: 8080
  timeout: 30s

telegram_bot:
  bot_token: ""  # Use env var: TELEGRAM_BOT_BOT_TOKEN

defai_server:
  api_url: "http://localhost:8080"
  api_key: "qwer"
```

## Local Development (without Docker)

### Run API Server

```bash
make start-server
```

### Run Telegram Bot

```bash
make start-bot
```

## Makefile Commands

### Local Development
- `make start-server` - Run API server locally
- `make start-bot` - Run Telegram bot locally

### Docker Operations
- `make docker-build` - Build all services
- `make docker-up` - Start all services
- `make docker-down` - Stop all services
- `make docker-restart` - Restart all services
- `make docker-status` - Show service status
- `make docker-logs` - View all logs
- `make docker-logs-api` - View API logs
- `make docker-logs-bot` - View bot logs
- `make docker-clean` - Stop and remove volumes
- `make docker-rebuild` - Rebuild with no cache

### Individual Services
- `make docker-build-api` - Build API only
- `make docker-build-bot` - Build bot only

## Troubleshooting

### Bot can't connect to API
- Check that `DEFAI_SERVER_API_URL=http://api-core:8080` in docker-compose
- Verify api-core is running: `make docker-status`
- Check network: `docker network ls | grep defai`

### Database connection fails
- Check postgres health: `docker logs defai-postgres`
- Verify credentials in .env match docker-compose.yml
- Ensure postgres is healthy before api-core starts

### Config not found
- For Docker: Use environment variables (no config.yaml needed in container)
- For local dev: Ensure `server/config.yaml` exists
- Bot config loader looks 3 levels up: `../../..` from cmd/main.go

### Build fails
- Clear Docker cache: `make docker-rebuild`
- Check Go version: `go version` (need 1.23+)
- Verify all dependencies: `go mod tidy`

## Production Deployment

### Security Checklist
- [ ] Change default database password
- [ ] Set strong `DEFAI_API_KEY`
- [ ] Use secrets management (not .env file)
- [ ] Enable SSL for postgres (`sslmode: require`)
- [ ] Add rate limiting to API
- [ ] Configure firewall rules
- [ ] Use proper logging and monitoring
- [ ] Set up backup for postgres volume

### Recommended Changes
1. Use Docker secrets or vault for sensitive data
2. Set up reverse proxy (nginx) for API
3. Configure SSL/TLS certificates
4. Add health check endpoints
5. Implement log aggregation (ELK, Loki)
6. Set up monitoring (Prometheus, Grafana)
7. Configure auto-restart policies
8. Use private Docker registry

## Network

All services communicate on `defai-network` bridge network:
- postgres:5432 (internal)
- api-core:8080 (exposed to host)
- telegram-bot:8081 (exposed to host)

## Volumes

- `postgres_data` - Persistent database storage

## Health Checks

### PostgreSQL
```bash
docker exec defai-postgres pg_isready -U go_monorepo_postgres
```

### API Core
```bash
curl http://localhost:8080/health
```

### Check All Services
```bash
make docker-status
```

## Logs

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f telegram-bot
docker-compose logs -f api-core
docker-compose logs -f postgres
```

### Export Logs
```bash
docker-compose logs > deployment.log
```

## Backup & Restore

### Backup Database
```bash
docker exec defai-postgres pg_dump -U go_monorepo_postgres go_monorepo_dev > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i defai-postgres psql -U go_monorepo_postgres -d go_monorepo_dev
```

## Updates

### Update a Single Service
```bash
# Rebuild specific service
make docker-build-bot

# Restart only that service
docker-compose restart telegram-bot
```

### Update All Services
```bash
make docker-rebuild
```
