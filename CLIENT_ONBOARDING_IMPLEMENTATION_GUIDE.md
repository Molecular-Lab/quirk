# Client Onboarding Implementation Guide

> **For Developer:** This guide provides exact code references and patterns from existing codebase
> **Version:** 1.0.0
> **Reference Base:** APITestingPage.tsx

---

## 🛠️ Implementation Resources

### 1. Existing Code References from APITestingPage.tsx

#### 1.1 Client Registration Pattern (Lines 1267-1321)
```typescript
// REFERENCE: apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx

// Data structure for client registration
const clientRegistrationData = {
  companyName: params.companyName,
  businessType: params.businessType,
  walletType: walletType ?? "MANAGED",
  vaultsToCreate: params.vaultsToCreate || "both",
  privyOrganizationId: privyOrganizationId,
  privyWalletAddress: privyWalletAddress,
  privyEmail: privyEmail ?? undefined,
  description: params.description || undefined,
  websiteUrl: params.websiteUrl || undefined,
}

// API call pattern
data = await b2bApiClient.registerClient(clientRegistrationData)

// Post-registration: Add to UserStore
if (data && typeof data === "object" && "productId" in data) {
  const orgData = data as ClientRegistrationResponse
  addOrganization({
    id: orgData.id,
    productId: orgData.productId,
    companyName: orgData.companyName,
    businessType: orgData.businessType,
    description: orgData.description,
    websiteUrl: orgData.websiteUrl,
    isActive: orgData.isActive,
    isSandbox: orgData.isSandbox,
    createdAt: orgData.createdAt,
    updatedAt: orgData.updatedAt,
  })
}
```

#### 1.2 Bank Account Configuration Pattern (Lines 1324-1367)
```typescript
// REFERENCE: Banking configuration from APITestingPage.tsx

// Bank account data structure
const bankAccountsArray = bankAccounts.map((ba) => {
  let parsedBankDetails = undefined
  if (ba.bank_details && ba.bank_details.trim() !== "") {
    try {
      parsedBankDetails = JSON.parse(ba.bank_details)
    } catch (error) {
      throw new Error(`Invalid JSON in bank_details: ${ba.bank_details}`)
    }
  }

  return {
    currency: ba.currency,
    bank_name: ba.bank_name,
    account_number: ba.account_number,
    account_name: ba.account_name,
    bank_details: parsedBankDetails,
  }
})

// API call
data = await b2bApiClient.configureBankAccounts(activeProductId, {
  bankAccounts: bankAccountsArray,
})
```

#### 1.3 Strategy Configuration Pattern (Lines 1522-1583)
```typescript
// REFERENCE: Strategy configuration from APITestingPage.tsx

// Strategy data structure
const strategies = [
  { category: "lending", target: parseInt(params.lending_target || "70") },
  { category: "lp", target: parseInt(params.lp_target || "20") },
  { category: "staking", target: parseInt(params.staking_target || "10") },
]

// Validation
const total = strategies.reduce((sum, s) => sum + s.target, 0)
if (total !== 100) {
  throw new Error(`Strategy allocations must total 100% (currently ${total}%)`)
}

// API call
data = await b2bApiClient.configureVaultStrategies(activeProductId, {
  chain: currentChain,
  token_address: tokenInfo.address,
  token_symbol: currentToken,
  strategies: strategies,
})
```

### 2. API Client Methods to Use

```typescript
// From: apps/whitelabel-web/src/api/b2bClient.ts

interface B2BApiClient {
  // Step 1: Register client
  registerClient(data: {
    companyName: string
    businessType: string
    walletType: "MANAGED" | "USER_OWNED"
    privyOrganizationId: string
    privyWalletAddress: string
    privyEmail?: string
    description?: string
    websiteUrl?: string
    vaultsToCreate?: "usdc" | "usdt" | "both"
  }): Promise<ClientRegistrationResponse>

  // Step 2: Configure strategies
  configureVaultStrategies(productId: string, data: {
    chain: string
    token_address: string
    token_symbol: string
    strategies: Array<{
      category: "lending" | "lp" | "staking"
      target: number
    }>
  }): Promise<{ success: boolean; message: string }>

  // Step 3: Configure bank accounts (optional)
  configureBankAccounts(productId: string, data: {
    bankAccounts: Array<{
      currency: string
      bank_name: string
      account_number: string
      account_name: string
      bank_details?: any
    }>
  }): Promise<{ success: boolean; productId: string; bankAccounts: any[] }>

  // Step 4: Generate API key (after dashboard redirect)
  regenerateApiKey(productId: string): Promise<{
    success: boolean
    api_key: string
    productId: string
    message: string
  }>
}
```

