# On-Ramp API Client Implementation Plan

**Date:** 2025-11-16
**Purpose:** Implement TWO on-ramp flows for SDK integration (hook-based, no UI)

---

## 🎯 Overview

### **Two On-Ramp Types:**

**Type 1: External Payment (Apple Pay/Card)**
```
End-User → Apple Pay/Transak → $100 USD → Transak → 99.5 USDC → Proxify Wallet
```
- User pays NEW money from external source
- Uses Transak/MoonPay for fiat → crypto conversion
- Requires payment gateway integration

**Type 2: Internal Balance Transfer**
```
End-User (YouTube) → Has $10k balance → Transfer $5k → Proxify Pool → 5k USDC
```
- User uses EXISTING balance in client's system (YouTube, E-commerce, etc.)
- No external payment needed
- Client's backend transfers fiat to Proxify
- Proxify converts fiat → USDC internally

### **SDK Approach:**
- ✅ **Hook-based API** (`useProxifyDeposit`) - NOT UI components
- ✅ Client builds their own UI
- ✅ Hook handles API calls, state management, polling
- ✅ Client decides UX (modal, page, inline, etc.)

---

## 📊 Architecture

### **Flow 1: External Payment (Apple Pay/Transak)**

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT APP (YouTube)                      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  import { useProxifyDeposit } from '@proxify/sdk'  │      │
│  │                                                    │      │
│  │  const { deposit, status } = useProxifyDeposit()  │      │
│  │                                                    │      │
│  │  // Client's custom UI                            │      │
│  │  <CustomDepositModal>                             │      │
│  │    <button onClick={() => deposit({              │      │
│  │      type: 'external',                           │      │
│  │      userId: 'user_123',                         │      │
│  │      amount: 100,                                │      │
│  │      method: 'apple_pay'                         │      │
│  │    })}>                                          │      │
│  │      Pay with Apple Pay                          │      │
│  │    </button>                                     │      │
│  │  </CustomDepositModal>                            │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    PROXIFY SDK (Hook)                         │
│  deposit({ type: 'external', ... })                          │
│  ↓ Calls Proxify API                                         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                     PROXIFY API                               │
│  POST /api/v1/deposits                                        │
│  { type: 'external', method: 'apple_pay' }                    │
│  ↓ Creates Transak order                                     │
│  ↓ Returns payment URL                                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    TRANSAK (Payment Gateway)                  │
│  User completes Apple Pay → $100 USD                          │
│  Transak converts → 99.5 USDC                                 │
│  Sends to Proxify custodial wallet                            │
└──────────────────────────────────────────────────────────────┘
```

### **Flow 2: Internal Balance Transfer**

```
┌──────────────────────────────────────────────────────────────┐
│                 CLIENT APP (YouTube Backend)                  │
│                                                               │
│  User has $10k in YouTube balance                            │
│  User wants to deposit $5k to earn yield                      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  const { deposit } = useProxifyDeposit()          │      │
│  │                                                    │      │
│  │  deposit({                                        │      │
│  │    type: 'internal',                              │      │
│  │    userId: 'user_123',                            │      │
│  │    amount: 5000,                                  │      │
│  │    clientBalanceId: 'youtube_balance_abc123'     │      │
│  │  })                                               │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    PROXIFY SDK (Hook)                         │
│  deposit({ type: 'internal', ... })                          │
│  ↓ Calls Proxify API                                         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                     PROXIFY API                               │
│  POST /api/v1/deposits                                        │
│  { type: 'internal', amount: 5000 }                           │
│  ↓ Deducts $5k from YouTube's account with Proxify           │
│  ↓ Credits user's custodial wallet balance                   │
│  ↓ Converts to USDC internally (Proxify handles fiat→crypto) │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│               PROXIFY PAYMENT GATEWAY (Internal)              │
│  YouTube previously transferred $100M to Proxify              │
│  Proxify maintains fiat pool for instant conversions          │
│  Deducts $5k from YouTube's prepaid balance                   │
│  Converts to 5k USDC (1:1 ratio for simplicity)              │
│  Adds to user's custodial wallet                              │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    PROXIFY SDK (This App)                     │
│                                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │  Types (src/types/deposit.ts)                   │         │
│  │  - DepositRequest                               │         │
│  │  - DepositResponse                              │         │
│  │  - DepositStatus                                │         │
│  │  - TransakOrder                                 │         │
│  └─────────────────────────────────────────────────┘         │
│                              ↓                                │
│  ┌─────────────────────────────────────────────────┐         │
│  │  API Client (src/lib/api-client.ts)            │         │
│  │  - deposit(params)                              │         │
│  │  - getDepositStatus(orderId)                    │         │
│  │  - listDeposits()                               │         │
│  └─────────────────────────────────────────────────┘         │
│                              ↓                                │
│  ┌─────────────────────────────────────────────────┐         │
│  │  Hooks (src/hooks/useDeposit.ts)               │         │
│  │  - useCreateDeposit()                           │         │
│  │  - useDepositStatus(orderId)                    │         │
│  │  - useDeposits()                                │         │
│  └─────────────────────────────────────────────────┘         │
│                              ↓                                │
│  ┌─────────────────────────────────────────────────┐         │
│  │  Components (src/components/deposit/)          │         │
│  │  - <DepositButton />                            │         │
│  │  - <DepositModal />                             │         │
│  │  - <DepositStatusCard />                        │         │
│  └─────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                     PROXIFY API (Backend)                     │
│                                                               │
│  POST /api/v1/deposits                                        │
│  GET  /api/v1/deposits/:orderId                               │
│  GET  /api/v1/deposits                                        │
│                                                               │
│  ↓ Creates Transak Order                                      │
│  ↓ Returns payment URL                                        │
│  ↓ Receives webhooks                                          │
│  ↓ Updates deposit status                                     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    TRANSAK (On-Ramp Provider)                 │
│                                                               │
│  User completes payment via:                                  │
│  - Credit/Debit Card                                          │
│  - Bank Transfer (ACH/SEPA)                                   │
│  - Apple Pay                                                  │
│                                                               │
│  Converts: $100 USD → 99.5 USDC                               │
│  Sends to: Custodial Wallet (Privy)                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Tasks

