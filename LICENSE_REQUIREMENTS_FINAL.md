# License Requirements for Proxify (Self-Operated On/Off Ramp)

## Strategic Decision: Build Own On/Off Ramp

**Why this makes sense:**
1. ✅ Better margins (save 2-3% per transaction vs TransFi/Transak)
2. ✅ Market gap: Singapore (SGD) underserved
3. ✅ Control over customer experience
4. ✅ Direct bank relationships = faster settlement
5. ✅ Competitive moat: Hard to replicate license stack

**What you're building:**
- Proxify = On/off ramp provider + Custodial wallet + DeFi yield optimizer
- Comparable to: TransFi, Transak, MoonPay (but SEA-focused)

## Three License Types Needed

### 1. **Digital Payment Token (DPT) / VASP License**
**What it covers:** Custody + On/off ramp (fiat ↔ crypto exchange)

**Per Country Requirements:**

#### 🇹🇭 Thailand
**License:** Digital Asset Exchange License (SEC Thailand)
**Regulator:** Thai Securities and Exchange Commission (SEC)
**Capital:** $5M USD equivalent (175M THB)
**Timeline:** 12-18 months
**Requirements:**
- Thai company entity
- Physical office in Thailand
- Thai directors (at least 1)
- Anti-money laundering (AML) officer
- Cybersecurity infrastructure audit
- Bank of Thailand (BoT) notification for payment services

**Alternative (Faster):**
- Partner with licensed exchange (Bitkub, Satang Pro)
- Operate as their merchant
- Timeline: 2-3 months
- Capital: $100K-500K settlement guarantee

**Status:** ⚠️ Required before Thailand launch

---

#### 🇸🇬 Singapore
**License:** Major Payment Institution (MPI) License
**Regulator:** Monetary Authority of Singapore (MAS)
**Capital:** SGD 1M (USD $750K)
**Timeline:** 9-12 months
**Requirements:**
- Singapore company entity
- At least 1 Singapore-resident director
- Chief Compliance Officer
- Chief Risk Officer
- Technology Risk Management (TRM) framework
- Cybersecurity certification
- AML/CFT (Counter-Financing of Terrorism) program

**Alternative (Faster):**
- Partner with licensed entity (Xfers, Grab Financial)
- Timeline: 3-6 months

**Status:** ⚠️ Required before Singapore launch

---

#### 🇺🇸 United States
**License:** State-by-state Money Transmission Licenses (MTL)
**Regulator:** Each state's financial regulator (48 states!)
**Capital:** $5M-$20M USD (varies by state)
**Timeline:** 18-36 months for all states
**Requirements:**
- Money Transmitter License in EACH state
- Surety bonds per state ($10K-$500K each)
- FinCEN registration (federal)
- State-specific compliance programs
- Background checks for all executives

**Alternative (MANDATORY):**
- ❌ DO NOT attempt direct licensing
- ✅ Partner with Bridge, Circle, or Stripe Treasury
- Timeline: 3-6 months

**Status:** ⚠️ Partner-only approach

---

### 2. **Fund Management / Asset Management License**
**What it covers:** Managing customer funds in DeFi protocols for yield

**Per Country Requirements:**

#### 🇹🇭 Thailand
**License:** Digital Asset Fund Manager License (SEC Thailand)
**Regulator:** Thai SEC
**Capital:** $2M USD equivalent (70M THB)
**Timeline:** 12-18 months (can apply concurrently with DPT license)
**Requirements:**
- Licensed fund manager (CFA or equivalent)
- Investment committee
- Custodian agreement
- Risk management framework
- Quarterly reporting to SEC

**Alternative:**
- Operate under "discretionary portfolio management" exemption if:
  - Funds remain in stablecoins (not securities)
  - No active trading (only yield farming)
  - Full disclosure to customers
- Still requires SEC notification

**Status:** ⚠️ Grey area - legal opinion needed

---