### 3. UserStore Integration

```typescript
// From: apps/whitelabel-web/src/store/userStore.ts

// After successful client registration, add to store:
const { addOrganization, setActiveProductId } = useUserStore.getState()

addOrganization({
  id: response.id,
  productId: response.productId,
  companyName: response.companyName,
  businessType: response.businessType,
  description: response.description,
  websiteUrl: response.websiteUrl,
  isActive: response.isActive,
  isSandbox: response.isSandbox,
  createdAt: response.createdAt,
  updatedAt: response.updatedAt,
})

// Set as active product
setActiveProductId(response.productId)
```

### 4. Privy Authentication Check

```typescript
// From: APITestingPage.tsx authentication flow

import { usePrivy } from "@privy-io/react-auth"
import { useUserStore } from "@/store/userStore"

const { user, authenticated } = usePrivy()
const { organizations, privyOrganizationId, privyWalletAddress } = useUserStore()

// Check if user has existing products
useEffect(() => {
  if (authenticated && user) {
    // Load user's organizations
    const loadOrganizations = async () => {
      const orgs = await b2bApiClient.getOrganizationsByPrivyId(privyOrganizationId)
      if (orgs.length > 0) {
        // User has existing products
        navigate('/dashboard')
      } else {
        // New user - continue onboarding
        // Stay on current page
      }
    }
    loadOrganizations()
  }
}, [authenticated, user])
```

### 5. Form Components to Adapt

#### 5.1 Company Info Form Fields
```typescript
// Adapt from APITestingPage.tsx endpoint configuration

const companyInfoFields = [
  {
    id: "companyName",
    label: "Company Name",
    type: "text",
    required: true,
    placeholder: "Acme Corporation"
  },
  {
    id: "businessType",
    label: "Business Type",
    type: "select",
    required: true,
    options: ["E-commerce", "FinTech", "Gaming", "Streaming", "Marketplace", "Other"]
  },
  {
    id: "customerTier",
    label: "Customer Base Size",
    type: "radio",
    required: true,
    options: [
      { value: "0-1000", label: "0-1,000 customers" },
      { value: "1000-10000", label: "1,000-10,000 customers" },
      { value: "10000-100000", label: "10,000-100,000 customers" },
      { value: "100000-1000000", label: "100,000-1,000,000 customers" },
      { value: "1000000+", label: "1,000,000+ customers" }
    ]
  },
  {
    id: "estimatedAUM",
    label: "Estimated Assets Under Management",
    type: "number",
    required: true,
    placeholder: "1000000",
    prefix: "$"
  }
]
```

#### 5.2 Strategy Ranking Component
```typescript
// New component needed - use drag-and-drop library
// Suggested: @dnd-kit/sortable

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

const strategies = [
  {
    id: 'defi',
    name: 'DeFi Lending',
    description: 'Low risk, steady yields (5-8% APY)',
    protocols: ['AAVE', 'Compound', 'Morpho']
  },
  {
    id: 'lp',
    name: 'Liquidity Pools',
    description: 'Medium risk, higher yields (8-15% APY)',
    protocols: ['Uniswap', 'Curve', 'Balancer']
  },
  {
    id: 'cefi',
    name: 'CeFi Platforms',
    description: 'Low risk, regulated (4-6% APY)',
    protocols: ['Licensed partners']
  },
  {
    id: 'hedge',
    name: 'Hedging Strategies',
    description: 'Risk mitigation (3-5% APY)',
    protocols: ['Delta-neutral positions']
  },
  {
    id: 'arbitrage',
    name: 'Arbitrage',
    description: 'Advanced strategies (Variable)',
    protocols: ['Cross-protocol opportunities']
  }
]
```

### 6. Zustand Store Setup

```typescript
// New file: apps/whitelabel-web/src/store/onboardingStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface OnboardingState {
  currentStep: number
  completedSteps: number[]

  companyInfo: {
    companyName: string
    businessType: string
    description: string
    websiteUrl: string
    customerTier: string
    estimatedAUM: string
    industry: string
  }

  strategies: {
    priorities: Array<{ id: string; rank: number }>
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  }

  bankingInfo: {
    configured: boolean
    accounts: Array<{
      currency: string
      bank_name: string
      account_number: string
      account_name: string
      swift_code?: string
    }>
  }

  // Actions
  setCompanyInfo: (info: any) => void
  setStrategies: (strategies: any) => void
  setBankingInfo: (banking: any) => void
  nextStep: () => void
  previousStep: () => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Actions implementation
      setCompanyInfo: (info) => set({ companyInfo: info }),

      setStrategies: (strategies) => set({ strategies }),

      setBankingInfo: (banking) => set({ bankingInfo: banking }),

      nextStep: () => set((state) => ({
        currentStep: state.currentStep + 1,
        completedSteps: [...new Set([...state.completedSteps, state.currentStep])]
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
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### 7. Route Configuration

```typescript
// New routes to create:

// apps/whitelabel-web/src/routes/index.tsx (Landing page)
import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/feature/landing/LandingPage'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

// apps/whitelabel-web/src/routes/client-register/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { OnboardingLayout } from '@/feature/onboarding/OnboardingLayout'

export const Route = createFileRoute('/client-register/')({
  component: OnboardingLayout,
})

// apps/whitelabel-web/src/routes/client-register/company-info.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CompanyInfoForm } from '@/feature/onboarding/components/CompanyInfoForm'

export const Route = createFileRoute('/client-register/company-info')({
  component: CompanyInfoForm,
})

// Similar for strategies.tsx and banking.tsx
```

### 8. API Key Notification Component

```typescript
// New component: apps/whitelabel-web/src/components/notifications/ApiKeyNotification.tsx

import { AlertCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function ApiKeyNotification({ productId }: { productId: string }) {
  const navigate = useNavigate()

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            Setup Required
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Generate your API key to start integrating the Proxify SDK
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Go to Settings →
        </button>
      </div>
    </div>
  )
}
```

### 9. Validation Patterns

```typescript
// Form validation using Zod (already in project)

import { z } from 'zod'

const companyInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().optional(),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  customerTier: z.enum(['0-1000', '1000-10000', '10000-100000', '100000-1000000', '1000000+']),
  estimatedAUM: z.string().regex(/^\d+$/, 'Must be a valid number'),
  industry: z.string().min(1, 'Industry is required')
})

const validateStep = (step: number, data: any) => {
  switch(step) {
    case 0:
      return companyInfoSchema.safeParse(data)
    case 1:
      // Validate strategies
      return data.priorities.length === 5
    case 2:
      // Banking is optional
      return true
    default:
      return false
  }
}
```

### 10. Success Handler

```typescript
// After successful creation

const handleSuccess = async () => {
  try {
    // Step 1: Register client
    const client = await b2bApiClient.registerClient({
      ...companyInfo,
      privyOrganizationId,
      privyWalletAddress,
      privyEmail
    })

    // Step 2: Configure strategies (map priorities to percentages)
    const strategyConfig = mapPrioritiesToConfig(strategies.priorities)
    await b2bApiClient.configureVaultStrategies(client.productId, {
      chain: "8453", // Base
      token_address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC
      token_symbol: "USDC",
      strategies: strategyConfig
    })

    // Step 3: Configure banking if provided
    if (bankingInfo.configured) {
      await b2bApiClient.configureBankAccounts(client.productId, {
        bankAccounts: bankingInfo.accounts
      })
    }

    // Step 4: Update stores
    addOrganization(client)
    setActiveProductId(client.productId)

    // Step 5: Clear onboarding state
    resetOnboarding()

    // Step 6: Redirect to dashboard
    navigate('/dashboard', {
      state: { showApiKeyNotification: true }
    })

  } catch (error) {
    console.error('Onboarding failed:', error)
    // Show error toast
  }
}
```

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.0.8",
    "@dnd-kit/sortable": "^7.0.2",
    "@dnd-kit/utilities": "^3.2.1",
    "zustand": "^4.4.7",
    "zod": "^3.22.4"
  }
}
```

## 🎯 Implementation Checklist

- [ ] Install required dependencies
- [ ] Create onboarding store with Zustand
- [ ] Create landing page with Get Started button
- [ ] Implement Privy authentication check
- [ ] Create multi-step form layout
- [ ] Build company info form component
- [ ] Build strategy ranking component with DnD
- [ ] Build bank account form (reuse from Settings)
- [ ] Implement form validation with Zod
- [ ] Create success confirmation page
- [ ] Add API key notification component
- [ ] Test complete flow end-to-end
- [ ] Add error handling and loading states
- [ ] Implement mobile responsive design
- [ ] Add analytics tracking

---

**Implementation Guide Version:** 1.0.0
**References:** APITestingPage.tsx, SettingsPage.tsx
**Last Updated:** 2024-12-03