### Phase 1: Types & API Client

#### 1.1 Create Deposit Types

**File:** `src/types/deposit.ts`

```typescript
// Deposit request - TWO TYPES
export type DepositRequest = 
  | ExternalDepositRequest 
  | InternalDepositRequest

// Type 1: External payment (Apple Pay, Transak, MoonPay)
export interface ExternalDepositRequest {
  type: 'external'
  productId: string
  userId: string
  amount: number
  currency: 'USD' | 'EUR' | 'GBP'
  method: 'apple_pay' | 'card' | 'bank_transfer'
  
  // User details (for KYC)
  userEmail?: string
  userPhone?: string
  
  // Redirect URL after payment
  returnUrl?: string
}

// Type 2: Internal balance transfer (YouTube balance → Proxify)
export interface InternalDepositRequest {
  type: 'internal'
  productId: string
  userId: string
  amount: number
  currency: 'USD' | 'EUR' | 'GBP'
  
  // Client's internal balance reference
  clientBalanceId: string // e.g., "youtube_balance_abc123"
  
  // Optional: Specify source account
  sourceAccountId?: string
}

// Deposit response - DIFFERENT based on type
export type DepositResponse = 
  | ExternalDepositResponse 
  | InternalDepositResponse

// Response for external payment
export interface ExternalDepositResponse {
  success: boolean
  data: {
    orderId: string
    status: DepositStatus
    type: 'external'
    
    // Payment details
    paymentUrl: string // Transak/MoonPay payment URL
    paymentMethod: string // 'apple_pay', 'card', etc.
    
    // Wallet details
    walletAddress: string
    estimatedCrypto: number // USDC amount
    
    // Fees
    fees: {
      gateway: number // Transak/MoonPay fee
      proxify: number
      network: number
      total: number
    }
    
    // Expiry
    expiresAt: string // ISO timestamp (usually 15-30 min)
  }
}

// Response for internal transfer
export interface InternalDepositResponse {
  success: boolean
  data: {
    orderId: string
    status: DepositStatus
    type: 'internal'
    
    // No payment URL (instant transfer)
    // No fees (internal transfer)
    
    // Wallet details
    walletAddress: string
    cryptoAmount: number // USDC amount
    
    // Balance references
    clientBalanceId: string
    deductedFromClient: number // Amount deducted from client's Proxify balance
    
    // Instant completion
    completedAt: string // ISO timestamp
  }
}

// Deposit status enum
export type DepositStatus = 
  // External payment statuses
  | 'PENDING'           // Order created, awaiting payment
  | 'AWAITING_PAYMENT'  // Payment URL generated (Transak/MoonPay)
  | 'PROCESSING'        // Payment received, converting to USDC
  | 'COMPLETED'         // USDC deposited to wallet
  | 'FAILED'            // Payment failed
  | 'EXPIRED'           // Order expired (payment timeout)
  | 'CANCELLED'         // User cancelled
  
  // Internal transfer statuses (much simpler)
  | 'INSTANT_COMPLETED' // Internal transfer completed immediately

// Deposit details (for status queries)
export type Deposit = ExternalDeposit | InternalDeposit

// External deposit (full details)
export interface ExternalDeposit {
  orderId: string
  type: 'external'
  status: DepositStatus
  productId: string
  userId: string
  walletAddress: string
  
  // Amounts
  fiatAmount: number
  cryptoAmount: number | null
  currency: string
  cryptoCurrency: string
  
  // Fees
  fees: {
    gateway: number // Transak/MoonPay
    proxify: number
    network: number
    total: number
  }
  
  // Payment details
  paymentMethod: 'apple_pay' | 'card' | 'bank_transfer'
  paymentUrl?: string
  gatewayOrderId?: string // Transak/MoonPay order ID
  
  // Timestamps
  createdAt: string
  completedAt?: string
  failedAt?: string
  expiresAt?: string
  
  // Error details (if failed)
  errorMessage?: string
  errorCode?: string
}

// Internal deposit (simpler)
export interface InternalDeposit {
  orderId: string
  type: 'internal'
  status: 'INSTANT_COMPLETED' | 'FAILED'
  productId: string
  userId: string
  walletAddress: string
  
  // Amounts (no fees)
  fiatAmount: number
  cryptoAmount: number // Always set (instant conversion)
  currency: string
  cryptoCurrency: string
  
  // Balance references
  clientBalanceId: string
  deductedFromClient: number
  
  // Timestamps (instant)
  createdAt: string
  completedAt: string // Always set (instant)
  
  // Error (rare, only if client has insufficient balance)
  errorMessage?: string
  errorCode?: string
}

// Transak webhook event
export interface TransakWebhookEvent {
  eventName: 'ORDER_COMPLETED' | 'ORDER_FAILED' | 'ORDER_CANCELLED'
  order: {
    id: string
    status: string
    partnerCustomerId: string // Our userId
    walletAddress: string
    cryptoAmount: number
    fiatAmount: number
  }
}
```

