# Client Onboarding - File Structure

## 📁 Directory Structure

```
apps/whitelabel-web/src/
├── routes/
│   ├── onboarding.tsx                           # Main onboarding route
│   └── get-started.tsx                          # Entry point (triggers auth & redirects)
│
├── feature/
│   ├── landing/
│   │   └── LandingPage.tsx                      # Modified: Get Started → /get-started
│   │
│   └── onboarding/
│       ├── OnboardingLayout.tsx                  # Main layout with step indicator
│       └── components/
│           ├── StepIndicator.tsx                 # Progress bar (1 → 2 → 3)
│           ├── CompanyInfoForm.tsx               # Step 1: Company details + customer tier
│           ├── StrategySelector.tsx              # Step 2: Drag & drop strategy ranking
│           └── BankAccountForm.tsx               # Step 3: Optional banking setup
│
└── store/
    └── onboardingStore.ts                        # Zustand state management
```

---

## 🔍 File Details

### Route Files

#### `/routes/get-started.tsx`
**Purpose:** Entry point when user clicks "Get Started"
**Flow:**
1. Triggers Privy login if not authenticated
2. Loads user organizations from database
3. Redirects to:
   - `/dashboard` if user has products
   - `/onboarding` if new user
**Used by:** Landing Page "Get Started" button

#### `/routes/onboarding.tsx`
**Purpose:** Protected onboarding route
**Component:** OnboardingLayout
**Protection:**
- Redirects to `/login` if not authenticated
- Redirects to `/dashboard` if user already has products

---

### Layout & Components

#### `/feature/onboarding/OnboardingLayout.tsx`
**Purpose:** Main container for onboarding flow
**Responsibilities:**
- Header with title
- Step indicator
- Conditional rendering of current step
- Auth guards
**State:** Uses `currentStep` from onboardingStore

#### `/feature/onboarding/components/StepIndicator.tsx`
**Purpose:** Visual progress tracker
**Features:**
- Shows 3 steps
- Checkmarks for completed steps
- Highlights current step
- Step labels: "Company Info", "Strategy Ranking", "Banking (Optional)"

#### `/feature/onboarding/components/CompanyInfoForm.tsx`
**Purpose:** Step 1 - Collect company information
**Fields:**
- Company Name* (text)
- Business Type* (select: E-commerce, FinTech, Gaming, etc.)
- Industry* (select: Technology, Financial Services, etc.)
- Website URL (optional)
- Description (optional textarea)
- **Customer Tier*** (radio: 5 options)
  - 0-1,000 customers
  - 1,000-10,000 customers
  - 10,000-100,000 customers
  - 100,000-1,000,000 customers
  - 1,000,000+ customers
- Estimated AUM* (number with $ prefix)

**Validation:**
- All required fields must be filled
- Website URL must be valid format
- AUM must be numeric

**Navigation:** Next button → Step 2

#### `/feature/onboarding/components/StrategySelector.tsx`
**Purpose:** Step 2 - Rank investment strategies
**Features:**
- Drag & drop using @dnd-kit
- 5 strategy cards (sortable):
  1. DeFi Lending
  2. Liquidity Pools
  3. CeFi Platforms
  4. Hedging Strategies
  5. Arbitrage
- Each card shows:
  - Strategy name
  - Risk level badge
  - APY range
  - Example protocols
- Risk tolerance selector (3 options)
- Info banner explaining how ranking works

**Navigation:**
- Back → Step 1
- Next → Step 3

#### `/feature/onboarding/components/BankAccountForm.tsx`
**Purpose:** Step 3 - Optional bank account configuration
**Features:**
- Add multiple bank accounts
- Remove accounts
- Fields per account:
  - Currency (select: USD, EUR, GBP, THB)
  - Bank Name*
  - Account Name*
  - Account Number*
  - SWIFT/BIC Code (optional)
- Warning banner: "This step is optional"
- Shows list of added accounts

**Actions:**
1. **Skip for Now** → Creates product without banking
2. **Complete Setup** → Creates product with banking

**API Integration:**
On completion (Skip or Complete):
1. Registers client (`registerClient()`)
2. Configures strategies (`configureStrategies()`)
3. Configures banking if provided (`configureBankAccounts()`)
4. Adds organization to UserStore
5. Redirects to `/dashboard`

---

### State Management

#### `/store/onboardingStore.ts`
**Purpose:** Manages all onboarding form state
**Persisted:** Yes (localStorage)
**Key:** `proxify-onboarding`

