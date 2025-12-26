# Demo Flow Architecture - Sequence Diagrams

## Overview

This document visualizes the complete demo flow with sequence diagrams showing how data flows between components.

---

## 1. ID Formats Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ID FORMAT REFERENCE                                │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ privyUserId     │ did:privy:cmjjqld0600kbl70cljv3x12q                       │
│                 │ (from Privy authentication)                               │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ clientUserId    │ did:privy:cmjjqld0600kbl70cljv3x12q:gig-workers:alice     │
│                 │ Format: {privyUserId}:{visualizationType}:{persona}       │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ productId       │ prod_8f2b4271-2d39-47bf-ac04-0180e1797edd                 │
│                 │ (stable identifier for product)                           │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ clientId        │ f9f80d8a-5afb-4d32-a5f0-b2cb2a97ed43                      │
│                 │ (UUID - database primary key, can change on DB reset)     │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ endUserId       │ 550e8400-e29b-41d4-a716-446655440000                      │
│                 │ (UUID - database primary key for end_users table)         │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 2. Complete Demo Flow Sequence

```
┌──────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  User    │     │ DemoSelectorPage │     │  demoStore  │     │   B2B API    │     │  Database  │
│ Browser  │     │   (/demo)        │     │  (Zustand)  │     │ (Express)    │     │ (Postgres) │
└────┬─────┘     └────────┬─────────┘     └──────┬──────┘     └──────┬───────┘     └─────┬──────┘
     │                    │                      │                   │                   │
     │ 1. Visit /demo     │                      │                   │                   │
     │───────────────────>│                      │                   │                   │
     │                    │                      │                   │                   │
     │    Show Step 1:    │                      │                   │                   │
     │    Platform Select │                      │                   │                   │
     │<───────────────────│                      │                   │                   │
     │                    │                      │                   │                   │
     │ 2. Select          │                      │                   │                   │
     │   "gig-workers"    │                      │                   │                   │
     │───────────────────>│                      │                   │                   │
     │                    │ selectVisualization()│                   │                   │
     │                    │─────────────────────>│                   │                   │
     │                    │                      │ Store:            │                   │
     │                    │                      │ visualizationType │                   │
     │                    │                      │ = "gig-workers"   │                   │
     │                    │                      │                   │                   │
     │    Show Step 2:    │                      │                   │                   │
     │    Product Select  │                      │                   │                   │
     │<───────────────────│                      │                   │                   │
     │                    │                      │                   │                   │
     │ 3. Select Product  │                      │                   │                   │
     │   "My Product"     │                      │                   │                   │
     │───────────────────>│                      │                   │                   │
     │                    │ selectProduct()      │                   │                   │
     │                    │─────────────────────>│                   │                   │
     │                    │                      │ Store:            │                   │
     │                    │                      │ selectedProductId │                   │
     │                    │                      │ selectedProduct   │                   │
     │                    │                      │ (syncs to         │                   │
     │                    │                      │  clientContext)   │                   │
     │                    │                      │                   │                   │
     │    Show Step 3:    │                      │                   │                   │
     │    Persona Select  │                      │                   │                   │
     │<───────────────────│                      │                   │                   │
     │                    │                      │                   │                   │
     │ 4. Select "Alice"  │                      │                   │                   │
     │───────────────────>│                      │                   │                   │
     │                    │                      │                   │                   │
     │                    │ generateDemoClientUserId()               │                   │
     │                    │ ─────────────────────────────────────────│                   │
     │                    │ Returns: "did:privy:xxx:gig-workers:alice"                   │
     │                    │                      │                   │                   │
     │                    │                      │   POST /demo/user │                   │
     │                    │                      │──────────────────>│                   │
     │                    │                      │   {               │                   │
     │                    │                      │    privyUserId,   │                   │
     │                    │                      │    productId,     │                   │
     │                    │                      │    clientId,      │                   │
     │                    │                      │    clientUserId,  │   INSERT/SELECT  │
     │                    │                      │    environment    │──────────────────>│
     │                    │                      │   }               │   end_users      │
     │                    │                      │                   │   end_user_vaults│
     │                    │                      │                   │   demo_mappings  │
     │                    │                      │                   │<──────────────────│
     │                    │                      │<──────────────────│                   │
     │                    │                      │   { endUserId,    │                   │
     │                    │                      │     clientUserId, │                   │
     │                    │                      │     isNew }       │                   │
     │                    │                      │                   │                   │
     │                    │ setEndUser()         │                   │                   │
     │                    │─────────────────────>│                   │                   │
     │                    │                      │ Store:            │                   │
     │                    │                      │ endUserId         │                   │
     │                    │                      │ endUserClientUserId                   │
     │                    │                      │                   │                   │
     │                    │ setPersona()         │                   │                   │
     │                    │─────────────────────>│                   │                   │
     │                    │                      │ Store:            │                   │
     │                    │                      │ selectedPersona   │                   │
     │                    │                      │ personaData       │                   │
     │                    │                      │                   │                   │
     │                    │ navigate("/demo/gig-workers")            │                   │
     │<═══════════════════│══════════════════════│                   │                   │
     │                    │                      │                   │                   │
```

