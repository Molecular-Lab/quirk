# Landing Page Sections - Integration Guide

> **Created**: 2025-12-06
> **Theme**: Luma + Stripe (Gray foundation with strategic gradient accents)

---

## 📦 5 New Sections Created

All sections follow your **Luma + Stripe theme**:
- ✅ Gray-based text hierarchy (gray-950 → gray-700 → gray-500)
- ✅ Strategic Luma gradient accents (ONLY on key words)
- ✅ Backdrop blur cards (`bg-white/90 backdrop-blur-md`)
- ✅ Clean borders (`border-gray-150`, `border-gray-200`)
- ✅ No colorful icon backgrounds
- ✅ Institutional professional feel

---

## 1. OpportunitySection.tsx

**Purpose**: Highlight the $300B market opportunity

**Content**:
- "$300B+ Idle Cash Waiting to Earn" headline
- 3 opportunity cards:
  - 📈 StableCoin Acceleration
  - 💎 Proven DeFi Market (3-5% APY)
  - 🔒 Users Trapped in Silos
- Shopify proven model callout with link

**Design**:
- Clean card grid (3 columns)
- Hover effects on cards
- Gray callout box for Shopify reference
- Accent link for external URL

**Location**: After Hero Section

---

## 2. ProblemSolutionSection.tsx

**Purpose**: Clearly explain the problem and how Quirk solves it

**Content**:
- **Left Side (Problem)**:
  - Infrastructure Complexity
  - Regulatory Compliance (~$550K-650K)
  - Enterprise-Grade Requirements
- **Right Side (Solution)**:
  - B2B: Earn-as-a-Service
  - B2B2C: Earn Anywhere
  - 4 key benefits grid (⚡ 🔒 🤖 🏛️)

**Design**:
- 2-column layout (Problem | Solution)
- Border-left accent on problems
- Backdrop blur solution card
- Mini feature grid at bottom

**Location**: After Opportunity Section

---

## 3. TargetCustomersSection.tsx

**Purpose**: Show who Quirk is built for

**Content**:
- 4 customer types:
  - 🏪 E-commerce Platforms
  - 🎨 Creator Platforms
  - 💼 Gig Worker Platforms
  - 💳 Fintech Apps
- Each card has: Icon, Title, Description, Use Case metric
- Link to Miro customer persona board

**Design**:
- 4-column grid (responsive)
- Hover effects on customer cards
- Bordered metric section at bottom of each card
- Accent link to external Miro board

**Location**: After Problem/Solution Section

---

## 4. HowItWorksSection.tsx

**Purpose**: Show simple 3-step integration

**Content**:
- **Step 1**: Register & Configure (AI strategy)
- **Step 2**: Embed SDK (React component)
- **Step 3**: Earn & Monitor (Analytics dashboard)
- Tech stack callout: Privy MPC • AAVE/Compound/Morpho • TransFi/Bridge

**Design**:
- 3-column step cards with numbered badges
- Connector lines between steps (desktop)
- Code snippet boxes (gray background)
- Bottom tech stack section with dividers

**Location**: After Target Customers Section

---

## 5. TrustComplianceSection.tsx

**Purpose**: Build trust with regulatory compliance info

**Content**:
- **Left**: Singapore Licensing (MPIL + CMS with MAS links)
- **Right**: Enterprise Security (MPC custody, audit logging, rate limiting)
- Bottom metrics: 3-5% APY, $300B+ market, 100% compliant, 24/7 monitoring

**Design**:
- 2-column layout (Licensing | Security)
- Icon boxes for each feature
- External links to MAS documentation (accent color)
- 4-column metric grid at bottom

**Location**: After How It Works Section (or Footer)

---

## 🎨 Luma Theme Elements Used

### Color Palette
```jsx
// Text hierarchy
text-gray-950  // Primary headings
text-gray-900  // Subheadings (deprecated, use 950)
text-gray-700  // Body text
text-gray-600  // Secondary text (deprecated, use 700)
text-gray-500  // Muted text

// Backgrounds
bg-white       // Main card background
bg-gray-50     // Subtle background areas
bg-gray-25     // Very subtle gradient

// Borders
border-gray-150  // Light borders
border-gray-200  // Default borders

// Accent (STRATEGIC USE ONLY)
bg-gradient-luma  // Gradient for accented words
text-accent       // Links and interactive elements
```

### Components

**Cards**:
```jsx
className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8 hover:shadow-md hover:border-gray-200 transition-all"
```

**Accent Words** (Luma gradient):
```jsx
<span className="bg-gradient-luma bg-clip-text text-transparent">
  Accented Word
</span>
```

**Links**:
```jsx
className="text-accent hover:underline"
```

**Callout Boxes**:
```jsx
className="bg-gray-50 border border-gray-200 rounded-lg p-4"
```

