# Deposit & Staking Flow - Implementation Plan

**Created:** 2025-11-27
**Status:** Planning Phase
**Goal:** Implement end-user deposit flow with mock on-ramp and DeFi staking

---

## 📋 Overview

### Flow Summary
```
1. End-user clicks "Start Earning" (Demo UI)
   ↓
2. Create end-user account via API
   ↓
3. User initiates deposit → Creates OrderId in database
   ↓
4. Operation Dashboard shows deposit orders + AI analysis
   ↓
5. Mock On-Ramp Widget (Fiat → USDC simulation)
   ↓
6. Oracle mints Mock USDC to client's Privy custodial wallet
   ↓
7. Trigger DeFi staking (AAVE, Compound, etc.)
```

### Key Changes
- **Remove:** Swipable card UI in demo
- **Add:** Pure number display for Merchant balance
- **Add:** "Start Earning" button in Savings view
- **Add:** Deposit order tracking system
- **Add:** Operation Dashboard with AI insights
- **Add:** Mock on-ramp oracle service

---

## 🗄️ Phase 1: Database Schema

### 1.1 Create `deposit_orders` Table

**File:** `database/migrations/000004_add_deposit_orders.up.sql`

```sql
CREATE TABLE deposit_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) UNIQUE NOT NULL,

    -- Relations
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    end_user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,

    -- Order Details
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    target_currency VARCHAR(10) NOT NULL DEFAULT 'USDC',

    -- Status Tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Status: pending | mock_onramp_processing | completed | failed

    -- On-Ramp Details
    mock_onramp_tx_hash VARCHAR(255),
    usdc_minted_amount DECIMAL(20, 8),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB,

    INDEX idx_deposit_orders_client_id (client_id),
    INDEX idx_deposit_orders_end_user_id (end_user_id),
    INDEX idx_deposit_orders_status (status),
    INDEX idx_deposit_orders_order_id (order_id)
);

COMMENT ON TABLE deposit_orders IS 'Tracks end-user deposit requests and order lifecycle';
COMMENT ON COLUMN deposit_orders.order_id IS 'Unique order identifier shown to users';
COMMENT ON COLUMN deposit_orders.status IS 'Order lifecycle: pending → mock_onramp_processing → completed';
```

**Down Migration:** `database/migrations/000004_add_deposit_orders.down.sql`

```sql
DROP TABLE IF EXISTS deposit_orders;
```

### 1.2 Create `mock_usdc_mints` Table

**File:** `database/migrations/000005_add_mock_usdc_mints.up.sql`

```sql
CREATE TABLE mock_usdc_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    deposit_order_id UUID NOT NULL REFERENCES deposit_orders(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Mint Details
    amount DECIMAL(20, 8) NOT NULL,
    custodial_wallet_address VARCHAR(255) NOT NULL,
    mock_tx_hash VARCHAR(255) UNIQUE NOT NULL,

    -- Oracle Metadata
    oracle_service VARCHAR(50) DEFAULT 'mock_oracle',
    oracle_response JSONB,

    -- Timestamps
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX idx_mock_mints_deposit_order (deposit_order_id),
    INDEX idx_mock_mints_client (client_id),
    INDEX idx_mock_mints_tx_hash (mock_tx_hash)
);

COMMENT ON TABLE mock_usdc_mints IS 'Tracks mock USDC mints by oracle service';
COMMENT ON COLUMN mock_usdc_mints.mock_tx_hash IS 'Simulated blockchain transaction hash';
```

**Down Migration:** `database/migrations/000005_add_mock_usdc_mints.down.sql`

```sql
DROP TABLE IF EXISTS mock_usdc_mints;
```

---

## 🔍 Phase 2: SQL Queries (SQLC)

### 2.1 Deposit Order Queries

**File:** `database/queries/deposit_orders.sql`

```sql
-- name: CreateDepositOrder :one
INSERT INTO deposit_orders (
    order_id,
    client_id,
    end_user_id,
    amount,
    currency,
    target_currency,
    status,
    metadata
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: GetDepositOrderById :one
SELECT * FROM deposit_orders
WHERE id = $1 LIMIT 1;

-- name: GetDepositOrderByOrderId :one
SELECT * FROM deposit_orders
WHERE order_id = $1 LIMIT 1;

-- name: ListClientDepositOrders :many
SELECT * FROM deposit_orders
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListEndUserDepositOrders :many
SELECT * FROM deposit_orders
WHERE end_user_id = $1
ORDER BY created_at DESC;

-- name: UpdateDepositOrderStatus :one
UPDATE deposit_orders
SET
    status = $2,
    completed_at = CASE
        WHEN $2 = 'completed' THEN NOW()
        ELSE completed_at
    END
WHERE id = $1
RETURNING *;

-- name: UpdateDepositOrderWithMint :one
UPDATE deposit_orders
SET
    status = $2,
    mock_onramp_tx_hash = $3,
    usdc_minted_amount = $4,
    completed_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetPendingDepositOrders :many
SELECT * FROM deposit_orders
WHERE status = 'pending'
ORDER BY created_at ASC;
```

