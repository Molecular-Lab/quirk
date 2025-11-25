# B2B Vault System API Service

> **Index-based custodial vault system with pooled DeFi deployment**

## Overview

This service provides the B2B API for Proxify's vault system, implementing the index-based accounting model described in `INDEX_VAULT_SYSTEM.md`.

### Key Features

✅ **Index-Based Accounting** - Money market fund model with share-based yield distribution  
✅ **Type-Safe Database** - 100% SQLC-generated PostgreSQL queries  
✅ **Multi-Chain Support** - Ethereum, Polygon, BSC, Arbitrum, Optimism, Base  
✅ **Fair Yield Distribution** - Weighted entry index for DCA deposits  
✅ **Production Ready** - Connection pooling, graceful shutdown, audit logging

## Architecture

```
┌─────────────────────────────────────────────────┐
│  B2B API Service (Express)                      │
│  ├─ Client Management API                       │
│  ├─ Deposit Management API                      │
│  ├─ Withdrawal Management API (planned)         │
│  └─ Vault Management API (planned)              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  PostgreSQL Database (SQLC Type-Safe)           │
│  ├─ client_organizations                        │
│  ├─ client_vaults (index tracking)              │
│  ├─ end_users                                    │
│  ├─ end_user_vaults (share accounting)          │
│  ├─ deposit_transactions                         │
│  └─ audit_logs                                   │
└─────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/proxify

# Server
PORT=3002
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm --filter @proxify/database migrate

# Start development server
pnpm --filter @proxify/b2b-api-service dev
```

## API Endpoints

### Client Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/clients` | Create client organization |
| GET | `/api/v1/clients/:productId` | Get client by product ID |
| GET | `/api/v1/clients/:clientId/balance` | Get client balance |
| POST | `/api/v1/clients/:clientId/balance/add` | Add funds to client |
| POST | `/api/v1/clients/:clientId/balance/reserve` | Reserve funds |
| GET | `/api/v1/clients/:clientId/stats` | Get client statistics |
| GET | `/api/v1/clients/active/list` | List active clients |

### Deposit Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/deposits` | Create deposit transaction |
| GET | `/api/v1/deposits/:orderId` | Get deposit by order ID |
| POST | `/api/v1/deposits/:orderId/complete` | Complete deposit |
| POST | `/api/v1/deposits/:orderId/fail` | Mark deposit as failed |
| GET | `/api/v1/deposits/client/:clientId` | List deposits by client |
| GET | `/api/v1/deposits/client/:clientId/user/:userId` | List by user |
| GET | `/api/v1/deposits/client/:clientId/status/:status` | List by status |

## Documentation

- **[INDEX_VAULT_SYSTEM.md](../../INDEX_VAULT_SYSTEM.md)** - Complete vault system flows and formulas
- **[B2B_API_COMPLETE.md](./B2B_API_COMPLETE.md)** - Full API documentation with examples
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation overview

## Technology Stack

- **Express.js** - HTTP server framework
- **PostgreSQL** - Primary database
- **SQLC** - Type-safe SQL query generation
- **TypeScript** - End-to-end type safety
- **Zod** - Runtime validation
- **Winston** - Structured logging

## Development

```bash
# Type check
pnpm --filter @proxify/b2b-api-service type-check

# Build
pnpm --filter @proxify/b2b-api-service build

# Production start
pnpm --filter @proxify/b2b-api-service start
```

## Example Usage

### Create Client

```bash
curl -X POST http://localhost:3002/api/v1/clients \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "grab_pay_prod",
    "companyName": "GrabPay Thailand",
    "businessType": "fintech",
    "privyOrganizationId": "privy_org_grab123"
  }'
```

### Create Deposit

```bash
curl -X POST http://localhost:3002/api/v1/deposits \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "uuid-client-id",
    "userId": "grab_driver_12345",
    "fiatCurrency": "THB",
    "fiatAmount": "10000",
    "cryptoCurrency": "USDC",
    "depositType": "external",
    "gatewayProvider": "bitkub"
  }'
```

### Get User Balance

```bash
curl http://localhost:3002/api/v1/clients/{clientId}/balance
```

## License

Private - Proxify Protocol Camp