---

## 3. Demo App Mount & Balance Fetch

```
┌──────────┐     ┌───────────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  User    │     │ GigWorkersDemoApp │     │  demoStore  │     │   B2B API    │     │  Database  │
│ Browser  │     │ (/demo/gig-workers)│    │  (Zustand)  │     │ (Express)    │     │ (Postgres) │
└────┬─────┘     └─────────┬─────────┘     └──────┬──────┘     └──────┬───────┘     └─────┬──────┘
     │                     │                      │                   │                   │
     │ Navigate to         │                      │                   │                   │
     │ /demo/gig-workers   │                      │                   │                   │
     │────────────────────>│                      │                   │                   │
     │                     │                      │                   │                   │
     │                     │ Check hasPersonaForType("gig-workers")   │                   │
     │                     │─────────────────────>│                   │                   │
     │                     │<─────────────────────│ true              │                   │
     │                     │                      │                   │                   │
     │                     │ Check selectedProductId                  │                   │
     │                     │─────────────────────>│                   │                   │
     │                     │<─────────────────────│ "prod_xxx"        │                   │
     │                     │                      │                   │                   │
     │                     │ Skip PersonaSelector │                   │                   │
     │                     │ (already selected)   │                   │                   │
     │                     │                      │                   │                   │
     │                     │ useEffect: restoreFromDatabase()         │                   │
     │                     │─────────────────────>│                   │                   │
     │                     │                      │ GET /demo/mapping │                   │
     │                     │                      │──────────────────>│                   │
     │                     │                      │ ?privyUserId=...  │   SELECT         │
     │                     │                      │ &productId=...    │──────────────────>│
     │                     │                      │ &clientUserId=... │   demo_mappings  │
     │                     │                      │ &environment=...  │<──────────────────│
     │                     │                      │<──────────────────│                   │
     │                     │                      │ { found: true,    │                   │
     │                     │                      │   data: {         │                   │
     │                     │                      │     quirkEndUserId│                   │
     │                     │                      │   }}              │                   │
     │                     │                      │                   │                   │
     │                     │                      │ Store:            │                   │
     │                     │                      │ hasEarnAccount=true                   │
     │                     │                      │                   │                   │
     │                     │ useEffect: fetchBalance()                │                   │
     │                     │──────────────────────────────────────────│                   │
     │                     │                      │                   │                   │
     │                     │      GET /users/{clientUserId}/balance   │                   │
     │                     │      ────────────────────────────────────>                   │
     │                     │      Headers: x-api-key, x-privy-org-id  │                   │
     │                     │      Query: ?environment=sandbox         │                   │
     │                     │                      │                   │                   │
     │                     │                      │                   │ 1. Validate API  │
     │                     │                      │                   │    key → clientId│
     │                     │                      │                   │                   │
     │                     │                      │                   │ 2. Check if UUID │
     │                     │                      │                   │    isUuid=false  │
     │                     │                      │                   │    (it's string) │
     │                     │                      │                   │                   │
     │                     │                      │                   │ 3. Lookup by     │
     │                     │                      │                   │    clientId +    │
     │                     │                      │                   │    clientUserId  │
     │                     │                      │                   │──────────────────>│
     │                     │                      │                   │   SELECT         │
     │                     │                      │                   │   end_users      │
     │                     │                      │                   │   WHERE client_id│
     │                     │                      │                   │   AND user_id    │
     │                     │                      │                   │<──────────────────│
     │                     │                      │                   │                   │
     │                     │                      │                   │ 4. Get vault     │
     │                     │                      │                   │──────────────────>│
     │                     │                      │                   │   SELECT         │
     │                     │                      │                   │   end_user_vaults│
     │                     │                      │                   │<──────────────────│
     │                     │                      │                   │                   │
     │                     │                      │                   │ 5. Calculate:    │
     │                     │                      │                   │ effectiveBalance │
     │                     │                      │                   │ = totalDeposited │
     │                     │                      │                   │   × (currentIndex│
     │                     │                      │                   │      / entryIndex)
     │                     │                      │                   │                   │
     │                     │<─────────────────────────────────────────│                   │
     │                     │      { found: true, data: {              │                   │
     │                     │          balance: "100.00",              │                   │
     │                     │          yield_earned: "5.00",           │                   │
     │                     │          apy: "12.5",                    │                   │
     │                     │          entry_index: "1.0",             │                   │
     │                     │          current_index: "1.05"           │                   │
     │                     │      }}                                  │                   │
     │                     │                      │                   │                   │
     │   Render Demo UI    │                      │                   │                   │
     │   with real balance │                      │                   │                   │
     │<────────────────────│                      │                   │                   │
     │                     │                      │                   │                   │
```

