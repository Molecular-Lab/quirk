# Proxify - White-Label DeFi Yield Platform

> **For complete product vision, see `PRODUCT_OWNER_FLOW.md`** | **For coding standards, see `~/.claude/CLAUDE.md` (Go monorepo best practices)**

## 🎯 Quick Reference

**What We're Building:** B2B2C white-label DeFi yield platform for apps with idle user cash

**Core Model:**
- Product Owners register → Get custodial wallet + SDK
- Embed SDK in their app → End-users deposit fiat → USDC
- Pooled custodial funds → DeFi protocols (AAVE, Curve, Compound, Uniswap)
- Index-based accounting → Fair yield distribution → White-label dashboard

**Target:** E-commerce, Streaming, Freelancer, Gaming, Subscription platforms

## 📚 Documentation Structure

```
/
├── PRODUCT_OWNER_FLOW.md           # ⭐ COMPLETE BUSINESS PLAN (READ THIS FIRST)
├── QUICK_START.md                  # Database + Privy setup guide
├── /docs
│   ├── WORK_STYLE.md               # Agent-first execution strategy
│   ├── /business
│   │   ├── IDEA_VALIDATION.md      # Market validation
│   │   └── LICENSE_REQUIREMENTS.md # Payment licensing
│   ├── /technical
│   │   ├── SECURITY.md             # Security requirements
│   │   └── ON_OFF_RAMP_INTEGRATION.md # Fiat on-ramp guide
│   └── /archive                    # Old versions (V1, V2, V3)
└── /apps/proxify-contract          # V2 smart contract code (archived)
```

## 🚀 Current Phase: V4 - White-Label DeFi Platform

**Goal:** Build B2B2C yield platform with custodial pooling

**Key Features:**
- ✅ Client registration & whitelisting
- ✅ Privy custodial wallet per client
- ✅ SDK for embedding (@proxify/sdk)
- ✅ On-ramp: MoonPay/Apple Pay (V1), Internal gateway (V2)
- ✅ Index-based accounting (like vault shares, off-chain)
- ✅ DeFi execution: AAVE, Curve, Compound, Uniswap
- ✅ White-label dashboard (Glider.Fi style UI)
- ✅ AI agent for market insights

**See:** `PRODUCT_OWNER_FLOW.md` for complete details

## 🏗️ Architecture Summary

```
Product Owner Registration
    ↓
Privy Custodial Wallet Created (holds all end-user funds)
    ↓
SDK Embedded in Client App (E-commerce, Streaming, etc.)
    ↓
End-User Deposits: $100 Fiat → 100 USDC
    ↓
Pooled Custody: All users' USDC in one wallet
    ↓
Index-Based Tracking:
    • user_deposits table (PostgreSQL)
    • entry_index (locked at deposit)
    • current_index (grows with yield)
    • value = (balance × current_index) / entry_index
    ↓
DeFi Deployment:
    • 70% AAVE (low risk)
    • 20% Curve (moderate risk)
    • 10% Uniswap (high risk)
    ↓
Yield Distribution: Index grows, all users earn proportionally
    ↓
White-Label Dashboard: Portfolio, Analytics, AI Insights
```

**Key Principle:** Custodial aggregation + Index accounting + No smart contracts (off-chain only)

**See:** `PRODUCT_OWNER_FLOW.md` - Section "Technical Architecture"

## 🔒 Security Priorities

**Phase 1 Must-Haves:**

1. ✅ Client KYB verification
2. ✅ Privy MPC custody (handled by Privy)
3. ✅ Index growth safety checks (max 2× per update)
4. ✅ API key authentication
5. ✅ Rate limiting
6. ✅ Audit logging for all transactions
7. ✅ On-ramp compliance (licensed providers)

**See:** `/docs/technical/SECURITY.md` for complete requirements

## 💡 Core Positioning

```
We ARE:  White-label DeFi yield infrastructure for apps
We're NOT: Direct-to-consumer wallet app

We DO:  Turn idle app balances into yield-generating assets
We DON'T: Compete with end-user wallet apps

Think: Stripe for DeFi yield
```

## 📋 Quick Start

