# Quirk - Earn-as-a-Service Platform

> **Earn Anywhere. Save Everywhere.**

## 🎯 What We're Building

**Quirk** is an Earn-as-a-Service platform that allows any business to embed Earn-in-App into their product. We enable end-users to earn yield on their idle cash anywhere, eliminating the traditional barrier that earning has to stay in banking or investment applications.

**Core Model:**
- B2B: Provide rails infrastructure for businesses to offer DeFi yield without building infrastructure or handling compliance
- B2B2C: Enable users to have savings earning yield wherever they use their money (E-commerce, Creators, Freelance, Gaming)
- Privy MPC Wallets → StableCoin (USDC/USDT) → DeFi Protocols (AAVE, Compound, Morpho)
- AI-powered yield strategies (Conservative, Moderate, Morpho, Custom)

**Target:** Fintech apps, Gig Workers/Freelance Platforms, Creator Platforms, E-commerce Platforms

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

## 🎯 Opportunity

- **StableCoin Growth:** StableCoins are accelerating adoption into Traditional Finance systems
- **DeFi Market Validation:** DeFi protocols deliver 3-5% APY on StableCoins with billions in TVL and millions of active wallets, proving real product-market fit
- **Users Trapped in Ecosystems:** Users are increasingly aware of financial management but savings options only exist in banking/investment apps, not where they actually earn income
- **Proven Enterprise Model:** Shopify partners with multiple financial institutions (Yield, Stripe, Fifth Third Bank, Celtic Bank) to enable financial products while focusing on core business
- **$300B+ Idle Cash Waiting:** Across E-commerce merchants, Creators, Gig workers, Freelancers, and Payroll - massive idle cash floating with 0% earnings

## 🎯 Problem

- **Infrastructure Complexity:** Building in-house StableCoin infrastructure requires resources, regulatory compliance, and enterprise-grade treasury management
- **Knowledge Gap:** Even if businesses understand StableCoin & DeFi advantages, implementation requires deep expertise across different financial layers
- **Compliance Nightmare:** Expanding into StableCoin infrastructure means navigating complex regulations

## 💡 Solution

- **B2B:** Earn-as-a-Service providing rails infrastructure allowing any business to offer Earn-in-App, access DeFi yield, and treasury management without building infrastructure or handling compliance
- **B2B2C:** Enable users to feel they can have a savings account earning yield anywhere, eliminating the limitation that earning has to stay in banking/investment applications

## 🚀 Current Development Phase

**Goal:** Build Earn-as-a-Service platform with AI-powered yield strategies

**Key Features:**
- ✅ Client registration & onboarding via Quirk Dashboard
- ✅ Privy MPC custodial wallet (Server-Side Corporate Wallet per client)
- ✅ SDK for embedding (@quirk/sdk)
- ✅ AI Yield Strategy Agent (Conservative, Moderate, Morpho, Custom)
- ✅ DeFi execution: AAVE, Compound, Morpho
- ✅ On/Off ramp integration (TransFi, ZeroHash, Bridge, Magic)
- ✅ White-label dashboard with analytics & AI insights
- ✅ Ledger-based internal accounting (Earn Balance tracking)

## 🏗️ Product Flow

### Phase 1: Client Setup (One-Time)
1. **Client Onboarding:** Client registers on Quirk Dashboard
2. **Wallet Creation:** Quirk (via Privy) creates Server-Side MPC Wallet (Corporate Wallet) for Client
3. **SDK Integration:** Client embeds Quirk SDK in their app

### Phase 2: Yield Strategy Agent
1. **Strategy Selection:** Client chooses from 4 strategies:
   - Conservative (60% AAVE, 25% Compound, 15% Morpho)
   - Moderate (balanced allocation)
   - Morpho (Morpho-focused)
   - Custom (client-defined weights)
2. **Execution:** AI Agent calculates weighted risk distribution across protocols
3. **Storage:** Strategy configuration saved in backend

### Phase 3: User Deposit + Staking (Inflow)
1. **User Action:** User clicks "Deposit $100" in Client App
2. **Ledger Update:** Client App deducts $100 from Fiat Balance → Credits "Earn Balance" (internal DB)
3. **Quirk API Call:** Client sends webhook: `User_Deposit: $100`
4. **On-Ramp:** Client sends funds to wallet via SDK (batch requests to minimize fees)
   - *Demo: Manual on-ramp by client*
5. **DeFi Deployment:** Privy Server SDK signs & executes transactions (USDC/USDT) in batch
   - *Demo: Manual staking by client*

### Phase 4: User Withdrawal (Outflow)
1. **User Action:** User requests "Withdraw $100" → Returns to default app balance
2. **Unstaking:** Client calls Quirk API → Backend unstakes $100 + Gas → Wallet
3. **Off-Ramp:** Wallet USDC → Off-Ramp Provider → Client's registered bank account
   - *Demo: Manual off-ramp by client*

**Key Principle:** Privy MPC Custody + AI Yield Strategies + Ledger-based Accounting

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
We ARE:  Earn-as-a-Service infrastructure for any app
We're NOT: Direct-to-consumer investment app

