# Docker Deployment Guide

Complete guide for deploying Proxify services using Docker and Docker Compose.

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- OpenAI API Key

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp packages/agent/.env.example packages/agent/.env

# Edit .env and add your OpenAI API key
nano packages/agent/.env  # or use your preferred editor
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 3. Access Services

- **Agent API**: http://localhost:8000
- **MCP Server**: http://localhost:3000 (internal)
- **API Documentation**: http://localhost:8000/docs

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Chat with agent
curl -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best yields for USDC on Ethereum?"}'
```

---

## Services Architecture

```
┌─────────────────────────────────────┐
│      Client (Your Application)      │
└──────────────┬──────────────────────┘
               │ HTTP
               ▼
┌─────────────────────────────────────┐
│      Yield Optimizer Agent          │
│      (FastAPI on port 8000)         │
│                                     │
│  - POST /agent - Chat endpoint      │
│  - GET /health - Health check       │
│  - GET /docs - API documentation    │
└──────────────┬──────────────────────┘
               │ HTTP (internal)
               ▼
┌─────────────────────────────────────┐
│         MCP Server                  │
│      (Node.js on port 3000)         │
│                                     │
│  - 22 DeFi tools (AAVE, Compound,  │
│    Morpho, Aggregator, Optimizer)   │
└─────────────────────────────────────┘
               │
               ▼
    [Blockchain RPCs & APIs]
```

---

## Individual Service Builds

### Build Agent Only

```bash
cd agent
docker build -t proxify-agent .
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your_key_here \
  -e MCP_SERVER_URL=http://mcp-server:3000 \
  proxify-agent
```

### Build MCP Server Only

```bash
cd mcp
docker build -t proxify-mcp-server .
docker run -p 3000:3000 proxify-mcp-server
```

---

## Docker Compose Commands

### Start Services

```bash
# Start in foreground
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start specific service
docker-compose up agent
docker-compose up mcp-server
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f agent
docker-compose logs -f mcp-server

# Last 100 lines
docker-compose logs --tail=100
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build agent
```

### Execute Commands

```bash
# Shell into agent container
docker-compose exec agent sh

# Shell into MCP server container
docker-compose exec mcp-server sh

# Run Python command in agent
docker-compose exec agent python -c "import sys; print(sys.version)"
```

---

## Environment Variables

### Agent Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | ✅ Yes |
| `MCP_SERVER_URL` | MCP server URL | `http://mcp-server:3000` | No |
| `API_HOST` | API bind host | `0.0.0.0` | No |
| `API_PORT` | API bind port | `8000` | No |
| `LANGCHAIN_TRACING_V2` | Enable LangChain tracing | `false` | No |
| `LANGSMITH_API_KEY` | LangSmith API key | - | No |

### MCP Server

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Node environment | `production` | No |
| `PORT` | Server port | `3000` | No |
| `HOST` | Server host | `0.0.0.0` | No |

---

## Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml proxify

# List services
docker service ls

# Scale agent service
docker service scale proxify_agent=3

# View logs
docker service logs -f proxify_agent
```

### Using Kubernetes

Convert docker-compose.yml to Kubernetes manifests:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert to k8s
kompose convert -f docker-compose.yml
```

---

## Troubleshooting

### Agent Can't Connect to MCP Server

**Symptoms**: Health check shows `mcp_connected: false`

**Solutions**:
1. Check if MCP server is running:
   ```bash
   docker-compose ps mcp-server
   docker-compose logs mcp-server
   ```

2. Verify network connectivity:
   ```bash
   docker-compose exec agent ping mcp-server
   ```

3. Check MCP_SERVER_URL environment variable:
   ```bash
   docker-compose exec agent env | grep MCP_SERVER_URL
   ```

### OpenAI API Errors

**Symptoms**: Agent returns 503 errors

**Solutions**:
1. Verify API key is set:
   ```bash
   docker-compose exec agent env | grep OPENAI_API_KEY
   ```

2. Check if key is valid:
   ```bash
   # The key should start with "sk-proj-" or "sk-"
   ```

3. Restart agent after updating .env:
   ```bash
   docker-compose restart agent
   ```

### Port Already in Use

**Symptoms**: Error binding to port 3000 or 8000

**Solutions**:
1. Check what's using the port:
   ```bash
   lsof -i :8000
   lsof -i :3000
   ```

2. Change ports in docker-compose.yml:
   ```yaml
   ports:
     - "8001:8000"  # Use port 8001 instead
   ```

### Container Keeps Restarting

**Symptoms**: Service status shows "Restarting"

**Solutions**:
1. View logs to identify error:
   ```bash
   docker-compose logs --tail=50 agent
   ```

2. Common issues:
   - Missing OPENAI_API_KEY
   - MCP server not responding
   - Port conflicts

---

## Performance Optimization

### Build Cache

```bash
# Use buildkit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose build
```

### Resource Limits

Add to docker-compose.yml:

```yaml
services:
  agent:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Multi-stage Build Optimization

The Dockerfiles already use multi-stage builds to minimize image size:

- **Agent Image**: ~200MB (vs ~1GB without multi-stage)
- **MCP Server Image**: ~150MB (vs ~800MB without multi-stage)

---

## Security Best Practices

1. **Never commit .env files** with real API keys
2. **Use secrets** in production (Docker Swarm secrets or K8s secrets)
3. **Run as non-root user** (already configured in Dockerfiles)
4. **Scan images** for vulnerabilities:
   ```bash
   docker scan proxify-agent
   docker scan proxify-mcp-server
   ```
5. **Use specific image tags** instead of `latest` in production
6. **Enable read-only root filesystem** where possible
7. **Limit network exposure** using internal networks

---

## Monitoring

### Health Checks

Both services include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8000/health
```

### Logs

Logs are sent to stdout/stderr and can be collected by:
- Docker logging drivers (json-file, syslog, journald)
- Log aggregation tools (ELK, Splunk, Datadog)

### Metrics

Add Prometheus exporters:

```yaml
services:
  agent:
    environment:
      - PROMETHEUS_MULTIPROC_DIR=/tmp
    volumes:
      - prometheus-data:/tmp
```

---

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker-compose down --rmi all

# Remove volumes
docker-compose down -v

# Full cleanup (containers, networks, volumes, images)
docker-compose down -v --rmi all --remove-orphans

# Prune unused Docker resources
docker system prune -a --volumes
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