1. **Product Vision:** Read `PRODUCT_OWNER_FLOW.md` (⭐ START HERE)
2. **Database Setup:** Follow `QUICK_START.md` for PostgreSQL + Privy
3. **Index Concept:** Reference `apps/proxify-contract/VAULT_INDEX_EXPLAINED.md` (archived, but concept applies)
4. **Work Style:** Use agent-first execution (`/docs/WORK_STYLE.md`)

## 🎯 Target Clients & Use Cases

1. **E-Commerce Platforms** - Yield on seller pending payouts
2. **Streaming Platforms** - Creator revenue earns until withdrawal
3. **Freelancer Platforms** - Escrow funds earn yield
4. **Gaming Platforms** - Idle in-game balance earns
5. **Subscription SaaS** - Annual billing float earns yield

**Example ROI:**
- Client has $500K AUM (Assets Under Management)
- 7% APY average yield
- Client earns $2,712/month passive income
- Proxify takes 7% yield share + $499 SaaS fee

**See:** `PRODUCT_OWNER_FLOW.md` - Section "Target Clients & Use Cases"

## ⚡ Development Standards

**All code must follow production-grade patterns from `~/.claude/CLAUDE.md`:**

- Go monorepo structure with workspace
- PostgreSQL for index tracking + user deposits
- Fiber v2 for HTTP services
- Viem for DeFi protocol interactions
- React + Vite + TypeScript for white-label dashboard
- TurboRepo + PNPM for builds

## 📜 Version History

- **V1 (Archived):** Smart contract DeFi yield aggregator with on-chain accounting
- **V2 (Archived):** Enhanced V1 with oracle-based index updates
- **V3 (Archived):** Wallet custodial API provider (Privy-based, no DeFi)
- **V4 (Current):** White-label DeFi platform with custodial pooling + index accounting (off-chain)

**Archived Versions:** See `/docs/archive/` for old business models

## 🎓 CODING WORK STYLE (IMPORTANT!)

**When implementing features, Claude should:**

### ❌ DON'T: Complete Everything
- Don't write all the code without explanation
- Don't just "do it for me"
- Don't skip teaching the process

### ✅ DO: Guide & Teach

**1. Before ANY Code:**
```
"I'm going to build [FEATURE]. Here's my plan:

1. [Step 1] - Why: [reason]
2. [Step 2] - Why: [reason]
3. [Step 3] - Why: [reason]

Does this approach make sense? Ready to start?"
```

**2. For Each Step:**
```
"Now we're implementing [STEP].

Here's what YOU need to do:
- [ ] Task 1
- [ ] Task 2

Here's the pattern to follow:
[code example or reference]

Try it yourself first. I'll review when you're done.
If you get stuck on X, here's a hint: [hint]
"
```

**3. When I Get Stuck:**
```
"You tried X and got error Y. Let's debug:

1. Check [specific thing]
2. Common mistake: [pattern]
3. Here's the fix: [explanation + minimal code]

Now YOU apply this fix and tell me what you learned."
```

**4. Code Reviews:**
```
"Good! You implemented X. Here's what to improve:

✅ Good: [what works]
⚠️  Could be better: [what to change]
📚 Learn: [pattern/concept to study]

Want to refactor this part together?"
```

### Teaching Approach

**For Business Logic:** Discuss & plan together
**For Implementation:** Guide with examples, let me code
**For Debugging:** Teach debugging process, not just fix
**For Architecture:** Explain tradeoffs, let me decide

### Exception: When to Complete Code

Only write complete code when:
- Setting up boilerplate (package.json, tsconfig)
- Complex configuration (chains config, ABIs)
- Infrastructure setup (docker, CI/CD)

**Even then:** Explain WHAT and WHY after creating files.

### Example Session

```
User: "Add deposit endpoint"

❌ Bad:
[Creates 5 files with complete code]

✅ Good:
"Let's add deposit endpoint. Here's the plan:
1. Define schema (you do this)
2. Add controller method (I'll guide)
3. Wire to service (you do this)

Start with step 1. What Zod schema do we need for deposit?
Show me your attempt."
```

### Remember

**"No pain, no gain"** - I learn by doing, not watching.

**Your role:** Coach, not coder
**My role:** Student who codes

---

**Last Updated:** 2025-11-12
**Status:** MVP Development
**Version:** 3.0 (Product Shift: Wallet Custodial Provider via Privy)
**V2 Vision:** DeFi Yield Aggregator (archived in `/docs/archive/v2-defi-aggregator/`)