#### 1.2 Add Deposit Methods to API Client

**File:** `src/lib/api-client.ts` (extend existing)

```typescript
// Add to apiClient.endpoints
export const apiClient = axios.create({
  // ... existing config
})

// Add deposit endpoints
apiClient.endpoints = {
  // ... existing endpoints
  
  deposits: {
    create: '/deposits',
    getById: (orderId: string) => `/deposits/${orderId}`,
    list: '/deposits',
    // New: Get client's prepaid balance (for internal transfers)
    clientBalance: '/deposits/client-balance'
  }
}

// Add deposit API methods
export const depositAPI = {
  /**
   * Create a new deposit order (BOTH types handled)
   * POST /api/v1/deposits
   */
  createDeposit: async (params: DepositRequest): Promise<DepositResponse> => {
    const response = await apiClient.post<DepositResponse>(
      apiClient.endpoints.deposits.create,
      params
    )
    return response.data
  },

  /**
   * Get deposit status by order ID
   * GET /api/v1/deposits/:orderId
   */
  getDepositStatus: async (orderId: string): Promise<Deposit> => {
    const response = await apiClient.get<APIResponse<Deposit>>(
      apiClient.endpoints.deposits.getById(orderId)
    )
    return response.data.data
  },

  /**
   * List all deposits for a user
   * GET /api/v1/deposits?userId=xxx
   */
  listDeposits: async (userId: string): Promise<PaginatedResponse<Deposit>> => {
    const response = await apiClient.get<PaginatedResponse<Deposit>>(
      apiClient.endpoints.deposits.list,
      { params: { userId } }
    )
    return response.data
  },

  /**
   * Get client's prepaid balance with Proxify (for internal transfers)
   * GET /api/v1/deposits/client-balance
   */
  getClientBalance: async (): Promise<{ 
    available: number
    reserved: number
    total: number
    currency: string
  }> => {
    const response = await apiClient.get(
      apiClient.endpoints.deposits.clientBalance
    )
    return response.data.data
  }
}
```

