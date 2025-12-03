# Client Onboarding & Product Creation Flow - TODO

> **Version:** 1.0.0
> **Created:** 2024-12-03
> **Priority:** HIGH - Core onboarding experience
> **Status:** TODO - Ready for implementation

---

## 🎯 Overview

Create a comprehensive client onboarding flow that guides new users through product creation, strategy configuration, and initial setup. This will be a multi-step form wizard with state management and conditional routing based on existing products.

## 📋 Core Requirements

### 1. Landing & Authentication Flow

#### 1.1 Initial Landing
- **Route:** `/` or `/get-started`
- **Components:**
  - Hero section with "Get Started" CTA button
  - Brief product overview
  - Benefits section

#### 1.2 Authentication Logic
- **Privy Sign-in:** Default authentication method
- **NO auto-redirect** to dashboard for new users
- **Auto-redirect ONLY** if user already has at least one product
- **Check logic:**
  ```typescript
  // After Privy authentication
  if (userProducts.length > 0) {
    // Redirect to dashboard
    navigate('/dashboard')
  } else {
    // Continue to onboarding flow
    navigate('/client-register')
  }
  ```

### 2. Multi-Step Form Architecture

#### 2.1 Route Structure
- **Base Route:** `/client-register/`
- **Step Routes:**
  - `/client-register/company-info` (Step 1)
  - `/client-register/strategies` (Step 2)
  - `/client-register/banking` (Step 3 - Optional)
  - `/client-register/confirmation` (Final)

#### 2.2 State Management
- **USE Zustand Store** for form state management
- **Store Name:** `useOnboardingStore`
- **Persist:** Yes (localStorage) - in case user refreshes
- **State Structure:**
```typescript
interface OnboardingStore {
  // Step tracking
  currentStep: number
  completedSteps: number[]

  // Form data
  companyInfo: {
    companyName: string
    businessType: string
    description: string
    websiteUrl: string
    customerTier: '0-1000' | '1000-10000' | '10000-100000' | '100000-1000000' | '1000000+'
    estimatedAUM: string // Assets Under Management
    industry: string
  }

  strategies: {
    priorities: StrategyPriority[] // Ordered list
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  }

  bankingInfo: {
    configured: boolean
    accounts: BankAccount[]
  }

  // Actions
  setCompanyInfo: (info: CompanyInfo) => void
  setStrategies: (strategies: Strategies) => void
  setBankingInfo: (banking: BankingInfo) => void
  nextStep: () => void
  previousStep: () => void
  resetOnboarding: () => void
}
```

#### 2.3 Reusable Components
**IMPORTANT:** All form components must be reusable for creating second/third products
- `<CompanyInfoForm />` - Can be used in settings or new product creation
- `<StrategySelector />` - Drag & drop or ranking interface
- `<BankAccountForm />` - Add/edit bank accounts
- `<StepIndicator />` - Visual progress indicator
- `<FormNavigation />` - Next/Previous buttons with validation

### 3. Form Stages Detail

#### Stage 1: Product Creation Form
**Purpose:** Collect company and product information

**Fields:**
- Company Name* (text)
- Business Type* (dropdown: E-commerce, FinTech, Gaming, Streaming, Marketplace, Other)
- Industry Vertical* (dropdown)
- Website URL (text)
- Description (textarea)
- **Customer Tier*** (CRITICAL for AI analysis):
  - 0-1,000 customers
  - 1,000-10,000 customers
  - 10,000-100,000 customers
  - 100,000-1,000,000 customers
  - 1,000,000+ customers
- Estimated Assets Under Management (AUM)* (number input with currency)
- Primary Use Case* (dropdown: Idle cash yield, Rewards program, Treasury management, etc.)

**Validation:**
- All required fields must be filled
- Website URL must be valid format
- AUM must be positive number

**Database Impact:**
```sql
-- Customer tier affects:
- AI recommendation algorithms
- Risk assessment models
- Suggested strategy allocations
- Fee structures
- Support tiers
```

#### Stage 2: Strategy Configuration
**Purpose:** Let clients rank their investment strategy preferences

