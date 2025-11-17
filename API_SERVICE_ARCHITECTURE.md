# API Service Architecture Plan

## Overview
Following **Cleverse Pattern** from reference apps (`old-ref-privy-api-test` & `old-ref-contract-executor`)

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE LAYERS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  React (whitelabel-web)                                         │
│    ↓ (TanStack Query hooks)                                    │
│  API Client (axios)                                             │
│    ↓ (HTTP requests)                                            │
│  ═══════════════════════════════════════════════════════════   │
│  API Server (Express)                                           │
│    ├─ Routers              (URL → Controller)                   │
│    ├─ Controllers           (HTTP → Service)                    │
│    ├─ Services              (Thin wrappers)                     │
│    ├─ Usecases             (Business logic)                     │
│    ├─ Repositories  ✅     (SQLC wrappers)                      │
│    ├─ SQLC          ✅     (Type-safe queries)                  │
│    └─ Database      ✅     (PostgreSQL)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Required Services (Based on whitelabel-web hooks)

### 1. Client Service
**Purpose**: B2B client management
- `GET /api/v1/client/profile` - Get authenticated client profile
- `PUT /api/v1/client/update` - Update client settings

**Repository**: ✅ ClientRepository (22 methods)
**Usecase**: ClientUsecase
**Service**: ClientService

### 2. Dashboard Service
**Purpose**: Aggregate metrics for dashboard
- `GET /api/v1/dashboard/metrics` - Overall dashboard stats

**Dependencies**: Multiple repositories
**Usecase**: DashboardUsecase
**Service**: DashboardService

### 3. End User Service
**Purpose**: End user management
- `GET /api/v1/end-users` - List end users
- `GET /api/v1/end-users/:userId` - Get user details
- `GET /api/v1/end-users/:userId/value` - Get user value

**Repository**: ✅ EndUserRepository (11 methods)
**Usecase**: EndUserUsecase
**Service**: EndUserService

### 4. Vault Index Service
**Purpose**: Index-based yield tracking
- `GET /api/v1/vault/index` - Current vault index
- `GET /api/v1/vault/index/history` - Historical data
- `GET /api/v1/vault/index/metrics` - Growth metrics

**Repository**: ✅ VaultRepository (18 methods)
**Usecase**: VaultUsecase
**Service**: VaultService

### 5. DeFi Protocol Service
**Purpose**: Protocol allocation management
- `GET /api/v1/defi/protocols` - List all protocols
- `GET /api/v1/defi/protocols/status` - Protocol status
- `GET /api/v1/defi/allocations` - Current allocations
- `POST /api/v1/defi/allocations/update` - Update allocation

**Repository**: ✅ DefiRepository (33 methods)
**Usecase**: DefiUsecase
**Service**: DefiService

### 6. Transaction Service
**Purpose**: Deposit/withdrawal tracking
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/:id` - Get transaction
- `GET /api/v1/transactions/summary` - Transaction summary

**Repository**: ✅ DepositRepository (14 methods), ✅ WithdrawalRepository (17 methods)
**Usecase**: TransactionUsecase
**Service**: TransactionService

### 7. Deposit Service (B2B On-Ramp)
**Purpose**: B2B client deposits
- `POST /api/v1/deposits` - Create deposit
- `GET /api/v1/deposits/:orderId` - Get deposit status
- `GET /api/v1/deposits` - List deposits
- `GET /api/v1/deposits/client-balance` - Get client balance

**Repository**: ✅ DepositRepository (14 methods), ✅ ClientRepository
**Usecase**: DepositUsecase
**Service**: DepositService

### 8. Audit Service
**Purpose**: Audit logging
- `GET /api/v1/audit/logs` - List audit logs
- `POST /api/v1/audit/logs` - Create audit log

**Repository**: ✅ AuditRepository (11 methods)
**Usecase**: AuditUsecase
**Service**: AuditService

## Directory Structure

```
packages/core/
├── repository/         ✅ COMPLETE
│   └── postgres/       ✅ 7 repositories (100% SQLC)
│
├── usecase/            ⏳ TO CREATE
│   ├── client.usecase.ts
│   ├── dashboard.usecase.ts
│   ├── end-user.usecase.ts
│   ├── vault.usecase.ts
│   ├── defi.usecase.ts
│   ├── transaction.usecase.ts
│   ├── deposit.usecase.ts
│   ├── audit.usecase.ts
│   └── index.ts
│
├── service/            ⏳ TO CREATE
│   ├── client.service.ts
│   ├── dashboard.service.ts
│   ├── end-user.service.ts
│   ├── vault.service.ts
│   ├── defi.service.ts
│   ├── transaction.service.ts
│   ├── deposit.service.ts
│   ├── audit.service.ts
│   └── index.ts
│
├── di/                 ⏳ TO CREATE
│   ├── container.ts    (DI container)
│   ├── factory.ts      (Factory functions)
│   └── index.ts
│
└── entity/             ✅ COMPLETE (with Zod validation)