### 2.2 Mock USDC Mint Queries

**File:** `database/queries/mock_usdc_mints.sql`

```sql
-- name: CreateMockUsdcMint :one
INSERT INTO mock_usdc_mints (
    deposit_order_id,
    client_id,
    amount,
    custodial_wallet_address,
    mock_tx_hash,
    oracle_service,
    oracle_response
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetMintByDepositOrder :one
SELECT * FROM mock_usdc_mints
WHERE deposit_order_id = $1 LIMIT 1;

-- name: GetMintByTxHash :one
SELECT * FROM mock_usdc_mints
WHERE mock_tx_hash = $1 LIMIT 1;

-- name: ListClientMints :many
SELECT * FROM mock_usdc_mints
WHERE client_id = $1
ORDER BY minted_at DESC
LIMIT $2 OFFSET $3;
```

---

## 📦 Phase 3: DTO Layer

### 3.1 Deposit Order DTO

**File:** `packages/core/dto/b2b/deposit-order.dto.ts`

```typescript
export interface CreateDepositOrderRequest {
  clientId: string
  endUserId: string
  amount: string
  currency?: string
  targetCurrency?: string
  metadata?: Record<string, any>
}

export interface DepositOrderResponse {
  id: string
  orderId: string
  clientId: string
  endUserId: string
  amount: string
  currency: string
  targetCurrency: string
  status: 'pending' | 'mock_onramp_processing' | 'completed' | 'failed'
  mockOnrampTxHash?: string
  usdcMintedAmount?: string
  createdAt: string
  completedAt?: string
  metadata?: Record<string, any>
}

export interface ListDepositOrdersRequest {
  clientId: string
  limit?: number
  offset?: number
}

export interface DepositOrderStatsResponse {
  totalOrders: number
  totalVolume: string
  pendingOrders: number
  completedOrders: number
  avgOrderSize: string
}
```

### 3.2 Mock Oracle DTO

**File:** `packages/core/dto/b2b/mock-oracle.dto.ts`

```typescript
export interface ProcessMockOnRampRequest {
  depositOrderId: string
  custodialWalletAddress: string
}

export interface MockUsdcMintResponse {
  id: string
  depositOrderId: string
  amount: string
  custodialWalletAddress: string
  mockTxHash: string
  mintedAt: string
}
```

---

## 🏗️ Phase 4: Repository Layer

### 4.1 Deposit Order Repository

**File:** `packages/core/repository/postgres/deposit-order.repository.ts`

```typescript
import { Pool } from 'pg'
import { Queries } from '@proxify/sqlcgen'
import { CreateDepositOrderRequest, DepositOrderResponse } from '../../dto/b2b/deposit-order.dto'

export class DepositOrderRepository {
  constructor(
    private db: Pool,
    private queries: Queries
  ) {}

  async createDepositOrder(req: CreateDepositOrderRequest): Promise<DepositOrderResponse> {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const result = await this.queries.CreateDepositOrder(this.db, {
      order_id: orderId,
      client_id: req.clientId,
      end_user_id: req.endUserId,
      amount: req.amount,
      currency: req.currency || 'USD',
      target_currency: req.targetCurrency || 'USDC',
      status: 'pending',
      metadata: JSON.stringify(req.metadata || {}),
    })

    return this.mapToResponse(result)
  }

  async getByOrderId(orderId: string): Promise<DepositOrderResponse | null> {
    const result = await this.queries.GetDepositOrderByOrderId(this.db, orderId)
    return result ? this.mapToResponse(result) : null
  }

  async listClientOrders(clientId: string, limit = 50, offset = 0): Promise<DepositOrderResponse[]> {
    const results = await this.queries.ListClientDepositOrders(this.db, {
      client_id: clientId,
      limit,
      offset,
    })
    return results.map(this.mapToResponse)
  }

  async updateStatusWithMint(
    id: string,
    status: string,
    txHash: string,
    amount: string
  ): Promise<DepositOrderResponse> {
    const result = await this.queries.UpdateDepositOrderWithMint(this.db, {
      id,
      status,
      mock_onramp_tx_hash: txHash,
      usdc_minted_amount: amount,
    })
    return this.mapToResponse(result)
  }

  private mapToResponse(row: any): DepositOrderResponse {
    return {
      id: row.id,
      orderId: row.order_id,
      clientId: row.client_id,
      endUserId: row.end_user_id,
      amount: row.amount,
      currency: row.currency,
      targetCurrency: row.target_currency,
      status: row.status,
      mockOnrampTxHash: row.mock_onramp_tx_hash,
      usdcMintedAmount: row.usdc_minted_amount,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      metadata: row.metadata,
    }
  }
}
```