---

## 4. Deposit Flow

```
┌──────────┐     ┌───────────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  User    │     │ GigWorkersDemoApp │     │  demoStore  │     │   B2B API    │     │  Database  │
│ Browser  │     │                   │     │  (Zustand)  │     │ (Express)    │     │ (Postgres) │
└────┬─────┘     └─────────┬─────────┘     └──────┬──────┘     └──────┬───────┘     └─────┬──────┘
     │                     │                      │                   │                   │
     │ Click "Deposit"     │                      │                   │                   │
     │────────────────────>│                      │                   │                   │
     │                     │                      │                   │                   │
     │                     │ Open DepositModal    │                   │                   │
     │<────────────────────│                      │                   │                   │
     │                     │                      │                   │                   │
     │ Enter $50           │                      │                   │                   │
     │ Click "Confirm"     │                      │                   │                   │
     │────────────────────>│                      │                   │                   │
     │                     │                      │                   │                   │
     │                     │ handleDeposit(50)    │                   │                   │
     │                     │─────────────────────>│                   │                   │
     │                     │                      │ setIsDepositing   │                   │
     │                     │                      │ (true)            │                   │
     │                     │                      │                   │                   │
     │                     │      POST /deposits/fiat                 │                   │
     │                     │      ────────────────────────────────────>                   │
     │                     │      {                                   │                   │
     │                     │        userId: "did:privy:xxx:gig-workers:alice",            │
     │                     │        amount: "50",                     │                   │
     │                     │        currency: "USD",                  │                   │
     │                     │        tokenSymbol: "USDC",              │                   │
     │                     │        environment: "sandbox"            │                   │
     │                     │      }                                   │                   │
     │                     │                      │                   │                   │
     │                     │                      │                   │ 1. Lookup user   │
     │                     │                      │                   │    by clientUserId
     │                     │                      │                   │──────────────────>│
     │                     │                      │                   │<──────────────────│
     │                     │                      │                   │                   │
     │                     │                      │                   │ 2. Get/create    │
     │                     │                      │                   │    vault         │
     │                     │                      │                   │──────────────────>│
     │                     │                      │                   │<──────────────────│
     │                     │                      │                   │                   │
     │                     │                      │                   │ 3. Update vault: │
     │                     │                      │                   │    totalDeposited│
     │                     │                      │                   │    += amount     │
     │                     │                      │                   │                   │
     │                     │                      │                   │ 4. Recalculate   │
     │                     │                      │                   │    weighted      │
     │                     │                      │                   │    entry index   │
     │                     │                      │                   │──────────────────>│
     │                     │                      │                   │   UPDATE         │
     │                     │                      │                   │   end_user_vaults│
     │                     │                      │                   │<──────────────────│
     │                     │                      │                   │                   │
     │                     │                      │                   │ 5. Create deposit│
     │                     │                      │                   │    record        │
     │                     │                      │                   │──────────────────>│
     │                     │                      │                   │   INSERT deposits│
     │                     │                      │                   │<──────────────────│
     │                     │                      │                   │                   │
     │                     │<─────────────────────────────────────────│                   │
     │                     │      { orderId: "dep_xxx",               │                   │
     │                     │        status: "completed" }             │                   │
     │                     │                      │                   │                   │
     │                     │ addDeposit()         │                   │                   │
     │                     │─────────────────────>│                   │                   │
     │                     │                      │ Store: deposits[] │                   │
     │                     │                      │                   │                   │
     │                     │ setTimeout → fetchBalance()              │                   │
     │                     │──────────────────────────────────────────>                   │
     │                     │      (refresh balance after 1s)          │                   │
     │                     │                      │                   │                   │
     │   Show success      │                      │                   │                   │
     │   Updated balance   │                      │                   │                   │
     │<────────────────────│                      │                   │                   │
     │                     │                      │                   │                   │
```