---

### Phase 2: React Query Hooks

#### 2.1 Create Deposit Hooks (Main Hook: `useProxifyDeposit`)

**File:** `src/hooks/useProxifyDeposit.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { depositAPI } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import type { 
  DepositRequest, 
  DepositResponse,
  ExternalDepositResponse,
  InternalDepositResponse,
  Deposit 
} from '@/types/deposit'

/**
 * Main hook for deposits (BOTH external and internal)
 * 
 * Usage:
 * const { deposit, status, orderId } = useProxifyDeposit()
 * 
 * // External payment
 * deposit({ type: 'external', userId: '123', amount: 100, method: 'apple_pay' })
 * 
 * // Internal transfer
 * deposit({ type: 'internal', userId: '123', amount: 5000, clientBalanceId: 'abc' })
 */
export function useProxifyDeposit() {
  const queryClient = useQueryClient()
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

  // Create deposit mutation
  const { 
    mutate: deposit, 
    mutateAsync: depositAsync,
    isPending,
    error 
  } = useMutation({
    mutationFn: (params: DepositRequest) => depositAPI.createDeposit(params),
    onSuccess: (response) => {
      // Invalidate deposits list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.deposits.all 
      })

      // Store order ID for status tracking
      setCurrentOrderId(response.data.orderId)

      // Handle external payment (open payment URL)
      if (response.data.type === 'external' && response.data.paymentUrl) {
        window.open(response.data.paymentUrl, '_blank')
      }

      // Internal transfer is instant, no need to do anything
    },
    onError: (error) => {
      console.error('Failed to create deposit:', error)
    }
  })

  // Get deposit status (auto-polls for external, instant for internal)
  const { data: depositStatus } = useDepositStatus(currentOrderId)

  return {
    // Functions
    deposit,           // Trigger deposit
    depositAsync,      // Async version (returns promise)
    
    // State
    isPending,         // Loading state
    error,             // Error object
    orderId: currentOrderId, // Current order ID
    status: depositStatus,   // Deposit status (auto-updates)
    
    // Helpers
    reset: () => setCurrentOrderId(null) // Reset state
  }
}

/**
 * Get real-time deposit status
 * Polls every 5s for EXTERNAL deposits (until completed/failed)
 * No polling for INTERNAL deposits (instant completion)
 */
export function useDepositStatus(orderId: string | null) {
  return useQuery({
    queryKey: queryKeys.deposits.detail(orderId!),
    queryFn: () => depositAPI.getDepositStatus(orderId!),
    enabled: !!orderId, // Only run if orderId exists
    refetchInterval: (data) => {
      // Don't poll for internal transfers (instant)
      if (data?.type === 'internal') {
        return false
      }

      // Poll every 5s for external if pending/processing
      if (
        data?.type === 'external' &&
        (data?.status === 'PENDING' || 
         data?.status === 'AWAITING_PAYMENT' || 
         data?.status === 'PROCESSING')
      ) {
        return 5000 // 5 seconds
      }
      
      return false // Stop polling when completed/failed
    },
    staleTime: 0 // Always fetch fresh data
  })
}

/**
 * Get client's prepaid balance (for internal transfers)
 * Shows how much fiat the client has deposited with Proxify
 */
export function useClientBalance() {
  return useQuery({
    queryKey: queryKeys.deposits.clientBalance,
    queryFn: () => depositAPI.getClientBalance(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true
  })
}

/**
 * List all deposits for a user
 */
export function useDeposits(userId: string) {
  return useQuery({
    queryKey: queryKeys.deposits.list(userId),
    queryFn: () => depositAPI.listDeposits(userId),
    staleTime: 30 * 1000 // 30 seconds
  })
}
```