#### 🇸🇬 Singapore
**License:** Capital Markets Services (CMS) License - Fund Management
**Regulator:** MAS
**Capital:** SGD 250K (USD $185K) - Small fund manager tier
**Timeline:** 6-9 months
**Requirements:**
- Singapore entity
- Base capital + operational expenses (12 months)
- Representatives with relevant qualifications
- MAS examination pass

**Key Exemption:**
- If you're NOT actively trading (just depositing to AAVE/Curve):
- Might qualify as "custodial service with ancillary yield" (covered by MPI)
- Legal opinion required

**Status:** ⚠️ Possibly covered by MPI license (TBC with lawyers)

---

#### 🇺🇸 United States
**License:** Investment Adviser (SEC or State)
**Regulator:** SEC (if >$100M AUM) or State regulators
**Capital:** $35K-$100K (varies)
**Timeline:** 6-12 months
**Requirements:**
- Series 65 or Series 66 exam (principals)
- Form ADV registration
- Compliance manual
- Annual audits

**Alternative:**
- Structure as "custodial staking service" (not active management)
- Precedent: Coinbase, Kraken offer staking without fund license
- Still risky - regulatory clarity pending

**Status:** ⚠️ Evolving regulation - monitor closely

---

### 3. **Banking / Payment Services License**
**What it covers:** Operating bank accounts, facilitating transfers

**Per Country Requirements:**

#### 🇹🇭 Thailand
**License:** Electronic Money Institution (EMI) OR Payment Services Provider
**Regulator:** Bank of Thailand (BoT)
**Capital:** 5M-50M THB ($150K-$1.5M) depending on services
**Timeline:** 12-24 months
**Requirements:**
- Thai company
- Comprehensive IT system audit
- Business continuity plan
- BoT-approved technology provider
- Annual audits

**Alternative (Recommended):**
- Partner with existing PromptPay aggregator
- Examples: 2C2P, Omise, SCB Easy
- They handle BoT compliance
- You operate as their merchant

**Status:** ⚠️ Partner approach recommended (avoid full banking license)

---

#### 🇸🇬 Singapore
**License:** Stored Value Facility (SVF) OR Account Issuance Service
**Regulator:** MAS
**Capital:** SGD 1M
**Timeline:** 12-18 months
**Requirements:**
- Singapore entity
- Technology risk assessment
- Customer funds safeguarding (trust account)
- AML/CFT program

**Alternative (Recommended):**
- Partner with DBS, OCBC, or UOB (they provide PayNow integration)
- Timeline: 3-6 months

**Status:** ⚠️ Partner approach recommended

---

#### 🇺🇸 United States
**License:** Money Transmitter + Bank Partnership
**Already covered by:** MTL (state-by-state)
**Bank Partner:** Required (Evolve Bank, Blue Ridge Bank, etc.)

**Status:** ⚠️ Partner approach mandatory

---

## Recommended License Strategy (Phased Approach)

### Phase 1: Singapore First (Cleanest Regulations)
**Timeline:** 9-12 months
**Cost:** ~$1M USD (license + legal + setup)

**Licenses to obtain:**
1. ✅ **MAS MPI License** (Major Payment Institution)
   - Covers: Custody + On/off ramp
   - Capital: SGD 1M
   - Likely covers DeFi yield (if structured as "custodial service with yield")

**Partnerships:**
- Bank partner: DBS or OCBC (for SGD on/off ramp)
- Thai operations: Partner with Bitkub (serve Thai customers via Singapore license + Thai partner)

**Why Singapore first:**
- Single license covers multiple activities
- Clear regulations
- English-speaking regulator
- Fastest approval in SEA
- Can serve regional customers from Singapore base

---

### Phase 2: Thailand Expansion
**Timeline:** +12-18 months after Singapore
**Cost:** ~$2M USD

**Licenses to obtain:**
1. ✅ **Digital Asset Exchange License** (Thai SEC)
   - Covers: Custody + On/off ramp for THB
2. ✅ **Digital Asset Fund Manager License** (Thai SEC)
   - Covers: DeFi yield management