**UI Design:** Card-based selection with drag-and-drop ranking
```
┌─────────────────────────────────────────────────────────┐
│  Rank Your Investment Preferences                        │
│  Drag cards to reorder based on your priorities          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1️⃣ [DeFi Lending]                                       │
│     Low risk, steady yields (5-8% APY)                   │
│     Protocols: AAVE, Compound                            │
│                                                           │
│  2️⃣ [CeFi Yield]                                         │
│     Centralized platforms (4-6% APY)                     │
│     Partners: Licensed institutions                      │
│                                                           │
│  3️⃣ [Liquidity Pools]                                    │
│     Medium risk, higher yields (8-15% APY)               │
│     Protocols: Uniswap, Curve                            │
│                                                           │
│  4️⃣ [Hedging Strategies]                                 │
│     Risk mitigation, stable returns                      │
│     Delta-neutral positions                              │
│                                                           │
│  5️⃣ [Arbitrage]                                          │
│     Advanced strategies, variable yields                 │
│     Cross-protocol opportunities                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Strategy Options:**
1. **DeFi** (Decentralized Finance)
   - Brief: "Lending on blockchain protocols"
   - Risk: Low-Medium
   - Expected APY: 5-8%

2. **CeFi** (Centralized Finance)
   - Brief: "Traditional platform yields"
   - Risk: Low
   - Expected APY: 4-6%

3. **LP** (Liquidity Provision)
   - Brief: "Provide liquidity to DEXs"
   - Risk: Medium-High
   - Expected APY: 8-15%

4. **Hedge** (Hedging Strategies)
   - Brief: "Risk mitigation strategies"
   - Risk: Low
   - Expected APY: 3-5%

5. **Arbitrage**
   - Brief: "Price difference exploitation"
   - Risk: Medium
   - Expected APY: Variable

**Note:** NO deep APY configuration at this stage - just preference ranking

#### Stage 3: Bank Information (Optional)
**Purpose:** Configure bank accounts for off-ramp

**UI:**
- Mark clearly as "Optional - Can be configured later"
- Skip button prominently displayed
- Same component as in Settings page

**Fields:**
- Bank Name
- Account Number
- Account Name
- SWIFT/BIC Code
- Currency
- Add multiple accounts option

### 4. Post-Creation Flow

#### 4.1 After Successful Creation
1. **API Call Sequence:**
   ```typescript
   // 1. Create client
   const client = await createClient(companyInfo)

   // 2. Configure strategies
   await configureStrategies(client.productId, strategies)

   // 3. Configure banking (if provided)
   if (bankingInfo.configured) {
     await configureBankAccounts(client.productId, bankingInfo)
   }
   ```

2. **Redirect to Dashboard**
   - Show success toast/modal
   - Navigate to `/dashboard`

#### 4.2 Dashboard Notifications
**IF no API key exists:**
```typescript
// Dashboard component
useEffect(() => {
  if (!apiKey) {
    showNotification({
      type: 'info',
      title: 'Setup Required',
      message: 'Generate your API key to start integrating',
      action: {
        label: 'Go to Settings',
        onClick: () => navigate('/dashboard/settings')
      }
    })
  }
}, [apiKey])
```

#### 4.3 API Key Generation
- User clicks notification → Settings page
- Settings page → API Configuration tab
- Click "Generate API Key" → Ready for integration

### 5. Returning User Logic

#### For Users with Existing Products:
```typescript
// Check on landing
if (userProducts.length > 0) {
  // Option 1: Direct to dashboard
  navigate('/dashboard')

  // Option 2: Show product selector
  showProductSelector({
    products: userProducts,
    actions: [
      'Select Product',
      'Create New Product'
    ]
  })
}
```

#### Creating Additional Products:
- Use same form components
- Pre-fill some fields from existing account
- Skip redundant steps if applicable

## 🎨 UI/UX Requirements

### Visual Design
- Clean, modern design matching existing dashboard
- Progress indicator showing current step
- Smooth transitions between steps
- Form validation with inline errors
- Loading states during API calls

### Responsive Design
- Mobile-friendly forms
- Touch-friendly drag & drop for strategy ranking
- Collapsible sections on mobile

## 🗂️ File Structure

```
apps/whitelabel-web/src/
├── routes/
│   ├── index.tsx                    # Landing page with Get Started
│   └── client-register/
│       ├── index.tsx                # Form wrapper & step routing
│       ├── company-info.tsx         # Step 1
│       ├── strategies.tsx           # Step 2
│       ├── banking.tsx              # Step 3
│       └── confirmation.tsx         # Success page
├── feature/
│   └── onboarding/
│       ├── components/
│       │   ├── CompanyInfoForm.tsx
│       │   ├── StrategySelector.tsx
│       │   ├── BankAccountForm.tsx
│       │   ├── StepIndicator.tsx
│       │   └── FormNavigation.tsx
│       ├── hooks/
│       │   └── useOnboarding.ts
│       └── store/
│           └── onboardingStore.ts
└── components/
    └── notifications/
        └── ApiKeyNotification.tsx