#### 2.2 Add Query Keys

**File:** `src/lib/query-client.ts` (extend existing)

```typescript
export const queryKeys = {
  // ... existing keys
  
  deposits: {
    all: ['deposits'] as const,
    lists: () => [...queryKeys.deposits.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.deposits.lists(), userId] as const,
    details: () => [...queryKeys.deposits.all, 'detail'] as const,
    detail: (orderId: string) => [...queryKeys.deposits.details(), orderId] as const,
    clientBalance: ['deposits', 'client-balance'] as const
  }
}
```

---

### Phase 3: Usage Examples (Client Builds Their Own UI)

#### 3.1 Example: YouTube Internal Transfer

**File:** `apps/client-demo/YouTubeDepositExample.tsx`

```typescript
// YouTube's custom UI (they control everything)
import { useProxifyDeposit, useClientBalance } from '@proxify/sdk'
import { useState } from 'react'

export function YouTubeCreatorDashboard({ creatorId }: { creatorId: string }) {
  const [amount, setAmount] = useState(5000)
  
  // Get creator's YouTube balance (from YouTube's API)
  const youtubeBalance = 10000 // $10k in YouTube
  
  // Get Proxify client balance (how much YouTube has with Proxify)
  const { data: clientBalance } = useClientBalance()
  
  // Proxify deposit hook
  const { deposit, isPending, status } = useProxifyDeposit()

  const handleInternalTransfer = () => {
    deposit({
      type: 'internal',
      productId: 'youtube',
      userId: creatorId,
      amount: amount,
      currency: 'USD',
      clientBalanceId: `youtube_balance_${creatorId}`
    })
  }

  return (
    <div className="youtube-dashboard">
      <h1>Creator Earnings Dashboard</h1>
      
      {/* YouTube Balance */}
      <div className="balance-card">
        <h2>Your YouTube Balance</h2>
        <p className="amount">${youtubeBalance.toLocaleString()}</p>
        <p className="description">Available for withdrawal or earning yield</p>
      </div>

      {/* Proxify Yield Info */}
      <div className="yield-card">
        <h2>💰 Earn 7.3% APY on Idle Balance</h2>
        <p>Transfer funds to Proxify to earn yield while waiting for payout</p>
        
        <div className="transfer-form">
          <label>Amount to Transfer</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            max={Math.min(youtubeBalance, clientBalance?.available || 0)}
          />
          
          <button 
            onClick={handleInternalTransfer}
            disabled={isPending || amount > youtubeBalance}
          >
            {isPending ? 'Processing...' : `Transfer $${amount} to Earn Yield`}
          </button>
        </div>

        {/* Status */}
        {status && status.type === 'internal' && (
          <div className="success-message">
            ✅ Transfer complete! Now earning 7.3% APY on ${status.cryptoAmount}
          </div>
        )}
      </div>

      {/* Client Balance Info (for transparency) */}
      <div className="info-card">
        <h3>How it works:</h3>
        <ol>
          <li>YouTube has ${clientBalance?.total.toLocaleString()} deposited with Proxify</li>
          <li>When you transfer, it's instant (no payment needed)</li>
          <li>Your $${amount} stays in YouTube's account, but earns yield for you</li>
          <li>Withdraw anytime back to YouTube balance</li>
        </ol>
      </div>
    </div>
  )
}
```

#### 3.2 Example: E-Commerce External Payment (Apple Pay)

**File:** `apps/client-demo/EcommerceApplePayExample.tsx`

