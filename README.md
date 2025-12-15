# Quirk

**Earn-as-a-Service Platform** - "Stripe for DeFi Yield + Plaid for Earn-in-App"

> 📚 **Documentation:** See [`docs/core/`](./docs/core/) | **Business Plan:** See [`PRODUCT_OWNER_FLOW.md`](./PRODUCT_OWNER_FLOW.md) | **Quick Start:** See [`QUICK_START.md`](./QUICK_START.md)

## What is Quirk?

Quirk is an Earn-as-a-Service infrastructure platform enabling businesses to embed DeFi yield into their apps without building crypto infrastructure or handling compliance. Users earn yield on their idle cash anywhere—in fintech apps, on freelance platforms, in creator communities, or e-commerce sites.

**Core Value Proposition:**
- 🏦 **For Businesses:** Add yield features in weeks, not months. Earn revenue from user balances with zero crypto expertise required.
- 💰 **For End-Users:** Earn 3-5% APY on idle funds automatically, wherever they use money.
- 🎨 **For Quirk:** 0.5% AUM platform fee + revenue share on yield generated

**How It Works:**
```
Business embeds @quirk/sdk → End-users deposit fiat →
Privy MPC custody pool → USDC stablecoin →
DeFi protocols (AAVE, Compound, Morpho) → Yield earned →
Index-based distribution → User sees earnings
```

**Target Customers:**
- 🏦 Fintech apps & neo-banks (yield on user balances)
- 👨‍💼 Freelance platforms (escrow funds earn while pending)
- 🎨 Creator platforms (revenue earns until withdrawal)
- 🛍️ E-commerce platforms (seller pending payouts generate yield)

## 📚 Core Documentation

All documentation consolidated into **5 essential files in [`docs/core/`](./docs/core/)**:

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[ARCHITECTURE.md](./docs/core/ARCHITECTURE.md)** | System design, clean architecture, index-based accounting | 15 min |
| **[BUSINESS.md](./docs/core/BUSINESS.md)** | Product vision, market analysis, revenue model, licensing | 20 min |
| **[IMPLEMENTATION.md](./docs/core/IMPLEMENTATION.md)** | Setup guides, database config, core flows, authentication | 25 min |
| **[QUICK_REFERENCE.md](./docs/core/QUICK_REFERENCE.md)** | Concepts, commands, protocols, troubleshooting | 10 min |
| **[APP_SPECIFIC_GUIDES.md](./docs/core/APP_SPECIFIC_GUIDES.md)** | App/package implementation details (VaultId, Privy, DeFi, MockUSDC, Auth) | 15 min |

**Start Here:** Read in order: Architecture → Business → Implementation → Quick Reference → App Guides

## 📖 Additional Resources

- **[⭐ Full Product Vision](./PRODUCT_OWNER_FLOW.md)** - Complete business plan & customer stories
- **[🚀 Quick Start Setup](./QUICK_START.md)** - Database + Privy configuration guide
- **[🎓 Project Context](./CLAUDE.md)** - Development standards & patterns

## 🏗️ Project Structure

```
quirk/
├── 📚 docs/core/
│   ├── ARCHITECTURE.md           # System design & clean architecture
│   ├── BUSINESS.md               # Market, revenue, compliance
│   ├── IMPLEMENTATION.md         # Setup & core flows
│   ├── QUICK_REFERENCE.md        # Concepts, commands, troubleshooting
│   └── APP_SPECIFIC_GUIDES.md    # App/package implementation details
├── PRODUCT_OWNER_FLOW.md         # Full product vision
├── QUICK_START.md                # Setup guide
├── CLAUDE.md                     # Development standards
├── apps/
│   ├── b2b-api/                 # Main API service (TypeScript + Express + ts-rest)
│   ├── whitelabel-web/          # Customer dashboard (React + Vite)
│   └── mock-erc20/              # Test ERC-20 tokens (Hardhat)
├── packages/
│   ├── core/                    # Clean architecture (entities, usecases, repositories)
│   ├── b2b-api-core/            # ts-rest API contracts
│   ├── b2b-sdk/                 # Customer SDK (@quirk/sdk)
│   ├── sqlcgen/                 # SQLC-generated types
│   ├── yield-engine/            # DeFi protocol integration (AAVE, Compound, Morpho)
│   └── ui/                      # Shared React components
├── database/
│   ├── migrations/              # PostgreSQL schema
│   └── queries/                 # SQLC query definitions
└── docker-compose.yml           # Development environment
```

## 🎯 Current Phase: MVP (V4)

**Goal:** Launch Earn-as-a-Service platform with AI-powered yield strategies

**Status:** 🚀 In Development

**Completed:**
- ✅ Client registration & onboarding via Quirk Dashboard
- ✅ Privy Server-Side MPC Wallets (custodial infrastructure)
- ✅ Index-based accounting system (pools + individual balances)
- ✅ DeFi protocol integration (AAVE, Compound, Morpho)
- ✅ AI-powered yield strategies (Conservative, Moderate, Morpho, Custom)
- ✅ Dual authentication (API Key for SDK + Privy Session for Dashboard)
- ✅ TypeScript full-stack (ts-rest, React, TailwindCSS)

**In Progress:**
- 🔄 On/Off ramp integration (TransFi, ZeroHash, Bridge, Magic)
- 🔄 White-label dashboard analytics
- 🔄 Production deployment setup

**Success Metrics:**
- 3+ pilot clients onboarded
- $50M+ AUM
- 3-5% average APY sustained

See [`docs/core/IMPLEMENTATION.md`](./docs/core/IMPLEMENTATION.md) for technical details.

## 🛠️ Tech Stack

**Backend:**
- **Language:** TypeScript (Node.js 22+)
- **Framework:** Express 5 + ts-rest
- **Database:** PostgreSQL 15+ with SQLC type generation
- **Blockchain:** Viem (Ethereum SDK)
- **Wallet:** Privy SDK (MPC custodial wallets)

**Frontend:**
- **Framework:** React 19 + TypeScript
- **Build:** Vite 6
- **Router:** TanStack Router
- **State:** React Query + Zustand
- **UI:** Radix UI + TailwindCSS 4 + shadcn/ui

**DevOps:**
- **Monorepo:** TurboRepo + PNPM workspaces
- **Containers:** Docker + Docker Compose
- **Migrations:** golang-migrate
- **Code Generation:** SQLC (SQL → TypeScript types)

## 📖 Quick Links

```bash
# Development
make dev                      # Start all services
make db-start                 # Start PostgreSQL + Redis
make db-migrate               # Run database migrations
make sqlc-generate            # Generate types from SQL

# Testing
make test                     # Run all tests

# Production
make build                    # Build for production
docker-compose up -d          # Run production environment
```

See [`docs/core/QUICK_REFERENCE.md`](./docs/core/QUICK_REFERENCE.md) for complete command reference.

## 🔐 Security

- ✅ Privy MPC wallet custody (non-custodial for Quirk)
- ✅ API key authentication with bcrypt hashing
- ✅ Rate limiting (100 req/min per API key)
- ✅ Index growth safety checks (max 2× per update)
- ✅ Audit logging for all transactions
- ✅ Emergency pause functionality

See [`docs/core/ARCHITECTURE.md`](./docs/core/ARCHITECTURE.md#-security-architecture) for security details.

## 📜 License

**Proprietary** - Protocolcamp

---

**Last Updated:** 2025-12-11
**Version:** 4.0 - Quirk: Earn-as-a-Service Platform
**Status:** MVP Development
**Docs:** Consolidated in [`docs/core/`](./docs/core/)