### 4.2 Mock Oracle Repository

**File:** `packages/core/repository/postgres/mock-oracle.repository.ts`

```typescript
import { Pool } from 'pg'
import { Queries } from '@proxify/sqlcgen'

export class MockOracleRepository {
  constructor(
    private db: Pool,
    private queries: Queries
  ) {}

  async createMint(params: {
    depositOrderId: string
    clientId: string
    amount: string
    walletAddress: string
    txHash: string
  }) {
    return await this.queries.CreateMockUsdcMint(this.db, {
      deposit_order_id: params.depositOrderId,
      client_id: params.clientId,
      amount: params.amount,
      custodial_wallet_address: params.walletAddress,
      mock_tx_hash: params.txHash,
      oracle_service: 'mock_oracle',
      oracle_response: JSON.stringify({ success: true }),
    })
  }

  async getMintByDepositOrder(depositOrderId: string) {
    return await this.queries.GetMintByDepositOrder(this.db, depositOrderId)
  }
}
```

---

## 🎯 Phase 5: Use Case Layer

### 5.1 Create Deposit Order Use Case

**File:** `packages/core/usecase/b2b/deposit-order.usecase.ts`

```typescript
import { DepositOrderRepository } from '../../repository/postgres/deposit-order.repository'
import { EndUserRepository } from '../../repository/postgres/end-user.repository'
import { CreateDepositOrderRequest } from '../../dto/b2b/deposit-order.dto'

export class DepositOrderUseCase {
  constructor(
    private depositOrderRepo: DepositOrderRepository,
    private endUserRepo: EndUserRepository
  ) {}

  async createDepositOrder(req: CreateDepositOrderRequest) {
    // Validate end-user exists
    const endUser = await this.endUserRepo.getById(req.endUserId)
    if (!endUser) {
      throw new Error('End-user not found')
    }

    // Create deposit order
    const order = await this.depositOrderRepo.createDepositOrder(req)

    // TODO: Emit event for analytics/notifications

    return order
  }

  async listClientDepositOrders(clientId: string, limit?: number, offset?: number) {
    return await this.depositOrderRepo.listClientOrders(clientId, limit, offset)
  }

  async getDepositOrder(orderId: string) {
    const order = await this.depositOrderRepo.getByOrderId(orderId)
    if (!order) {
      throw new Error('Deposit order not found')
    }
    return order
  }
}
```

### 5.2 Mock On-Ramp Processing Use Case

**File:** `packages/core/usecase/b2b/mock-onramp.usecase.ts`

```typescript
import { DepositOrderRepository } from '../../repository/postgres/deposit-order.repository'
import { MockOracleRepository } from '../../repository/postgres/mock-oracle.repository'
import { ProcessMockOnRampRequest } from '../../dto/b2b/mock-oracle.dto'

export class MockOnRampUseCase {
  constructor(
    private depositOrderRepo: DepositOrderRepository,
    private mockOracleRepo: MockOracleRepository
  ) {}

  async processMockOnRamp(req: ProcessMockOnRampRequest) {
    // Get deposit order
    const order = await this.depositOrderRepo.getById(req.depositOrderId)
    if (!order) {
      throw new Error('Deposit order not found')
    }

    // Generate mock transaction hash
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`

    // Simulate USDC mint (1:1 conversion for demo)
    const usdcAmount = order.amount

    // Create mint record
    await this.mockOracleRepo.createMint({
      depositOrderId: order.id,
      clientId: order.clientId,
      amount: usdcAmount,
      walletAddress: req.custodialWalletAddress,
      txHash: mockTxHash,
    })

    // Update deposit order status
    const updatedOrder = await this.depositOrderRepo.updateStatusWithMint(
      order.id,
      'completed',
      mockTxHash,
      usdcAmount
    )

    // TODO: Trigger DeFi staking service

    return {
      order: updatedOrder,
      mint: {
        txHash: mockTxHash,
        amount: usdcAmount,
        walletAddress: req.custodialWalletAddress,
      },
    }
  }
}
```

---

## 🌐 Phase 6: API Routes

### 6.1 POST /api/v1/deposits/create-order

**File:** `apps/b2b-api/src/router/deposit.router.ts`

```typescript
import { Router } from 'express'
import { DepositOrderUseCase } from '@proxify/core/usecase/b2b/deposit-order.usecase'