```typescript
// E-commerce platform's custom checkout (Apple Pay deposit)
import { useProxifyDeposit } from '@proxify/sdk'
import { useState } from 'react'

export function CheckoutPage({ cartTotal, userId }: { cartTotal: number, userId: string }) {
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card'>('apple_pay')
  
  // Proxify deposit hook
  const { deposit, isPending, status, orderId } = useProxifyDeposit()

  const handlePayWithApplePay = async () => {
    // Create external deposit (Apple Pay)
    await deposit({
      type: 'external',
      productId: 'my-ecommerce',
      userId: userId,
      amount: cartTotal,
      currency: 'USD',
      method: 'apple_pay',
      userEmail: 'user@example.com', // From user profile
      returnUrl: `${window.location.origin}/checkout/success`
    })

    // deposit() opens Apple Pay popup automatically
    // User completes payment there
    // Status updates via webhook (auto-polling in hook)
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="order-summary">
        <h2>Order Summary</h2>
        <p>Total: ${cartTotal}</p>
      </div>

      <div className="payment-section">
        <h2>Payment Method</h2>
        
        {/* Apple Pay Button */}
        <button 
          className="apple-pay-button"
          onClick={handlePayWithApplePay}
          disabled={isPending}
        >
          {isPending ? 'Processing...' : ' Pay with Apple Pay'}
        </button>

        {/* Status Display */}
        {status && status.type === 'external' && (
          <div className="payment-status">
            {status.status === 'AWAITING_PAYMENT' && (
              <p>⏳ Complete payment in the popup window...</p>
            )}
            {status.status === 'PROCESSING' && (
              <p>⚙️ Processing your payment...</p>
            )}
            {status.status === 'COMPLETED' && (
              <div className="success">
                <p>✅ Payment successful!</p>
                <p>Order #{orderId} confirmed</p>
                <p>Earning 7.3% APY on your store credit</p>
              </div>
            )}
            {status.status === 'FAILED' && (
              <div className="error">
                <p>❌ Payment failed: {status.errorMessage}</p>
                <button onClick={handlePayWithApplePay}>Try Again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 3.3 Example: Combined Flow (Choose Payment Type)

**File:** `apps/client-demo/FlexibleDepositExample.tsx`

```typescript
// Client app with BOTH internal and external payment options
import { useProxifyDeposit, useClientBalance } from '@proxify/sdk'
import { useState } from 'react'

