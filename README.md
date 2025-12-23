# Quirk

**Earn-as-a-Service Platform** — Enable any app to offer DeFi yield without building crypto infrastructure.

## Overview

Quirk is a B2B2C infrastructure platform that lets businesses embed DeFi yield into their applications. Users earn yield on idle funds wherever they spend money—fintech apps, freelance platforms, creator communities, or e-commerce sites.

```
Business → Embeds SDK → Users Deposit → Custodial Wallet → DeFi Protocols → Yield Distribution
```

**Value Proposition:**
- **Businesses:** Add yield features in weeks. Earn revenue from user balances with zero crypto expertise.
- **End-Users:** Earn 3-5% APY on idle funds automatically.
- **Platform:** 0.5% AUM fee + revenue share on yield.

## Project Structure

```
quirk/
├── apps/
│   ├── b2b-api/              # Main API (Express + ts-rest)
│   ├── whitelabel-web/       # Dashboard (React + Vite)
│   ├── mock-erc20/           # Test tokens (Hardhat)
│   ├── agent/                # AI yield agent
│   └── mcp/                  # MCP server
├── packages/
│   ├── core/                 # Business logic (entities, usecases, repositories)
│   ├── b2b-api-core/         # API contracts (ts-rest + Zod)
│   ├── b2b-sdk/              # Customer SDK
│   ├── sqlcgen/              # Generated database types
│   └── yield-engine/         # DeFi protocol adapters
├── database/
│   ├── migrations/           # PostgreSQL schema
│   └── queries/              # SQLC queries
└── docs/
    └── core/                 # Documentation
```

## Quick Start

### Prerequisites
- Node.js 22+
- PNPM 9+
- PostgreSQL 15+
- Docker (optional)

### Setup

```bash
# Install dependencies
pnpm install

# Start databases
docker-compose up -d postgres redis

# Run migrations
make db-migrate

# Generate types
make sqlc-generate

# Start development
make dev
```

### Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start all services |
| `make dev-api` | Start API only |
| `make dev-web` | Start web only |
| `make db-migrate` | Run migrations |
| `make db-rollback` | Rollback migration |
| `make sqlc-generate` | Generate TypeScript from SQL |
| `make build` | Production build |

## Architecture

### Clean Architecture Layers

```
Router (HTTP) → Service → UseCase (Business Logic) → Repository (Database)
```

### Key Concepts

**Index-Based Accounting:** Track individual balances in pooled custody using a growth index (similar to Compound's cToken).

```typescript
userValue = (depositAmount × currentIndex) / entryIndex
```

**Dual Authentication:**
- API Key (`X-API-Key`) — For SDK integration
- Privy Session (`X-Privy-Org-ID`) — For dashboard access

### DeFi Integration

Supported protocols via `packages/yield-engine/`:
- AAVE V3 (Low risk)
- Compound V3 (Low risk)
- Morpho (Medium risk)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | TypeScript, Express 5, ts-rest |
| Database | PostgreSQL 15+, SQLC |
| Frontend | React 19, Vite 6, TailwindCSS 4 |
| Blockchain | Viem, Privy MPC Wallets |
| Monorepo | TurboRepo, PNPM |

## Documentation

See [`docs/core/`](./docs/core/) for detailed documentation:

- **ARCHITECTURE.md** — System design, data flow, security
- **BUSINESS.md** — Market strategy, revenue model, compliance

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/quirk_dev"

# Privy (MPC Wallets)
PRIVY_APP_ID="your-app-id"
PRIVY_APP_SECRET="your-app-secret"

# Blockchain
MAINNET_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/..."
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/..."
```

See `.env.example` for all variables.

## License

Proprietary — Molecular Lab