export function createDepositRouter(depositOrderUseCase: DepositOrderUseCase) {
  const router = Router()

  // Create deposit order (called from end-user demo)
  router.post('/create-order', async (req, res) => {
    try {
      const { clientId, endUserId, amount, currency, metadata } = req.body

      const order = await depositOrderUseCase.createDepositOrder({
        clientId,
        endUserId,
        amount,
        currency,
        metadata,
      })

      res.json({ success: true, data: order })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  })

  return router
}
```

### 6.2 GET /api/v1/clients/:clientId/deposit-orders

**File:** `apps/b2b-api/src/router/client.router.ts` (add new route)

```typescript
// Operation Dashboard - List deposit orders
router.get('/:clientId/deposit-orders', async (req, res) => {
  try {
    const { clientId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const orders = await depositOrderUseCase.listClientDepositOrders(
      clientId,
      Number(limit),
      Number(offset)
    )

    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})
```

### 6.3 POST /api/v1/oracle/mint-mock-usdc

**File:** `apps/b2b-api/src/router/oracle.router.ts` (new file)

```typescript
import { Router } from 'express'
import { MockOnRampUseCase } from '@proxify/core/usecase/b2b/mock-onramp.usecase'

export function createOracleRouter(mockOnRampUseCase: MockOnRampUseCase) {
  const router = Router()

  // Process mock on-ramp (Oracle service endpoint)
  router.post('/mint-mock-usdc', async (req, res) => {
    try {
      const { depositOrderId, custodialWalletAddress } = req.body

      const result = await mockOnRampUseCase.processMockOnRamp({
        depositOrderId,
        custodialWalletAddress,
      })

      res.json({ success: true, data: result })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  })

  return router
}
```

---

## 🎨 Phase 7: Frontend - Demo UI Refactor

### 7.1 Remove Cards, Use Pure Numbers

**File:** `apps/whitelabel-web/src/feature/demo/DemoClientApp.tsx`

**Changes:**
- Remove swipable card UI for Merchant view
- Display balance as large number (like reference image)
- Keep simple action buttons (Deposit, Withdraw)
- For Savings view: Add "Start Earning" button

### 7.2 Mock On-Ramp Widget

**File:** `apps/whitelabel-web/src/feature/demo/MockOnRampWidget.tsx`

```typescript
// Fiat to USDC swap UI
// Shows: Amount input, conversion rate, Confirm button
// Calls: POST /oracle/mint-mock-usdc
```

### 7.3 Operation Dashboard

**File:** `apps/whitelabel-web/src/feature/dashboard/OperationDashboard.tsx`

```typescript
// Lists deposit orders for client
// Shows AI analysis of business persona
// Calculates on-ramp requirements
// Calls: GET /clients/:id/deposit-orders
```

---

## ✅ Implementation Checklist

### Database
- [ ] Create `deposit_orders` migration
- [ ] Create `mock_usdc_mints` migration
- [ ] Run migrations
- [ ] Generate SQLC types

### Backend
- [ ] Write deposit order SQL queries
- [ ] Write mock oracle SQL queries
- [ ] Create DepositOrderRepository
- [ ] Create MockOracleRepository
- [ ] Create DepositOrderUseCase
- [ ] Create MockOnRampUseCase
- [ ] Add deposit API routes
- [ ] Add oracle API routes
- [ ] Test API endpoints

### Frontend
- [ ] Refactor Demo UI (pure numbers)
- [ ] Add "Start Earning" button
- [ ] Create deposit flow (create user → create order)
- [ ] Build Mock On-Ramp Widget
- [ ] Build Operation Dashboard page
- [ ] Connect APIs
- [ ] Add AI analysis component

### Integration
- [ ] Test end-to-end deposit flow
- [ ] Verify oracle minting
- [ ] Connect DeFi staking trigger
- [ ] Add error handling
- [ ] Add loading states

---

## 🚀 Next Steps

1. **Start with Database Schema** - Run migrations first
2. **Generate SQLC** - Get type-safe queries
3. **Build Repository Layer** - Data access
4. **Build Use Case Layer** - Business logic
5. **Create API Routes** - Expose endpoints
6. **Frontend Integration** - Connect UI to backend

**Estimated Timeline:** 2-3 days for full implementation