**State Structure:**
```typescript
{
  currentStep: number,           // 0, 1, or 2
  completedSteps: number[],      // [0, 1]
  
  companyInfo: {
    companyName: string,
    businessType: string,
    industry: string,
    description: string,
    websiteUrl: string,
    customerTier: CustomerTier,  // CRITICAL for AI
    estimatedAUM: string
  },
  
  strategies: {
    priorities: StrategyPriority[],  // [{id: 'defi', rank: 1}, ...]
    riskTolerance: RiskTolerance     // 'conservative' | 'moderate' | 'aggressive'
  },
  
  bankingInfo: {
    configured: boolean,
    accounts: BankAccount[]
  }
}
```

**Actions:**
- `setCompanyInfo(partial)` - Update company data
- `setStrategies(partial)` - Update strategy data
- `setBankingInfo(partial)` - Update banking data
- `addBankAccount(account)` - Add a bank account
- `removeBankAccount(index)` - Remove a bank account
- `nextStep()` - Go to next step
- `previousStep()` - Go to previous step
- `goToStep(step)` - Jump to specific step
- `resetOnboarding()` - Clear all data
- `isStepValid(step)` - Check if step can proceed

---

## 🎯 Component Import Paths

```typescript
// Store
import { useOnboardingStore } from '@/store/onboardingStore'

// Layout
import { OnboardingLayout } from '@/feature/onboarding/OnboardingLayout'

// Components
import { StepIndicator } from '@/feature/onboarding/components/StepIndicator'
import { CompanyInfoForm } from '@/feature/onboarding/components/CompanyInfoForm'
import { StrategySelector } from '@/feature/onboarding/components/StrategySelector'
import { BankAccountForm } from '@/feature/onboarding/components/BankAccountForm'

// API
import { b2bApiClient } from '@/api/b2bClient'

// User Store
import { useUserStore } from '@/store/userStore'
```

---

## 🔄 State Flow

### Step Transitions:
```
currentStep = 0 → CompanyInfoForm
    ↓ (nextStep)
currentStep = 1 → StrategySelector
    ↓ (nextStep)
currentStep = 2 → BankAccountForm
    ↓ (handleComplete)
API calls → Dashboard
```

### Data Persistence:
- All changes auto-saved to localStorage
- Survives page refresh
- Cleared on successful completion
- Reset on logout

---

## 🎨 Design Tokens Used

### Colors:
```css
/* Primary */
bg-gray-900   - Buttons, active states
text-gray-900 - Headings

/* Backgrounds */
bg-gray-50    - Page background
bg-white      - Cards
bg-gray-100   - Input backgrounds

/* Borders */
border-gray-200 - Card borders
border-gray-300 - Input borders

/* Text */
text-gray-600 - Body text
text-gray-500 - Labels, hints
text-gray-400 - Placeholders

/* Accents */
bg-blue-50, border-blue-200, text-blue-700  - Info
bg-amber-50, border-amber-200, text-amber-700 - Warnings
bg-red-50, border-red-200, text-red-700  - Errors
```

### Spacing:
```css
p-4, p-5, p-6, p-8  - Padding
space-y-3, space-y-4, space-y-6 - Vertical spacing
gap-2, gap-3, gap-4  - Flex/grid gaps
```

### Typography:
```css
text-2xl font-bold  - Page titles
text-lg font-semibold - Section titles
text-sm font-medium  - Labels
text-sm - Body text
```

---

## 📊 API Integration Points

### BankAccountForm.tsx handles all API calls:

```typescript
// Line ~65: Register client
const clientResponse = await b2bApiClient.registerClient({
  companyName, businessType, description, websiteUrl,
  privyOrganizationId, privyEmail, privyWalletAddress,
  walletType: "MANAGED",
  vaultsToCreate: "both"
})

// Line ~105: Configure strategies
await b2bApiClient.configureStrategies(productId, {
  chain: "8453",  // Base
  token: "USDC",
  token_address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  strategies: [...]
})

// Line ~116: Configure banking (if provided)
await b2bApiClient.configureBankAccounts(productId, {
  bankAccounts: [...]
})

// Line ~130: Update UserStore
addOrganization({...})
```

---

## 🧪 Test Scenarios

### Happy Path:
1. New user clicks "Get Started"
2. Signs in with Privy
3. Fills company info
4. Ranks strategies
5. Skips banking
6. Lands on dashboard

### Alternative Paths:
- Fill banking information → Complete
- Navigate back/forward between steps
- Refresh page mid-onboarding → Data persists
- Existing user clicks "Get Started" → Dashboard

### Error Cases:
- Invalid URL in company info
- API error during creation
- Network timeout
- Invalid bank account data

---

## 🔐 Security & Validation

### Client-Side Validation:
- Company Info: Required fields, URL format, numeric AUM
- Strategy: Must have all 5 strategies ranked
- Banking: Required fields when adding account

### Server-Side:
- Privy authentication required
- Product ID validation
- Organization ownership check

---

**Document Version:** 1.0
**Last Updated:** December 3, 2025
**Status:** Complete & Ready for Use
