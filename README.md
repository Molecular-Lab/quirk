# Proxify

**White-Label DeFi Yield Platform** - "Stripe for DeFi Yield"

> 📚 **Full product vision:** See [`PRODUCT_OWNER_FLOW.md`](./PRODUCT_OWNER_FLOW.md) | **Quick start:** See [`QUICK_START.md`](./QUICK_START.md)

## What is Proxify?

Proxify enables apps to turn their users' idle cash into yield-generating assets through a white-label DeFi platform. Product owners embed our SDK, end-users deposit fiat, and funds are pooled into custodial wallets that earn yield from DeFi protocols.

**Core Value Proposition:**
- 🏦 **For Product Owners:** Earn passive income on user balances (e.g., escrow, pending payouts)
- 💰 **For End-Users:** Earn 7%+ APY on idle funds automatically
- 🎨 **For Proxify:** SaaS fees + % of yield generated

**How It Works:**
```
Client Registration → SDK Integration → End-User Deposits (Fiat→USDC) →
Custodial Pool → DeFi Protocols (AAVE, Curve, Compound, Uniswap) →
Yield Distribution (Index-Based) → White-Label Dashboard
```

**Target Clients:**
- E-commerce platforms (seller payouts)
- Streaming platforms (creator revenue)
- Freelancer marketplaces (escrow funds)
- Gaming platforms (in-game balance)
- Subscription SaaS (annual billing float)

## Quick Links

- **[⭐ Product Vision](./PRODUCT_OWNER_FLOW.md)** - Complete business plan (START HERE)
- **[🚀 Quick Start](./QUICK_START.md)** - Database & Privy setup guide
- **[🎓 Work Style](./docs/WORK_STYLE.md)** - Agent-first execution strategy
- **[🔒 Security](./docs/technical/SECURITY.md)** - Security requirements
- **[💸 On-Ramp Integration](./docs/technical/ON_OFF_RAMP_INTEGRATION.md)** - Fiat on-ramp guide

## Project Structure

```
proxify/
├── PRODUCT_OWNER_FLOW.md            # ⭐ Complete product vision
├── QUICK_START.md                   # Database & Privy setup
├── CLAUDE.md                        # Project context
├── packages/
│   ├── core/                        # Shared entities, use cases, repositories
│   │   ├── entity/                  # User, wallet entities
│   │   ├── usecase/                 # Business logic
│   │   ├── repository/              # Privy, user repositories
│   │   ├── datagateway/             # Interface definitions
│   │   └── migrations/              # PostgreSQL migrations
│   └── privy-client/                # Privy SDK wrapper (archived reference)
├── apps/
│   ├── privy-api-test/             # Main API service (Go + Fiber)
│   │   └── src/
│   │       ├── controller/          # HTTP endpoints
│   │       ├── repository/          # PostgreSQL implementation
│   │       └── routes/              # API routes
│   ├── web/                        # White-label dashboard (Vite + React) [TODO]
│   └── proxify-contract/           # V1/V2 smart contracts (archived)
├── docs/
│   ├── business/                   # Market validation, licensing
│   ├── technical/                  # Security, on-ramp integration
│   └── archive/                    # Old versions (V1, V2, V3)
└── docker-compose.yml              # PostgreSQL + pgAdmin
```

## Current Phase: V4 MVP (Phase 1)

**Goal:** Build white-label DeFi yield platform with custodial pooling

**Timeline:** 6-8 weeks
**Target:** 3 pilot clients (E-commerce, Streaming, Freelancer platforms)

**Features:**
- ✅ Client registration & KYB
- ✅ Privy custodial wallet per client
- ✅ SDK for embedding (@proxify/sdk)
- ✅ MoonPay/Apple Pay on-ramp
- ✅ Index-based accounting (PostgreSQL)
- ✅ AAVE deployment (low risk)
- ✅ Basic white-label dashboard
- ✅ Demo app: E-commerce platform

**Success Metrics:**
- 3 pilot clients onboarded
- $50K+ AUM (Assets Under Management)
- 5%+ APY sustained

See [`PRODUCT_OWNER_FLOW.md`](./PRODUCT_OWNER_FLOW.md) for complete implementation plan.

## Development Standards

All code follows production-grade patterns from `~/.claude/CLAUDE.md`:

- Go monorepo with workspace
- SQLC for type-safe database operations
- Fiber v2 for HTTP services
- React + Vite + TypeScript for frontend

---