We DO:  Enable businesses to offer DeFi yield without building infrastructure
We DON'T: Require businesses to handle compliance or treasury management

We ENABLE: Users to earn yield anywhere they use their money
We ELIMINATE: The barrier that earning must stay in banks/investment apps

Think: Stripe for DeFi Yield + Plaid for Earn-in-App
```

## 📋 Quick Start

1. **Product Vision:** Read `PRODUCT_OWNER_FLOW.md` (⭐ START HERE)
2. **Database Setup:** Follow `QUICK_START.md` for PostgreSQL + Privy
3. **Index Concept:** Reference `apps/proxify-contract/VAULT_INDEX_EXPLAINED.md` (archived, but concept applies)
4. **Work Style:** Use agent-first execution (`/docs/WORK_STYLE.md`)

## 🎯 Target Clients & Use Cases

1. **Fintech Apps** - Embedded yield for user balances
2. **Gig Workers/Freelance Platforms** - Escrow funds earn yield until payout
3. **Creators Platforms** - Creator revenue earns until withdrawal
4. **E-commerce Platforms** - Seller pending payouts generate yield

**Customer Personas:** [View on Miro](https://miro.com/app/board/uXjVJoTZufk=/)

## 💵 Business Model

**Revenue Streams:**
- **Platform Fees:** ~1.5% AUM (Assets Under Management)
- **Performance Fees:** 10% of APY generated
- **AI/Data Subscription:** Market analysis & DeFi insights (long-term)

**Example ROI:**
- Client has $500K AUM
- 5% APY average yield = $25K/year
- Client earns yield on idle cash
- Quirk earns: Platform fees (~$7.5K) + Performance fees ($2.5K) = ~$10K/year per client

## 💵 Regulatory Compliance (Singapore)

### Required Licenses

1. **MPIL (Major Payment Institution License)**
   - Covers: Custody + On/Off ramp + Transfer
   - Cost: ~$300-400K
   - Reference: [MAS MPIL License](https://www.mas.gov.sg/regulation/payments/major-payment-institution-licence)
   - Legal Doc: [Payment Services Act 2019](https://sso.agc.gov.sg/Act/PSA2019)

2. **CMS (Capital Markets Services License)**
   - Covers: Fund Management
   - Cost: ~$250K
   - Reference: [MAS CMS License](https://www.mas.gov.sg/regulation/capital-markets/cms-licence)
   - Legal Doc: [Securities and Futures Act 2001](https://sso.agc.gov.sg/Act/SFA2001)

**Total Licensing Cost:** ~$550-650K

**Reference:** Sygnum Bank - [Crypto Yield Fund](https://www.sygnum.com/asset-management/crypto-yield-fund/)

## 💭 On/Off Ramp Providers

- **[TransFi](https://www.transfi.com/)** - Stablecoins & Cross-Border Payment Solutions
- **[ZeroHash](https://zerohash.com/)** - Transactions at the Speed of Ideas
- **[Bridge](https://www.bridge.xyz/)** - Stablecoin Infrastructure and APIs
- **[Magic Labs](https://magic.link/)** - Fastest Way to Build Onchain

## 🏁 Competitors (Indirect)

- **[Coinchange](https://www.coinchange.io/)** - Crypto Yield API for Fintechs & Funds

## ⚡ Development Standards

**All code must follow production-grade patterns from `~/.claude/CLAUDE.md`:**

- Go monorepo structure with workspace
- PostgreSQL for ledger tracking + client/user data
- Fiber v2 for HTTP services (B2B API)
- Privy SDK for MPC wallet management
- Viem for DeFi protocol interactions (AAVE, Compound, Morpho)
- React + Vite + TypeScript for Quirk Dashboard
- TurboRepo + PNPM for builds
- On/Off ramp integration (TransFi, ZeroHash, Bridge, Magic)

## 📜 Version History

- **V1 (Archived):** Smart contract DeFi yield aggregator with on-chain accounting
- **V2 (Archived):** Enhanced V1 with oracle-based index updates
- **V3 (Archived):** Wallet custodial API provider (Privy-based, no DeFi)
- **V4 (Current):** Quirk - Earn-as-a-Service platform with AI yield strategies + MPC custody

**Archived Versions:** See `/docs/archive/` for old business models

## 📊 Additional Resources

- **[Miro Customer Persona Board](https://miro.com/app/board/uXjVJoTZufk=/)** - Target customer analysis
- **Tech Stack Documentation** - See `/docs/technical/`
- **Roadmap** - Product development timeline
- **Shopify APY Rewards Reference** - [Shopify Balance Rewards](https://help.shopify.com/en/manual/finance/shopify-balance/rewards/apy-rewards)

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

**Last Updated:** 2025-12-06
**Status:** MVP Development
**Version:** 4.0 - Quirk: Earn-as-a-Service Platform
**Product:** Enabling businesses to embed DeFi yield without infrastructure complexity
**Vision:** Earn Anywhere. Save Everywhere.