**OR Alternative:**
1. ✅ Partner with Bitkub/Satang Pro
   - Operate under their licenses
   - Timeline: 3 months
   - Cost: $200K-500K settlement

---

### Phase 3: US Market (If Needed)
**Timeline:** +18-24 months after Thailand
**Cost:** $5M-10M USD (insane!)

**Approach:**
- ❌ DO NOT get state licenses yourself
- ✅ Acquire existing licensed entity OR
- ✅ Partner with Bridge/Circle/Stripe

---

## Total License Cost Estimate

### Singapore Base (Recommended Phase 1)
| Item | Cost |
|------|------|
| MAS MPI License Application | $50K |
| Legal & Compliance | $200K |
| Technology Audit | $100K |
| Base Capital Requirement | $750K (SGD 1M) |
| First Year Operations | $500K |
| **Total** | **$1.6M USD** |

### Thailand Expansion (Phase 2 - Partnership)
| Item | Cost |
|------|------|
| Bitkub Partnership Agreement | $200K |
| Legal & Compliance | $100K |
| Integration & Setup | $100K |
| **Total** | **$400K USD** |

### Thailand Expansion (Phase 2 - Direct Licensing)
| Item | Cost |
|------|------|
| SEC License Applications (2 licenses) | $100K |
| Legal & Compliance | $300K |
| Capital Requirements | $2M (THB 70M) |
| Technology Audit | $150K |
| First Year Operations | $700K |
| **Total** | **$3.25M USD** |

---

## What This Means for Demo Day Pitch

### Your Story:
**"We're building SEA's first B2B DeFi yield infrastructure with direct fiat rails.**

**Market Gap:**
- Existing providers (TransFi, Transak) don't support Singapore SGD properly
- Thailand is underserved (only Bitkub has full stack)
- No provider offers B2B-first model with yield optimization

**Our Licensing Strategy:**
- **Phase 1 (Months 0-12):** Singapore MAS MPI license - allows us to serve SGD market immediately
- **Phase 2 (Months 12-24):** Thailand via Bitkub partnership - faster than direct licensing
- **Phase 3 (Months 24+):** Direct Thai licenses when volume justifies it

