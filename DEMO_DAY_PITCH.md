# Proxify Demo Day Pitch (7 Minutes)

**Audience:** SCBx, SMBC Nikko, Shardlab Korea VC

---

## Slide 1: The Problem (30 seconds)

**[Visual: Split screen - Banking app vs Shopify balance]**

**Say:**
"$2.3 trillion sits idle in business escrow accounts earning 0%.

- Shopify sellers wait 7 days for payout
- Gig workers' earnings sit frozen until withdrawal
- Subscription apps hold annual payments in advance

Traditional banks offer 0.1% savings. Investment apps require manual transfers and lock funds.

**Users want yield. But not if it means leaving their platform.**"

**Hook for each judge:**
- **SCBx:** "Thai SMEs alone have $50B in idle escrow"
- **SMBC Nikko:** "$2.3T global TAM, 4% take rate = $92B opportunity"
- **Shardlab:** "Web3 DeFi yields 5-8%, but Web2 users can't access it"

---

## Slide 2: The Solution (45 seconds)

**[Visual: Simple flow diagram]**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Shopify   │────▶│   Proxify    │────▶│ USDC Yield  │
│   Balance   │     │   (B2B API)  │     │  (5-8% APY) │
└─────────────┘     └──────────────┘     └─────────────┘
```

**Say:**
"Proxify is **Yield-as-a-Service for platforms.**

One API integration. Your users' idle balances automatically earn 5-8% yield from DeFi protocols.

**Three clicks for developers:**
```typescript
// That's it. Yield is live.
proxify.depositEscrow(userId, amount, currency);
```

**Zero friction for end-users:**
- No new app to download
- No KYC needed (client handles it)
- Withdraw anytime to their bank account
- Seamless on/off ramp (PromptPay in Thailand, PayNow in Singapore)

**We handle:**
1. Fiat → USDC conversion
2. DeFi protocol optimization (AAVE, Curve, Uniswap)
3. Custodial wallet management
4. Compliance & licensing
5. Off-ramp back to local currency"

---

## Slide 3: Market Opportunity (45 seconds)

**[Visual: Market size pyramid]**

**Say:**
"We're targeting the **Web2 escrow float market** - not crypto natives.

**TAM (Total Addressable Market):**
- Global business escrow: $2.3 trillion
- 4% revenue share model = $92B opportunity

**SAM (Serviceable Addressable Market):**
- Southeast Asia + East Asia fintech: $500B
- Thailand + Singapore + Korea focus

**SOM (Serviceable Obtainable Market - 3 years):**
- Year 1: 10 B2B clients, $50M AUM = $2M revenue
- Year 2: 50 B2B clients, $250M AUM = $10M revenue
- Year 3: 200 B2B clients, $1B AUM = $40M revenue

**Why now:**
- Stablecoin adoption growing 300% YoY in SEA
- DeFi yields stable at 5-8% (safer than ever)
- Regulatory clarity improving (MAS, Thai SEC guidelines issued)"

**For SCBx specifically:**
"Thai SME market alone: $50B idle funds. If we capture 1% = $500M AUM = $20M annual revenue."

---

## Slide 4: Why We Win (60 seconds)

**[Visual: 2x2 matrix - Web2 vs Web3, Consumer vs B2B]**

```
                Consumer          B2B
Web3        │ Coinbase Wallet  │ ❌ Gap     │
            │ MetaMask         │            │
────────────┼──────────────────┼────────────┤
Web2        │ Revolut          │ Proxify ✅ │
            │ Wise             │ (Us!)      │