---

## 5. Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐         ┌─────────────────────────┐
│   client_organizations  │         │       end_users         │
├─────────────────────────┤         ├─────────────────────────┤
│ id (UUID) PK            │◄────────│ client_id (UUID) FK     │
│ product_id (VARCHAR)    │         │ id (UUID) PK            │
│ company_name            │         │ user_id (VARCHAR)       │──┐
│ api_key_hash            │         │ environment (VARCHAR)   │  │
│ is_active               │         │ status                  │  │
│ created_at              │         │ created_at              │  │
└─────────────────────────┘         └─────────────────────────┘  │
                                              │                   │
                                              │                   │
                                              ▼                   │
                                    ┌─────────────────────────┐   │
                                    │    end_user_vaults      │   │
                                    ├─────────────────────────┤   │
                                    │ id (UUID) PK            │   │
                                    │ end_user_id (UUID) FK   │   │
                                    │ client_id (UUID) FK     │   │
                                    │ total_deposited         │   │
                                    │ total_withdrawn         │   │
                                    │ weighted_entry_index    │   │
                                    │ environment (VARCHAR)   │   │
                                    │ is_active               │   │
                                    │ created_at              │   │
                                    └─────────────────────────┘   │
                                                                  │
                                                                  │
┌─────────────────────────┐                                       │
│   demo_user_mappings    │                                       │
├─────────────────────────┤                                       │
│ id (UUID) PK            │                                       │
│ privy_user_id (VARCHAR) │ ──── Privy DID                        │
│ product_id (VARCHAR)    │ ──── "prod_xxx"                       │
│ client_user_id (VARCHAR)│ ────────────────────────────────────┬─┘
│ quirk_end_user_id (UUID)│ ──── FK to end_users.id             │
│ environment (VARCHAR)   │                                      │
│ created_at              │      Same format:                    │
└─────────────────────────┘      "did:privy:xxx:type:persona"    │
                                                                  │
                                                                  ▼
                                 ┌────────────────────────────────────────┐
                                 │           clientUserId Format          │
                                 │                                        │
                                 │  did:privy:cmjjqld0600kbl70cljv3x12q   │
                                 │           :gig-workers:alice           │
                                 │                                        │
                                 │  ┌──────────┐ ┌──────────┐ ┌───────┐   │
                                 │  │privyUserId│:│ vizType  │:│persona│   │
                                 │  └──────────┘ └──────────┘ └───────┘   │
                                 └────────────────────────────────────────┘
```

---

## 6. State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ZUSTAND STORES ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────┐
│           demoProductStore             │
│        (Product/API Key State)         │
├────────────────────────────────────────┤
│ • availableProducts[]                  │
│ • selectedProductId                    │
│ • selectedProduct                      │
│ • apiKeys: { productId: apiKey }       │
│ • visualizationType                    │
├────────────────────────────────────────┤
│ Actions:                               │
│ • loadProducts()                       │
│ • selectProduct() ────────────────────────► Syncs to clientContextStore
│ • selectVisualization()                │
│ • setApiKey()                          │
└────────────────────────────────────────┘
                    │
                    │ selectProduct() syncs
                    ▼
┌────────────────────────────────────────┐
│          clientContextStore            │
│         (API Call Context)             │
├────────────────────────────────────────┤
│ • productId                            │
│ • clientId (UUID)                      │
│ • apiKey                               │
│ • companyName                          │
│ • businessType                         │
├────────────────────────────────────────┤
│ Used by:                               │
│ • All API helper functions             │
│ • Request headers (x-api-key)          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│             demoStore                  │
│         (Demo Session State)           │
├────────────────────────────────────────┤
│ • selectedPersona (bob/alice)          │
│ • selectedVisualizationType            │
│ • personaData                          │
│ • selectedEnvironment (sandbox/prod)   │
│ • endUserId (UUID)                     │
│ • endUserClientUserId (string)         │
│ • hasEarnAccount                       │
│ • deposits[]                           │
├────────────────────────────────────────┤
│ Actions:                               │
│ • setPersona()                         │
│ • setEndUser()                         │
│ • setHasEarnAccount()                  │
│ • restoreFromDatabase()                │
│ • getOrCreateDemoUserWithSync()        │
└────────────────────────────────────────┘
```

