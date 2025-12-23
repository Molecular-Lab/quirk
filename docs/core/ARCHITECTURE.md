# System Architecture

## Overview

Quirk is a B2B2C Earn-as-a-Service platform. Businesses embed our SDK to offer DeFi yield to their users through custodial wallet infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│  QUIRK PLATFORM                                             │
│  Dashboard, B2B API, DeFi Protocol Layer                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS CLIENT                                            │
│  Embeds @quirk/sdk, custom branding, user management        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  END-USER                                                   │
│  White-label wallet, portfolio dashboard, fiat on-ramp     │
└─────────────────────────────────────────────────────────────┘
```

## Clean Architecture

### Layer Structure

```
Router (HTTP) → Service → UseCase → Repository
```

| Layer | Location | Purpose |
|-------|----------|---------|
| **Repository** | `packages/core/repository/` | Database operations (SQLC-generated) |
| **UseCase** | `packages/core/usecase/` | Business logic, validation |
| **Service** | `apps/b2b-api/src/service/` | DTO mapping, orchestration |
| **Router** | `apps/b2b-api/src/router/` | HTTP handlers (ts-rest) |

### Key Repositories
- `client.repository.ts` — Client organizations
- `vault.repository.ts` — Client vaults
- `end_user.repository.ts` — End-users
- `deposit.repository.ts` — Deposits
- `withdrawal.repository.ts` — Withdrawals

### Key UseCases
- `client.usecase.ts` — Client management, metrics
- `user-vault.usecase.ts` — Vault operations, index tracking
- `deposit.usecase.ts` — Deposit processing
- `withdrawal.usecase.ts` — Withdrawal processing

## Database Schema

### Core Tables

**`client_organizations`** — Business clients
- Product ID, company name, Privy wallet
- Revenue shares, fee configuration
- Idle balance, earning balance
- Growth index tracking

**`client_vaults`** — One vault per chain/token
- Current growth index
- Total deposits, cumulative yield
- Strategy configuration

**`end_user_vaults`** — Individual positions
- Deposit amount, entry index
- Current value via index calculation

**`deposit_transactions`** / **`withdrawal_transactions`**
- Order tracking, status, amounts

## Index-Based Accounting

Track individual balances in pooled custody using a growth index.

### Formula

```typescript
userValue = (depositAmount × currentIndex) / entryIndex
```

### Example

```typescript
// Vault index: 1.05 (5% growth)
// User deposited $100 at index 1.02

currentValue = (100 × 1.05) / 1.02 = $102.94
```

### Index Update

```
1. Vault earns $50 yield
2. Total AUM: $10,000
3. New index = 1.0 × (1 + 50/10000) = 1.005
4. All user balances increase proportionally
```

### DCA Support

Multiple deposits use weighted entry index:

```typescript
// First: $100 at index 1.0
// Second: $50 at index 1.05
weightedEntry = ((100 × 1.0) + (50 × 1.05)) / 150 = 1.0167
```

## Authentication

### Dual Auth Pattern

| Method | Header | Use Case |
|--------|--------|----------|
| API Key | `X-API-Key: prod_pk_xxx` | SDK integration |
| Privy Session | `X-Privy-Org-ID: did:privy:...` | Dashboard access |

### API Key Flow
```
1. Client registers → Receives pk_live_xxxxx
2. Request with X-API-Key header
3. Middleware validates (bcrypt hash)
4. Proceed or 401
```

### Privy Session Flow
```
1. User logs in via Privy
2. Session token in X-Privy-Org-ID header
3. Middleware validates account
4. Check organization access
5. Proceed or 401
```

## DeFi Integration

### Supported Protocols

| Protocol | Risk | Location |
|----------|------|----------|
| AAVE V3 | Low | `packages/yield-engine/` |
| Compound V3 | Low | `packages/yield-engine/` |
| Morpho | Medium | `packages/yield-engine/` |

### Adapter Pattern

```typescript
interface IProtocolAdapter {
  getSupplyAPY(token: string, chainId: number): Promise<string>
  getBorrowAPY(token: string, chainId: number): Promise<string>
  getMetrics(token: string, chainId: number): Promise<ProtocolMetrics>
}
```

### Strategy Types
- **Conservative** — 60% AAVE, 25% Compound, 15% Morpho
- **Moderate** — Balanced allocation
- **Morpho** — Morpho-focused
- **Custom** — Client-defined weights

## Security

### Measures
- Privy MPC wallet custody (non-custodial for Quirk)
- API key hashing (bcrypt)
- Rate limiting (100 req/min)
- Index growth cap (max 2× per update)
- Audit logging
- Emergency pause

### Chain Support
- Ethereum Mainnet (1)
- Base (8453)
- Sepolia Testnet (11155111)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 22+, TypeScript |
| API | Express 5 + ts-rest |
| Database | PostgreSQL 15+ |
| Types | SQLC (SQL → TypeScript) |
| Blockchain | Viem |
| Wallets | Privy SDK (MPC) |
| Frontend | React 19, Vite 6, TailwindCSS 4 |
| Monorepo | TurboRepo + PNPM |
