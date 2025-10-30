# DeFi Liquidity Aggregator - Project Context

> **For detailed documentation, see `/docs` directory** **For coding standards, see `~/.claude/CLAUDE.md` (Go monorepo
> best practices)**

## 🎯 Quick Reference

**What We're Building:** B2B API infrastructure for embedded DeFi yield ("Stripe for DeFi Yield")

**Core Model:** 50 bps revenue share on AUM | White-label solution | Oracle-driven architecture

**Target:** Crypto payroll, card issuers, gaming platforms, insurance protocols

## 📚 Documentation Structure

```
/docs
├── WORK_STYLE.md                    # Agent-first execution strategy
├── /business
│   ├── OVERVIEW.md                  # Business model & value proposition
│   ├── TARGET_CUSTOMERS.md          # Customer segments & GTM
│   └── GTM_STRATEGY.md             # 3-phase rollout plan
├── /architecture
│   ├── SYSTEM_DESIGN.md            # Oracle-driven centralized architecture
│   └── SMART_CONTRACTS.md          # 3-phase contract implementation
└── /technical
    ├── SECURITY.md                  # Security requirements & vulnerabilities
    └── IMPLEMENTATION_CHECKLIST.md  # Week-by-week build plan
```

## 🚀 Current Phase: Phase 1 MVP

**Goal:** Validate demand with minimal product

- **TVL Cap:** $500k
- **Timeline:** 8-10 weeks
- **Budget:** $35k
- **Target:** 3 paying customers, manual oracle

**See:** `/docs/business/GTM_STRATEGY.md` for complete roadmap

## 🏗️ Architecture Summary

```
Client API Call → Vault Contract (on-chain)
                      ↓
                 Oracle Service (off-chain)
                      ↓
                 DeFi Protocols (Aave, Compound, Curve)
```

**Key Principle:** Oracle has authority, contract has limits

**See:** `/docs/architecture/SYSTEM_DESIGN.md` for details

## 🔒 Security Priorities

**Phase 1 Must-Haves:**

1. ✅ Multisig (3-of-5)
2. ✅ On-chain transfer limits ($1M/tx, $5M/day)
3. ✅ Protocol whitelisting
4. ✅ Emergency pause

**See:** `/docs/technical/SECURITY.md` for complete requirements

## 💡 Core Positioning

```
We ARE:  B2B infrastructure (like Stripe, Plaid)
We're NOT: Retail yield platform (like Yearn)

We DO:  Enable ecosystems to offer yield
We DON'T: Compete with CEXs like Binance
```

## 📋 Quick Start

1. **Business Context:** Read `/docs/business/OVERVIEW.md`
2. **Technical Specs:** Review `/docs/architecture/SMART_CONTRACTS.md`
3. **Implementation:** Follow `/docs/technical/IMPLEMENTATION_CHECKLIST.md`
4. **Work Style:** Use agent-first execution (`/docs/WORK_STYLE.md`)

## 🤝 Key Partnerships

- **Bitkub** (Thailand): Ecosystem access to 100+ startups
- **SMBC Nikko** (Japan): Institutional client access

**See:** `/docs/business/GTM_STRATEGY.md` for partnership details

## ⚡ Development Standards

**All code must follow production-grade patterns from `~/.claude/CLAUDE.md`:**

- Go monorepo structure with workspace
- SQLC for type-safe database operations
- Fiber v2 for HTTP services
- TurboRepo + PNPM for builds
- React + Vite + TypeScript for frontend

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

**Last Updated:** 2025-10-21 **Status:** Pre-Launch / Fundraising **Version:** 2.1 (Added Teaching Style)