```

**Say:**
"We're the **only B2B2C DeFi yield platform for Web2 businesses.**

**What makes us different:**

**1. Eliminate the 'yield app' habit**
- Users don't switch apps
- Yield happens inside platforms they already use
- Shopify seller never knows it's crypto - just sees higher balance

**2. Stablecoin bridge for traditional money**
- Idle money earns 0% in banks
- We convert to USDC, earn 5-8%, convert back
- User gets THB/SGD/USD - never touches crypto

**3. Compatible with BOTH Web3 & Web2**
- Web3 natives: Direct USDC deposits (existing wallets)
- Web2 businesses: Fiat on/off ramp (PromptPay, PayNow)
- Same backend, different frontend

**4. Regulation as a MOAT**
- Competitors (Stripe, Coinbase) won't do this - too much regulatory risk for their core business
- We embrace the complexity:
  - Singapore MAS MPI license (9-12 months, $1.6M)
  - Thailand via Bitkub partnership (3 months, $400K)
  - Banking partnerships (SCBx, DBS potential)
- License stack takes 12-24 months to replicate"

---

## Slide 5: Product Demo (90 seconds)

**[Live demo - screen share]**

**Say:**
"Let me show you how this works for a Shopify seller in Thailand.

**Step 1: Client Integration** (10 seconds)
```typescript
// Shopify backend
await proxify.deposit({
  userId: 'seller_12345',
  amount: '10000',
  currency: 'THB'
});
```

**Step 2: User sees payment instructions** (15 seconds)
[Show PromptPay QR code on screen]
"Thai user pays via PromptPay - instant, familiar. We receive THB, convert to USDC, deposit to custodial vault."

**Step 3: DeFi deployment** (20 seconds)
[Show dashboard: Portfolio allocation]
"USDC automatically deployed:
- 70% AAVE (4.2% APY) - Low risk, high liquidity
- 20% Curve (5.1% APY) - Medium risk, stable pools
- 10% Uniswap V3 (8.3% APY) - Higher risk, higher yield
- **Blended APY: 4.8%**

Our algorithm rebalances daily based on:
- Protocol safety scores (audits, TVL, track record)
- Liquidity depth
- Gas costs
- Market conditions"

**Step 4: Yield accumulation** (15 seconds)
[Show yield graph over time]
"10,000 THB deposit → 285.71 USDC
After 1 month: 286.85 USDC (+1.14 USDC yield)
After 1 year: 299.42 USDC (+13.71 USDC yield = 485 THB)"

**Step 5: Withdrawal** (15 seconds)
[Show withdrawal screen]
"User requests withdrawal → We convert USDC back to THB → Transfer to their Thai bank account via PromptPay. Settlement in 2 hours."

**Step 6: Client dashboard** (15 seconds)
[Show B2B client analytics]
"Client (Shopify) sees:
- Total AUM: $100K across 500 sellers
- Yield generated: $4,800/year
- Our revenue share: 20% of yield = $960/year
- Client keeps 80% = $3,840/year passive income for doing nothing"

---

## Slide 6: Business Model (45 seconds)

**[Visual: Revenue breakdown pie chart]**

**Say:**
"We make money three ways:

**1. Yield Share (80% of revenue)**
- Client earns yield on idle balances
- We take 20% of yield earned
- Example: $1M AUM × 5% APY × 20% = $10K/year per client
- Aligned incentives - we only make money when clients make money

**2. Transaction Fees (15% of revenue)**
- On-ramp: 1.5% (competitive with TransFi, Transak)
- Off-ramp: 0.5% + $1.50 network fee
- Example: $10K deposit = $150 fee

**3. SaaS Subscription (5% of revenue)**
- Enterprise tier: $499/month
- API access, white-label dashboard, priority support

**Unit Economics (At Scale):**
- $1M AUM client generates: $10K yield share + $3K transaction fees = $13K/year
- CAC: $5K (enterprise sales)
- LTV/CAC: 15x (5-year retention assumed)
- Gross margin: 65% (after DeFi gas costs, infrastructure, compliance)

**Break-even:** 40 clients, $40M AUM - achievable Month 18"

---

## Slide 7: Go-to-Market Strategy (45 seconds)

**[Visual: Three-tier customer acquisition]**

**Say:**
"Three-pronged GTM strategy:

**Tier 1: Strategic Partnerships (Fastest Revenue)**
- **Target:** Bitkub (2M Thai users), Grab Financial (SEA reach)
- **Pitch:** White-label our yield infrastructure
- **Timeline:** 1 partnership in Q1, 2-3 in Q2
- **Revenue Impact:** $500K-1M ARR from one partnership

**Tier 2: Platform Integrations (Scalable)**
- **Target:** Shopify App Store, Stripe Partner Directory, WooCommerce
- **Pitch:** One-click yield for merchants
- **Timeline:** Submit Q1, live Q2
- **Revenue Impact:** 100-500 merchants per quarter (long tail)

**Tier 3: Direct Enterprise Sales (High Value)**
- **Target:** Regional gig platforms (Grab, GoJek analogs), Fintech apps
- **Pitch:** Custom yield solutions for $10M+ escrow float
- **Timeline:** 2-3 signed by end of Year 1
- **Revenue Impact:** $50K-200K ARR per enterprise client

**First 5 customers pipeline:**
1. Thai e-commerce platform (in discussions, $5M escrow float)
2. Singapore gig platform (LOI signed, $8M escrow)
3. Korean remittance app (warm intro via Shardlab portfolio)
4. Shopify App Store (submitted, awaiting approval)
5. Bitkub partnership (exploratory talks)"

**For SCBx specifically:**
"We want to partner with SCBx for Thailand banking rails. PromptPay integration, instant settlement, co-marketing to your SME customers. Revenue share model."

---

## Slide 8: Regulatory Strategy (60 seconds)

**[Visual: License roadmap timeline]**

**Say:**
"Regulation is our MOAT, not a blocker. Here's our phased approach:

**Phase 1: Singapore Base (Months 0-12)**
- **License:** MAS Major Payment Institution (MPI)
- **Covers:** Crypto custody + Fiat on/off ramp + Potentially asset management
- **Capital Required:** SGD 1M ($750K)
- **Timeline:** 9-12 months (application in progress)
- **Cost:** $1.6M total (license + legal + setup)
- **Why Singapore first:**
  - Clear regulations (MAS is pro-innovation)
  - Single license covers multiple activities
  - International credibility
  - Can serve regional customers from Singapore base

**Phase 2: Thailand Expansion (Months 6-18)**
- **Approach:** Partnership with Bitkub or Satang Pro
- **They provide:** Thai SEC licenses, BoT banking access
- **We provide:** Technology, DeFi expertise, B2B distribution
- **Timeline:** 3-6 months to finalize partnership
- **Cost:** $200K-400K settlement guarantee
- **Benefit:** Thailand market access without 18-month licensing wait

**Alternative (if partnership fails):**
- Apply for direct Thai SEC Digital Asset Exchange + Fund Manager licenses
- Timeline: 12-18 months
- Cost: $3M+ (capital requirements)
- Only pursue if revenue justifies (>$10M ARR)

**Phase 3: US Market (Conditional)**
- **Approach:** Partner with Bridge (Stripe) or Circle
- **We provide:** B2B distribution, SEA expertise
- **They provide:** US state licenses (48 states)
- **Timeline:** 6-12 months partnership negotiation
- **Why NOT direct licensing:** $5M-10M cost, 18-36 months, operational nightmare

**Three License Types We Need:**

| License | What It Covers | Singapore | Thailand (Partner) | Thailand (Direct) |
|---------|----------------|-----------|-------------------|-------------------|
| **1. VASP/DPT** | Custody + On/off ramp | MPI ✅ | Bitkub has it ✅ | SEC DAE ($5M, 18mo) |
| **2. Asset Management** | DeFi yield | Covered by MPI (TBD) ✅ | Bitkub has it ✅ | SEC DAFM ($2M, 18mo) |
| **3. Payment Services** | Bank transfers | Covered by MPI ✅ | Partner with PromptPay provider ✅ | BoT EMI ($500K, 24mo) |

**Total Phase 1+2 Cost:** $2M over 12-18 months
**Competitive Moat:** 12-24 months for competitors to replicate license stack"

**For SCBx specifically:**
"We want SCBx as our Thailand banking partner. You provide PromptPay rails, we provide DeFi yield infrastructure. Co-brand the solution for your SME customers."

---

## Slide 9: Competitive Landscape (45 seconds)

**[Visual: Competitive matrix]**

```
                  │ Web2 On/Off Ramp │ DeFi Yield │ B2B API │ SEA Focus │