---

## 7. Key Files Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KEY FILES MAP                                   │
└─────────────────────────────────────────────────────────────────────────────┘

FRONTEND (apps/whitelabel-web/src/)
├── feature/demo/
│   ├── selector/DemoSelectorPage.tsx    ◄─── 3-step wizard entry point
│   ├── personas.ts                      ◄─── generateDemoClientUserId()
│   ├── shared/
│   │   ├── PersonaSelector.tsx          ◄─── Persona selection component
│   │   ├── DepositModal.tsx             ◄─── Deposit UI
│   │   └── DemoSettings.tsx             ◄─── Settings panel
│   ├── ecommerce/EcommerceDemoApp.tsx   ◄─── Ecommerce demo
│   ├── creators/CreatorsDemoApp.tsx     ◄─── Creators demo
│   └── gig-workers/GigWorkersDemoApp.tsx◄─── Gig workers demo
│
├── store/
│   ├── demoStore.ts                     ◄─── Demo session state
│   ├── demoProductStore.ts              ◄─── Product/API key state
│   └── clientContextStore.ts            ◄─── API call context
│
└── api/b2bClientHelpers.ts              ◄─── All API client functions

BACKEND (apps/b2b-api/src/)
├── router/
│   ├── demo.router.ts                   ◄─── POST /demo/user, GET /demo/mapping
│   ├── user.router.ts                   ◄─── GET /users/:userId/balance
│   ├── deposit.router.ts                ◄─── POST /deposits/fiat
│   └── withdrawal.router.ts             ◄─── POST /withdrawals
│
└── middleware/apiKeyAuth.ts             ◄─── API key validation

CORE (packages/core/)
├── usecase/b2b/
│   ├── demo.usecase.ts                  ◄─── Demo business logic
│   ├── user.usecase.ts                  ◄─── User CRUD
│   ├── user-vault.usecase.ts            ◄─── Balance calculation
│   └── deposit.usecase.ts               ◄─── Deposit processing
│
└── repository/postgres/
    ├── end_user.repository.ts           ◄─── User data access
    ├── vault.repository.ts              ◄─── Vault data access
    └── demo_user_mapping.repository.ts  ◄─── Demo mapping data access
```

---

## 8. Balance Calculation Formula

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INDEX-BASED BALANCE CALCULATION                        │
└─────────────────────────────────────────────────────────────────────────────┘

When user deposits:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  new_weighted_entry_index =                                      │
│                                                                  │
│      (old_total × old_entry_index) + (deposit × current_index)   │
│      ──────────────────────────────────────────────────────────  │
│                    old_total + deposit                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

When calculating balance:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  effective_balance = total_deposited × (current_index / entry_index)
│                                                                  │
│  yield_earned = effective_balance - total_deposited              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Example:
┌─────────────────────────────────────────────────────────────────┐
│ User deposits $100 when current_index = 1.0                     │
│ • entry_index = 1.0                                             │
│ • total_deposited = $100                                        │
│                                                                 │
│ Later, current_index grows to 1.05 (5% yield accrued)           │
│ • effective_balance = 100 × (1.05 / 1.0) = $105                 │
│ • yield_earned = 105 - 100 = $5                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Error Handling: UUID vs String

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UUID vs STRING userId HANDLING                            │
└─────────────────────────────────────────────────────────────────────────────┘

Problem: API receives clientUserId which can be:
• UUID: "550e8400-e29b-41d4-a716-446655440000" (from some flows)
• String: "did:privy:xxx:gig-workers:alice" (from demo flow)

Solution in user-vault.usecase.ts:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  // Check if userId looks like a UUID                           │
│  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}          │
│                  -[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)      │
│                                                                 │
│  if (isUuid) {                                                  │
│    // Try UUID lookup first                                     │
│    endUser = await this.userRepository.getById(userId)          │
│  }                                                              │
│                                                                 │
│  if (!endUser) {                                                │
│    // Fallback to string lookup                                 │
│    endUser = await this.userRepository                          │
│      .getByClientAndUserId(clientId, userId)                    │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