**Icon Containers** (NO colorful backgrounds):
```jsx
className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
```

**Numbered Badges**:
```jsx
className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center"
```

---

## 🔧 How to Integrate into LandingPage.tsx

Update your `src/feature/landing/LandingPage.tsx`:

```tsx
import { NewHeroSection } from "./NewHeroSection"
import { OpportunitySection } from "./OpportunitySection"
import { ProblemSolutionSection } from "./ProblemSolutionSection"
import { TargetCustomersSection } from "./TargetCustomersSection"
import { TradingStrategiesSection } from "./TradingStrategiesSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { TrustComplianceSection } from "./TrustComplianceSection"
// ... other imports

export function LandingPage() {
  const handleGetStarted = () => {
    // Your onboarding logic
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <Header />

      {/* Hero */}
      <NewHeroSection onGetStarted={handleGetStarted} />

      {/* Opportunity ($300B market) */}
      <OpportunitySection />

      {/* Problem + Solution */}
      <ProblemSolutionSection />

      {/* Target Customers */}
      <TargetCustomersSection />

      {/* Interactive Chart */}
      <TradingStrategiesSection />

      {/* How It Works (3 steps) */}
      <HowItWorksSection />

      {/* Trust & Compliance */}
      <TrustComplianceSection />

      {/* Other existing sections... */}
      {/* <SupportedAssetsSection /> */}
      {/* <IntegrationSection /> */}

      {/* Footer */}
      <Footer />
    </div>
  )
}
```

---

## 📊 Recommended Order

```
1. Hero (✅ Already refactored)
2. Opportunity Section (NEW - $300B market)
3. Problem/Solution (NEW - pain points & value prop)
4. Target Customers (NEW - who it's for)
5. Trading Strategies (✅ Already refactored - interactive chart)
6. How It Works (NEW - 3-step integration)
7. Trust/Compliance (NEW - regulatory + security)
8. Integration Section (existing - code examples)
9. Footer
```

---

## ✨ Key Features of New Sections

### Professional Elements
- ✅ No emojis in headings (only in card content)
- ✅ Consistent font weights (bold for headings, medium for subheadings)
- ✅ Generous whitespace (py-20 sections, p-8 cards)
- ✅ Responsive grid layouts
- ✅ Hover states on interactive elements

### Luma-Inspired Design
- ✅ Backdrop blur cards for depth
- ✅ Very subtle gray gradients (no colorful orbs)
- ✅ Strategic gradient accents (1-2 words per section)
- ✅ Clean borders (gray-150, gray-200)
- ✅ Minimal shadows (shadow-sm, shadow-md on hover)

### Trust Signals
- ✅ External documentation links (MAS, Shopify)
- ✅ Specific metrics ($300B, 3-5% APY)
- ✅ Licensing investment transparency (~$550K-650K)
- ✅ Tech stack transparency (Privy, AAVE, TransFi)

---

## 🎯 What Each Section Achieves

| Section | User Question Answered |
|---------|----------------------|
| **Opportunity** | "Why should I care about this market?" |
| **Problem/Solution** | "What problem does this solve for me?" |
| **Target Customers** | "Is this for my type of business?" |
| **Trading Strategies** | "How does the yield allocation work?" |
| **How It Works** | "How hard is it to integrate?" |
| **Trust/Compliance** | "Is this legit and secure?" |

---

## 🚀 Next Steps

1. **Import** the new sections into `LandingPage.tsx`
2. **Test** the responsive layouts on mobile/tablet/desktop
3. **Update** links (Miro board, MAS docs) if needed
4. **Review** copy for your brand voice
5. **Add** real metrics when available (replace placeholders)

---

## 💡 Copy Improvements (Optional)

These sections use content from your docs, but you might want to:

1. **Add real client testimonials** (if available)
2. **Replace generic metrics** with actual data
3. **Include case studies** in Target Customers section
4. **Add screenshots** of the dashboard in How It Works
5. **Highlight differentiators** vs competitors (Coinchange)

---

## 🎨 Maintaining Luma Theme Consistency

When adding new content, follow these rules:

### ✅ DO:
- Use gray text hierarchy (950, 700, 500)
- Apply gradient ONLY to 1-2 accent words per section
- Use backdrop blur on cards (`bg-white/90 backdrop-blur-md`)
- Keep icons in subtle gray backgrounds (`bg-gray-100`)
- Add hover states to interactive elements

### ❌ DON'T:
- Use colorful icon backgrounds (blue-100, green-100, etc.)
- Apply gradients to full sentences or multiple words
- Use bright colors for borders or backgrounds
- Skip hover states on clickable elements
- Use emojis in section headlines

---

**Theme Reference**: See `TODO_UXUI_SHADCN_REFACTOR.md` for complete design system documentation.

**Questions?** Review the code in each new section file - they include inline comments explaining Luma theme usage.