apps/whitelabel-web/
├── server/             ⏳ TO CREATE
│   ├── app.ts         (Express app setup)
│   ├── controllers/   (HTTP layer)
│   │   ├── client.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── end-user.controller.ts
│   │   ├── vault.controller.ts
│   │   ├── defi.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── deposit.controller.ts
│   │   └── audit.controller.ts
│   │
│   ├── routers/       (Express routers)
│   │   ├── client.router.ts
│   │   ├── dashboard.router.ts
│   │   ├── end-user.router.ts
│   │   ├── vault.router.ts
│   │   ├── defi.router.ts
│   │   ├── transaction.router.ts
│   │   ├── deposit.router.ts
│   │   └── audit.router.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      (Privy JWT validation)
│   │   ├── request-logger.middleware.ts
│   │   └── error-handler.middleware.ts
│   │
│   └── config/
│       ├── env.ts
│       └── logger.ts
│
└── src/               ✅ COMPLETE (React app with hooks)
```

## Implementation Order

### Phase 1: Core Usecases (packages/core/usecase/)
1. ✅ ClientUsecase - Client operations
2. ✅ VaultUsecase - Vault index operations
3. ✅ DefiUsecase - Protocol management
4. ✅ EndUserUsecase - User management
5. ✅ TransactionUsecase - Deposit/withdrawal queries
6. ✅ DepositUsecase - B2B deposit flow
7. ✅ DashboardUsecase - Aggregated metrics
8. ✅ AuditUsecase - Audit logging

### Phase 2: Service Layer (packages/core/service/)
Thin wrappers around usecases for API layer

### Phase 3: DI Container (packages/core/di/)
Dependency injection setup

### Phase 4: API Server (apps/whitelabel-web/server/)
1. Controllers (HTTP handlers)
2. Routers (Express routes)
3. Middleware (auth, logging, errors)
4. App setup

## Pattern Example (from reference apps)

### Reference Pattern (old-ref-privy-api-test):

```typescript
// 1. Usecase (business logic in @proxify/core)
class EmbeddedWalletUsecase {
  constructor(private privyRepo: PrivyRepository) {}
  
  async createEmbeddedWallet(params) {
    // Business logic here
    return await this.privyRepo.createUser(params)
  }
}

// 2. Service (thin wrapper in API app)
class EmbeddedWalletService {
  constructor(private usecase: EmbeddedWalletUsecase) {}
  
  async createEmbeddedWallet(params) {
    return this.usecase.createEmbeddedWallet(params)
  }
}

// 3. Controller (HTTP layer)
class EmbeddedWalletController {
  constructor(private container: DIContainer) {}
  
  async createWallet(req, res) {
    const result = await this.container.embeddedWalletService
      .createEmbeddedWallet(req.body)
    res.json({ success: true, data: result })
  }
}

// 4. Router (Express routes)
function createEmbeddedWalletRouter(container) {
  const router = Router()
  const controller = new EmbeddedWalletController(container)
  router.post('/create', (req, res) => controller.createWallet(req, res))
  return router
}

// 5. DI Container
class ServiceContainer {
  embeddedWalletService: EmbeddedWalletService
  
  constructor(
    embeddedWalletUsecase: EmbeddedWalletUsecase,
    privyRepository: PrivyRepository
  ) {
    this.embeddedWalletService = new EmbeddedWalletService(
      embeddedWalletUsecase
    )
  }
}
```

## Key Principles

1. **Separation of Concerns**
   - Repositories: Data access (✅ DONE - 100% SQLC)
   - Usecases: Business logic
   - Services: Thin API wrappers
   - Controllers: HTTP handling
   - Routers: URL routing

2. **Dependency Injection**
   - All dependencies injected via constructor
   - Container manages object lifecycle
   - Easy to test and mock

3. **Type Safety**
   - SQLC generates type-safe queries ✅
   - Zod validates entities ✅
   - TypeScript throughout

4. **Clean Architecture**
   - Inner layers don't depend on outer layers
   - Business logic in usecases, not controllers
   - HTTP details in controllers, not services

## Next Steps

1. Create Usecase layer with business logic
2. Create Service layer as thin wrappers
3. Create DI container
4. Create Controllers and Routers
5. Setup Express app in whitelabel-web/server/
6. Connect to React frontend (already has hooks)