──────────────────┼──────────────────┼────────────┼─────────┼───────────┤
TransFi/Transak   │       ✅         │     ❌     │   ❌    │  Partial  │
Coinbase/Circle   │       ✅         │     ❌     │   ❌    │    ❌     │
AAVE/Compound     │       ❌         │     ✅     │   ❌    │    ❌     │
Stripe Treasury   │       ✅         │     ❌     │   ✅    │    ❌     │
──────────────────┼──────────────────┼────────────┼─────────┼───────────┤
Proxify (Us)      │       ✅         │     ✅     │   ✅    │    ✅     │
```

**Say:**
"No one offers all four:

**TransFi/Transak:**
- Have on/off ramp infrastructure
- But: No DeFi yield, no B2B API, weak Singapore support
- We're essentially replacing them + adding yield layer

**Coinbase/Circle:**
- Have custody and on/off ramp
- But: Consumer-focused, no yield product, no B2B-first API
- They could build this but won't (regulatory risk for core business)

**Stripe Treasury:**
- Perfect B2B API
- But: Traditional banking only (0.1% yield), no crypto, no SEA focus
- They could add crypto but unlikely (risk-averse)

**AAVE/Compound:**
- Best DeFi yields
- But: No fiat on/off ramp, too technical for Web2 businesses
- Users need to buy USDC themselves first

**Our competitive advantages:**
1. **Only player with full stack** (fiat rails + DeFi + B2B API + SEA)
2. **Singapore SGD gap** - TransFi doesn't support it properly
3. **Regulation as moat** - 12-24 months to replicate licenses
4. **First-mover in B2B2C DeFi yield** - category creation"

---

## Slide 10: Team & Traction (30 seconds)

**[Visual: Team photos + logos of advisors]**

**Say:**
"**Team:**
- [Your Name], CEO - [Your background]
- [CTO Name] - [Their background]
- [Compliance Officer] - Ex-[Bank/Regulator]

**Advisors:**
- [Advisor 1] - Ex-Bitkub, Thai crypto expert
- [Advisor 2] - Ex-MAS, Singapore regulations
- [Legal Firm] - [Firm name], fintech licensing specialists

**Current Traction:**
- 5 LOIs from potential customers ($15M combined escrow)
- MAS MPI license application submitted (Month 6 of process)
- Bitkub partnership discussions ongoing
- Technical demo complete (what you just saw)
- $100K pre-seed raised (angels + Protocol Camp grant)"

---

## Slide 11: The Ask (45 seconds)

**[Visual: Use of funds pie chart]**

**Say:**
"**We're raising $2M seed round.**

**Use of Funds:**
- 40% ($800K) - Singapore MAS license + legal + compliance
- 25% ($500K) - Engineering team (5 engineers)
- 20% ($400K) - Thailand partnership (Bitkub settlement)
- 10% ($200K) - Sales & marketing (first 20 customers)
- 5% ($100K) - Operations + buffer

**Milestones this unlocks (18 months):**
- Month 6: MAS MPI license approved
- Month 9: Thailand partnership live (Bitkub or SCBx)
- Month 12: 20 B2B clients, $40M AUM
- Month 18: $2M ARR, break-even

**Investor-Specific Value:**

**For SCBx:**
- Strategic partnership opportunity
- Access to our technology for your SME customers
- Revenue share model on yield generated
- Co-marketing opportunities

**For SMBC Nikko:**
- Lead investor position ($1M allocation)
- Board seat
- Introduction to Japan market (future expansion)
- Financial services expertise for structuring

**For Shardlab:**
- Web3 expertise + Korea market access
- Help with Korea expansion (Phase 4)
- Portfolio synergies (crypto infrastructure stack)

**Round Structure:**
- $2M at $8M pre-money valuation
- 20% equity + pro-rata rights
- 18-month runway to Series A metrics ($10M ARR, $500M AUM)"

---

## Slide 12: Vision (30 seconds)

**[Visual: Roadmap 2025-2027]**

**Say:**
"**Our vision: Make every dollar productive.**

**Today:** Businesses choose between liquidity (0% yield) or locking funds (investment apps).

**Tomorrow:** Proxify makes idle money default to earning. No trade-offs.

**3-Year Plan:**
- Year 1: Singapore + Thailand, $50M AUM
- Year 2: Korea + Indonesia, $250M AUM
- Year 3: Japan + Philippines, $1B AUM, $40M revenue

**We're not building another crypto exchange.**
**We're building the yield layer for the internet.**

Every e-commerce platform. Every gig economy app. Every fintech wallet.

If there's idle money, Proxify makes it productive.

**Thank you. Questions?**"

---

## Q&A Preparation

### Expected Questions & Answers:

**Q1: "Why won't Stripe just build this?"**
**A:** "Three reasons:
1. **Regulatory risk:** Stripe is $50B company. Adding crypto risks their core business. We're crypto-first, different risk appetite.
2. **Margin pressure:** Stripe makes 2.9% per transaction. Adding yield means sharing with customers, reducing their take rate.
3. **Focus:** DeFi yield optimization requires deep crypto expertise (smart contract risk, gas optimization, protocol monitoring). Not their core competency.

Precedent: Stripe didn't build their own on-ramp - they acquired Bridge for $1B. They might acquire US, not build."

---

**Q2: "What if DeFi protocols get hacked?"**
**A:** "Real risk. Our mitigation:

**Technical:**
- Only blue-chip protocols: AAVE ($10B TVL), Curve ($4B TVL), Uniswap ($5B TVL)
- Max 30% allocation to any single protocol
- Real-time monitoring, can exit in <10 minutes
- Multi-sig controls, no single point of failure

**Insurance:**
- Nexus Mutual protocol coverage for top protocols
- Reserve fund: 2% of AUM set aside for tail risk
- Client chooses risk tier: Conservative (4% APY) vs Aggressive (8% APY)

**Business:**
- Legal: Limited liability clauses (industry standard)
- Transparency: Full disclosure that DeFi has smart contract risk
- Alternative: If protocols seem too risky, we can offer traditional custody with 0% until client comfortable

Our fee covers risk management, not just integration. That's the value."

---

**Q3: "How do you acquire customers?"**
**A:** "Three channels, declining CAC:

**1. Strategic partnerships (CAC: ~$0):**
- Bitkub: They have 2M users, we provide yield infrastructure
- SCBx: You have 1M SME customers, we provide DeFi yield
- Both sides win: They offer better product, we get distribution

**2. Platform integrations (CAC: $500-1,000):**
- Shopify App Store, Stripe Partner Directory
- Developers discover us organically
- One-click install, we pay platform 20% rev share

**3. Direct enterprise (CAC: $5K-10K):**
- Outbound sales to gig platforms, fintech apps
- High touch, custom solutions
- But: LTV is $50K-200K, so 10-20x ROI

**Priority:** Start with strategic partnerships (fastest revenue), build platform presence (scale), add enterprise layer (margin expansion)."

---

**Q4: "What about competition from centralized exchanges (Binance Earn, Coinbase Staking)?"**
**A:** "Different customers:

**Binance/Coinbase serve crypto natives:**
- Users already have crypto
- Manual process (buy USDC, stake, withdraw)
- Consumer-focused

**We serve Web2 businesses:**
- Users have fiat (THB, SGD, USD)
- Automatic (yield happens in background)
- B2B API integration

**Overlap is minimal.** A Shopify seller isn't opening Binance account to stake their escrow balance. Too much friction.

We're solving a distribution problem, not a yield problem. DeFi already has great yields. Getting Web2 users access is the gap."

---

**Q5: "Why should SCBx partner with you vs build this themselves?"**
**A (for SCBx specifically):**

"Great question. Three reasons SCBx + Proxify partnership makes sense:

**1. Speed to Market:**
- We've spent 18 months on crypto infrastructure, DeFi expertise, smart contract audits
- SCBx building this from scratch: 24+ months
- Partnership: Live in 3-6 months

**2. Regulatory Separation:**
- SCBx is a bank - crypto activities create regulatory complexity with BoT
- We take the regulatory risk under SEC jurisdiction (separate from banking)
- SCBx stays clean, offers cutting-edge product via partnership

**3. Complementary Strengths:**
- SCBx: Brand, distribution, banking rails, customer trust
- Proxify: DeFi expertise, technology, global crypto partnerships
- Together: SCBx offers DeFi yield to SME customers, we handle backend

**Revenue Model:**
- We split yield share 50/50
- SCBx gets new revenue stream from existing customers (no acquisition cost)
- We get access to 1M+ SME customers

**Precedent:** DBS partnered with Crypto.com (not built themselves), OCBC partnered with Gemini. Partnership is the standard model for banks + crypto."

---

## Timing Breakdown (7 minutes total):

1. Problem: 30s
2. Solution: 45s
3. Market: 45s
4. Why We Win: 60s
5. Demo: 90s
6. Business Model: 45s
7. GTM: 45s
8. Regulatory: 60s
9. Competition: 45s
10. Team: 30s
11. Ask: 45s
12. Vision: 30s

**Total: 7 minutes 30 seconds** (leaves 30s buffer)

---

## Key Takeaways for Judges:

**For all three judges:**
1. ✅ Massive market ($2.3T idle business escrow)
2. ✅ Clear differentiation (only B2B2C DeFi yield platform)
3. ✅ Regulation as moat (12-24 months to replicate)
4. ✅ Strong unit economics (15x LTV/CAC)
5. ✅ Experienced team + clear execution plan

**For SCBx specifically:**
- Partnership opportunity (not competition)
- Revenue share on yield
- Access to our technology for their SME customers

**For SMBC Nikko specifically:**
- $92B market opportunity
- Scalable business model
- Clear path to Series A

**For Shardlab specifically:**
- Web3 innovation applied to Web2 market
- First-mover advantage in category
- Korea expansion opportunity (future)

---

**Last Updated:** 2025-11-26
**Status:** Ready for Demo Day
**Next Step:** Practice this pitch 50 times until it's muscle memory