export function FlexibleWalletDeposit({ userId }: { userId: string }) {
  const [amount, setAmount] = useState(100)
  const [method, setMethod] = useState<'internal' | 'external'>('internal')
  
  const { deposit, isPending, status } = useProxifyDeposit()
  const { data: clientBalance } = useClientBalance()

  const handleDeposit = () => {
    if (method === 'internal') {
      // Use internal balance transfer (instant, no fees)
      deposit({
        type: 'internal',
        productId: 'my-app',
        userId,
        amount,
        currency: 'USD',
        clientBalanceId: `user_${userId}_balance`
      })
    } else {
      // Use external payment (Apple Pay, has fees)
      deposit({
        type: 'external',
        productId: 'my-app',
        userId,
        amount,
        currency: 'USD',
        method: 'apple_pay',
        returnUrl: `${window.location.origin}/wallet/success`
      })
    }
  }

  return (
    <div className="deposit-widget">
      <h2>Add Funds to Wallet</h2>

      {/* Amount Input */}
      <div>
        <label>Amount</label>
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      {/* Payment Method Selection */}
      <div className="payment-methods">
        <button 
          className={method === 'internal' ? 'active' : ''}
          onClick={() => setMethod('internal')}
        >
          Use My Balance (Instant, Free)
        </button>
        <button 
          className={method === 'external' ? 'active' : ''}
          onClick={() => setMethod('external')}
        >
           Apple Pay (3% fee)
        </button>
      </div>

      {/* Info Based on Method */}
      {method === 'internal' ? (
        <div className="info">
          <p>Available balance: ${clientBalance?.available || 0}</p>
          <p>✅ Instant transfer</p>
          <p>✅ No fees</p>
        </div>
      ) : (
        <div className="info">
          <p>💳 Pay with Apple Pay</p>
          <p>⚠️ 3% processing fee</p>
          <p>You'll receive: ${(amount * 0.97).toFixed(2)}</p>
        </div>
      )}

      {/* Deposit Button */}
      <button 
        onClick={handleDeposit}
        disabled={isPending || (method === 'internal' && amount > (clientBalance?.available || 0))}
      >
        {isPending ? 'Processing...' : `Deposit $${amount}`}
      </button>

      {/* Status */}
      {status && (
        <div className="status">
          {status.type === 'internal' && status.status === 'INSTANT_COMPLETED' && (
            <p>✅ Instant transfer complete! Now earning 7.3% APY</p>
          )}
          {status.type === 'external' && status.status === 'COMPLETED' && (
            <p>✅ Payment successful! Now earning 7.3% APY</p>
          )}
          {status.type === 'external' && status.status === 'AWAITING_PAYMENT' && (
            <p>⏳ Complete payment in popup...</p>
          )}
        </div>
      )}
    </div>
  )
}
```

---

### Phase 4: Demo Page

#### 4.1 Create Deposits Page

**File:** `src/pages/dashboard/DepositsPage.tsx`

```typescript
import { useState } from 'react'
import { useDeposits } from '@/hooks/useDeposit'
import { DepositModal } from '@/components/deposit/DepositModal'
import { DepositStatusCard } from '@/components/deposit/DepositStatusCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DepositsPage() {
  const userId = 'demo-user-123' // TODO: Get from auth context
  const { data: deposits, isLoading } = useDeposits(userId)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deposits</h1>
          <p className="text-muted-foreground">
            Add funds to your wallet to start earning yield
          </p>
        </div>
        <DepositModal userId={userId} />
      </div>

      {/* Deposits List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : deposits?.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No deposits yet</p>
          <DepositModal
            userId={userId}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Make Your First Deposit
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deposits?.data.map((deposit) => (
            <DepositStatusCard key={deposit.orderId} orderId={deposit.orderId} />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create `src/types/deposit.ts` with TWO types (external + internal)
- [ ] Extend `src/lib/api-client.ts` with deposit endpoints + client balance
- [ ] Test API client methods (mock responses for both types)

### Phase 2: Data Layer (Week 2)
- [ ] Create `src/hooks/useProxifyDeposit.ts` (main hook)
- [ ] Create `src/hooks/useClientBalance.ts` (for internal transfers)
- [ ] Add query keys to `src/lib/query-client.ts`
- [ ] Test hooks with mock data (both external + internal)

### Phase 3: Demo Examples (Week 3)
- [ ] Build YouTube internal transfer demo
- [ ] Build E-commerce Apple Pay demo
- [ ] Build combined flow demo (both methods)
- [ ] Document hook usage patterns

### Phase 4: Backend Integration (Week 4)
- [ ] Backend: Implement client prepaid balance system
- [ ] Backend: Add internal transfer logic
- [ ] Backend: Integrate Transak for external payments
- [ ] Test end-to-end flows

### Phase 5: Polish (Week 5)
- [ ] Add comprehensive error handling (insufficient balance, etc.)
- [ ] Add success notifications
- [ ] Add deposit history table (with type filtering)
- [ ] Add client balance dashboard
- [ ] Write SDK documentation

---

## 📚 Next Steps

1. **Review this plan** - Make sure architecture aligns with your backend API design
2. **Start with types** - Create `src/types/deposit.ts` first
3. **Mock API responses** - Test frontend before backend is ready
4. **Build incrementally** - One component at a time, test as you go

---

## 🔗 References

- [PRODUCT_OWNER_FLOW.md](../../../PRODUCT_OWNER_FLOW.md) - Business flow
- [END_USER_FLOW.md](../../../END_USER_FLOW.md) - User experience
- [ON_OFF_RAMP_INTEGRATION.md](../../../docs/technical/ON_OFF_RAMP_INTEGRATION.md) - Transak integration
- [SYSTEM_ARCHITECTURE.md](../../../SYSTEM_ARCHITECTURE.md) - Overall architecture

---

**Ready to implement? Start with Phase 1!** 🚀
