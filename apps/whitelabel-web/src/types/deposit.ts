/**
 * Deposit Types for B2B On-Ramp API
 * Supports TWO on-ramp flows:
 * 1. External Payment (Apple Pay/Transak) - User pays NEW money
 * 2. Internal Balance Transfer - User uses EXISTING balance in client's system
 */

// ============================================
// DEPOSIT REQUEST TYPES
// ============================================

/**
 * Deposit request - TWO TYPES
 */
export type DepositRequest = ExternalDepositRequest | InternalDepositRequest

/**
 * Type 1: External payment (Apple Pay, Transak, MoonPay)
 * User pays NEW money from bank/card → Transak converts → USDC
 */
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

/**
 * Type 2: Internal balance transfer (YouTube balance → Proxify)
 * User uses EXISTING balance in client's system → Instant transfer
 */
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

// ============================================
// DEPOSIT RESPONSE TYPES
// ============================================

/**
 * Deposit response - DIFFERENT based on type
 */
export type DepositResponse =
  | ExternalDepositResponse
  | InternalDepositResponse

/**
 * Response for external payment
 */
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

/**
 * Response for internal transfer
 */
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

// ============================================
// DEPOSIT STATUS TYPES
// ============================================

/**
 * Deposit status enum
 */
export type DepositStatus =
  // External payment statuses
  | 'PENDING' // Order created, awaiting payment
  | 'AWAITING_PAYMENT' // Payment URL generated (Transak/MoonPay)
  | 'PROCESSING' // Payment received, converting to USDC
  | 'COMPLETED' // USDC deposited to wallet
  | 'FAILED' // Payment failed
  | 'EXPIRED' // Order expired (payment timeout)
  | 'CANCELLED' // User cancelled

  // Internal transfer statuses (much simpler)
  | 'INSTANT_COMPLETED' // Internal transfer completed immediately

// ============================================
// DEPOSIT DETAILS TYPES
// ============================================

/**
 * Deposit details (for status queries)
 */
export type Deposit = ExternalDeposit | InternalDeposit

/**
 * External deposit (full details)
 */
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

/**
 * Internal deposit (simpler)
 */
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

// ============================================
// CLIENT BALANCE TYPES
// ============================================

/**
 * Client's prepaid balance with Proxify
 * Used for internal transfers
 */
export interface ClientBalance {
  available: number // Available for transfers
  reserved: number // Reserved for pending operations
  total: number // Total balance (available + reserved)
  currency: string // Usually 'USD'
}

// ============================================
// WEBHOOK EVENT TYPES
// ============================================

/**
 * Transak webhook event (for external payments)
 */
export interface TransakWebhookEvent {
  eventName:
    | 'ORDER_CREATED'
    | 'ORDER_PROCESSING'
    | 'ORDER_COMPLETED'
    | 'ORDER_FAILED'
  orderId: string
  status: string
  fiatAmount: number
  cryptoAmount: number
  walletAddress: string
  transactionHash?: string
}

// ============================================
// PAGINATION TYPES
// ============================================

/**
 * Paginated response for deposit lists
 */
export interface PaginatedDeposits {
  data: Deposit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