**Capital Requirement:** $1.6M for Singapore base (we're raising $2M seed)

**Why this works:**
- Singapore license is internationally recognized
- Can serve regional customers from Singapore base
- Thailand partnership covers 80% of SEA market
- US market via Circle/Bridge partnership (no direct licensing nightmare)

**Competitive Moat:**
- License stack takes 12-24 months to replicate
- Bank partnerships take 6-12 months to negotiate
- First-mover advantage in B2B SEA market"

---

## Questions Judges Will Ask

### Q: "Why not just use TransFi?"
**A:** "Three reasons:

1. **Market gap:** TransFi doesn't support Singapore SGD. We're targeting Singapore + Thailand = $50B+ fintech market they're missing.

2. **Margins:** TransFi takes 2-3% per transaction. At scale, that's $300K-500K/year in fees we'd pay them. Building our own infrastructure has upfront cost ($1.6M) but better unit economics long-term.

3. **Control:** Direct bank relationships mean faster settlement (minutes vs hours), better UX, and ability to customize for SEA market needs (PromptPay, PayNow integration)."

### Q: "That's a lot of licenses. Why not avoid them?"
**A:** "You can't. This is a regulated industry. But we're smart about it:

- **Singapore first:** Single MPI license covers custody + on/off ramp + potentially yield (pending legal opinion). Most efficient.
- **Thailand:** Partner with Bitkub (they have licenses) for first 2 years. Only get direct licenses when volume justifies ($10M+ revenue).
- **US:** Never attempt direct licensing (48 states = insane). Partner with Bridge or Circle.

We're not avoiding regulation - we're navigating it intelligently. The license stack becomes our moat."

### Q: "What if regulations change?"
**A:** "We're structuring defensively:

1. **Singapore base:** MAS is pro-innovation, clear regulations, unlikely to suddenly ban crypto.
2. **Multiple partnerships:** If Bitkub has issues, we pivot to Satang Pro. If TransFi fails, we have direct banking.
3. **Stablecoin focus:** USDC is least controversial crypto asset. Not trading shitcoins, not doing margin, not doing lending to consumers.
4. **B2B model:** Our customers are businesses (Shopify sellers, gig platforms) - not retail consumers. Less regulatory scrutiny.

Regulatory risk is real, but we've chosen the most stable jurisdictions and conservative product structure."

---

## For Demo Day: What to Actually Show

### Don't Show:
- ❌ TransFi integration (wasted effort, you're replacing them)
- ❌ Fake bank accounts (looks amateurish)
- ❌ "We'll figure out licenses later" (red flag)

### Do Show:
- ✅ **Mock but production-architecture on/off ramp flow**
  - Looks real (PromptPay QR, bank transfer details)
  - Backend architecture ready for real bank integration
  - "Currently in test mode - production deployment with DBS partnership in progress"

- ✅ **License roadmap slide**
  - Phase 1: Singapore MPI (9-12 months, $1.6M)
  - Phase 2: Thailand partnership (3 months, $400K)
  - Show you've done the homework

- ✅ **Partnership LOIs (if possible)**
  - Letter of Interest from DBS or OCBC
  - "In discussions with Bitkub for Thailand"
  - Shows you're serious about execution

- ✅ **Focus on DeFi yield optimization** (your actual moat)
  - Real-time APY calculations
  - Risk-adjusted portfolio allocation
  - Index-based accounting system

---

## Final Recommendation: License Priority

### Must Have (Phase 1):
1. ✅ **Singapore MAS MPI License** - Start application NOW
   - Timeline: 9-12 months
   - Cost: $1.6M
   - Covers: Custody + On/off ramp

### Should Have (Phase 2):
2. ✅ **Thailand Partnership** - Bitkub or Satang Pro
   - Timeline: 3-6 months
   - Cost: $400K
   - Covers: Thai market access

### Nice to Have (Phase 3):
3. ⚠️ **Thailand Direct Licenses** - Only if >$10M revenue
   - Timeline: 12-18 months
   - Cost: $3.25M
   - Covers: Full control of Thai operations

### Never Attempt:
4. ❌ **US State Licenses** - Partner only
   - Timeline: 18-36 months
   - Cost: $5M-10M+
   - Better: Partner with Bridge, Circle, Stripe

---

## Summary Table: License Requirements

| License Type | Singapore | Thailand | US | What It Covers |
|--------------|-----------|----------|-----|----------------|
| **VASP / DPT** | MAS MPI (Required) | SEC DAE License (Phase 2) | State MTLs (Partner) | Custody + Fiat ↔ Crypto |
| **Fund Management** | Possibly covered by MPI (TBD) | SEC DAFM License (Phase 2) | SEC IA (If >$100M) | DeFi Yield Management |
| **Banking / Payment** | Covered by MPI | Partner with PromptPay provider | Bank Partnership (Required) | Fiat Transfers |
| **Capital Required** | SGD 1M ($750K) | THB 245M ($7M) OR Partner ($200K) | $5M-20M OR Partner | |
| **Timeline** | 9-12 months | 12-18 months OR 3 months (partner) | 18-36 months OR 3-6 months (partner) | |
| **Recommended** | ✅ YES | ✅ Partner first | ✅ Partner only | |

---

**Bottom Line:**
- Start with Singapore MPI license ($1.6M, 9-12 months)
- Partner with Bitkub for Thailand ($400K, 3 months)
- Never touch US direct licensing (partner with Bridge/Circle)
- Total Phase 1+2 cost: ~$2M over 12-15 months

This is competitive with what TransFi, Transak, MoonPay spent to build their license stacks. You're in the right ballpark.

---

**Last Updated:** 2025-11-26
**Status:** Recommended path for institutional pitch
**Next Step:** Engage Singapore law firm for MAS MPI pre-application consultation
