# DeFi Liquidity Aggregator

**B2B API infrastructure for embedded DeFi yield** - "Stripe for DeFi Yield"

> 📚 **Full documentation:** See [`/docs`](./docs) directory | **Quick start:** See [`CLAUDE.md`](./CLAUDE.md)

## Quick Links

- **[Project Overview](./docs/business/OVERVIEW.md)** - Business model & value proposition
- **[Architecture](./docs/architecture/SYSTEM_DESIGN.md)** - Technical system design
- **[Smart Contracts](./docs/architecture/SMART_CONTRACTS.md)** - Contract implementation guide
- **[Security](./docs/technical/SECURITY.md)** - Security requirements & risk management
- **[Implementation](./docs/technical/IMPLEMENTATION_CHECKLIST.md)** - Week-by-week build plan

## Project Structure

```
laac/
├── apps/
│   ├── liquidity-aggregator-contract/   # Smart contracts (Hardhat)
│   └── web/                              # Frontend (Vite + React)
├── server/                               # Backend services (Go)
├── docs/                                 # All documentation
│   ├── business/                         # Business strategy & GTM
│   ├── architecture/                     # Technical architecture
│   ├── technical/                        # Implementation guides
│   └── contracts/                        # Contract-specific docs
├── CLAUDE.md                             # Quick project reference
└── README.md                             # This file
```

## Current Phase: MVP (Phase 1)

- **Goal:** Validate demand with $500k TVL cap
- **Timeline:** 8-10 weeks
- **Budget:** $35k
- **Target:** 3 paying customers

See [GTM Strategy](./docs/business/GTM_STRATEGY.md) for complete roadmap.

## Development Standards

All code follows production-grade patterns from `~/.claude/CLAUDE.md`:

- Go monorepo with workspace
- SQLC for type-safe database operations
- Fiber v2 for HTTP services
- React + Vite + TypeScript for frontend

---