```

## 📚 Reference Resources

### Existing Code to Reference:
1. **Form Implementation Pattern:**
   - Reference: `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`
   - See client registration form (lines 1267-1321)
   - See strategy configuration (lines 1522-1583)
   - See bank account configuration (lines 1324-1367)

2. **API Integration:**
   - Reference: `apps/whitelabel-web/src/api/b2bClient.ts`
   - Methods: `registerClient()`, `configureStrategies()`, `configureBankAccounts()`

3. **Settings Page Components:**
   - Reference: `apps/whitelabel-web/src/feature/dashboard/SettingsPage.tsx`
   - Reuse bank account form component
   - Reuse strategy sliders (adapt to ranking)

### Data Flow Visualization:
```
Landing Page
    ↓
Get Started Button
    ↓
Privy Sign-in
    ↓
Check Existing Products ──→ Has Products ──→ Dashboard
    ↓                                           ↑
No Products                                    │
    ↓                                           │
Company Info Form                              │
    ↓                                           │
Strategy Ranking                               │
    ↓                                           │
Banking (Optional)                             │
    ↓                                           │
Create & Configure ────────────────────────────┘
    ↓
Dashboard (with API key notification)
    ↓
Settings → Generate API Key
    ↓
Ready for Integration
```

## 🔄 State Management Example

```typescript
// onboardingStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingStore {
  // ... (as defined above)
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      completedSteps: [],

      companyInfo: {
        companyName: '',
        businessType: '',
        description: '',
        websiteUrl: '',
        customerTier: '0-1000',
        estimatedAUM: '',
        industry: ''
      },

      strategies: {
        priorities: [],
        riskTolerance: 'moderate'
      },

      bankingInfo: {
        configured: false,
        accounts: []
      },

      setCompanyInfo: (info) => set({ companyInfo: info }),
      setStrategies: (strategies) => set({ strategies }),
      setBankingInfo: (banking) => set({ bankingInfo: banking }),

      nextStep: () => set((state) => ({
        currentStep: state.currentStep + 1,
        completedSteps: [...state.completedSteps, state.currentStep]
      })),

      previousStep: () => set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1)
      })),

      resetOnboarding: () => set({
        currentStep: 0,
        completedSteps: [],
        companyInfo: {
          companyName: '',
          businessType: '',
          description: '',
          websiteUrl: '',
          customerTier: '0-1000',
          estimatedAUM: '',
          industry: ''
        },
        strategies: {
          priorities: [],
          riskTolerance: 'moderate'
        },
        bankingInfo: {
          configured: false,
          accounts: []
        }
      })
    }),
    {
      name: 'proxify-onboarding',
      skipHydration: true
    }
  )
)
```

## ✅ Acceptance Criteria

1. **Landing page with "Get Started" button exists**
2. **Privy authentication works without auto-redirect**
3. **Multi-step form with all 3 stages functional**
4. **Strategy ranking with drag & drop works**
5. **Form state persists on page refresh**
6. **Successful creation redirects to dashboard**
7. **API key notification shows when needed**
8. **Existing users skip to dashboard**
9. **Form components are reusable**
10. **Customer tier data saves to database**

## 🚀 Implementation Priority

1. **Phase 1:** Landing page & authentication flow
2. **Phase 2:** Company info form with validation
3. **Phase 3:** Strategy ranking interface
4. **Phase 4:** Banking configuration (optional)
5. **Phase 5:** Dashboard integration & notifications
6. **Phase 6:** Polish & testing

## 📝 Notes for Implementation

- **Customer Tier is CRITICAL** - It affects AI recommendations and pricing
- Form must be **mobile-responsive**
- Use **APITestingPage.tsx** as reference for API calls
- Reuse components from **SettingsPage.tsx** where applicable
- Test with both new and returning users
- Ensure proper error handling at each step
- Add analytics tracking for drop-off points

---

**Version:** 1.0.0
**Last Updated:** 2024-12-03
**Status:** Ready for implementation
**Assigned to:** Next available agent