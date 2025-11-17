# B2B SDK Architecture - Two-Layer Approach

**Date:** November 16, 2025  
**Status:** ✅ Complete & Clean

---

## 🏗️ Architecture Overview

We have **two complementary packages** for B2B API integration:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT INTEGRATION                        │
│                                                              │
│  Option 1: Direct SDK              Option 2: Managed Client │
│  ┌────────────────────┐           ┌─────────────────────┐  │
│  │  @proxify/core     │           │ @proxify/b2b-client │  │
│  │  (sdk/client.ts)   │           │ (configured wrapper)│  │
│  └────────────────────┘           └─────────────────────┘  │
│           │                                  │              │
│           └──────────────────────────────────┘              │
│                          │                                  │
│                          ▼                                  │
│              ┌─────────────────────┐                        │
│              │  @proxify/core      │                        │
│              │  (types, entities)  │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Layer 1: Core SDK (`packages/core/sdk/`)

**Location:** `packages/core/sdk/`  
**Purpose:** Standalone, portable SDK for direct integration

### Files:
```
packages/core/sdk/
├── types.ts        # All TypeScript types
├── client.ts       # ProxifyClient class
└── index.ts        # Exports
```

### Usage:
```typescript
import { ProxifyClient } from '@proxify/core'

const proxify = new ProxifyClient({
  apiKey: 'pk_live_abc123',
  productId: 'youtube',
  environment: 'production'
})

await proxify.deposits.create({ ... })
```

### Characteristics:
- ✅ **Portable** - Can be used anywhere (browser, Node.js, Deno)
- ✅ **Minimal dependencies** - Only `axios`
- ✅ **Manual configuration** - Client provides all config
- ✅ **Framework-agnostic** - Works in any JS/TS environment

**Best for:**
- Frontend applications (React, Vue, Angular)
- Edge functions (Cloudflare Workers, Vercel Edge)
- Standalone scripts
- Direct integration without environment setup

---

## 📦 Layer 2: B2B Client (`packages/b2b-client/`)

**Location:** `packages/b2b-client/`  
**Purpose:** Environment-driven wrapper for backend services

### Files:
```
packages/b2b-client/
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod validation
│   │   └── client.config.ts    # Singleton axios
│   ├── client/
│   │   ├── deposit.client.ts   # DepositClient
│   │   └── proxify.client.ts   # ProxifyB2BClient
│   └── index.ts                # Re-exports from @proxify/core
├── package.json
├── tsconfig.json
└── .env.example
```

### Usage:
```typescript
import { ProxifyB2BClient } from '@proxify/b2b-client'

// Auto-reads from .env
const client = new ProxifyB2BClient()

await client.deposits.create({ ... })
```

### Characteristics:
- ✅ **Environment-driven** - Auto-loads from `.env`
- ✅ **Validated config** - Zod schema validation
- ✅ **Singleton pattern** - Single axios instance
- ✅ **Consistent** - Matches other Proxify packages (`privy-client`, `contract-executor-client`)
- ✅ **Backend-optimized** - Logging, error handling, etc.

**Best for:**
- Backend services (Express, Fastify, NestJS)
- Serverless functions (AWS Lambda, Google Cloud Functions)
- Microservices
- Long-running processes

---

## 🔄 Relationship Between Layers

### Layer 2 Uses Layer 1:

```typescript
// @proxify/b2b-client/src/index.ts
export { ProxifyClient, ProxifyError } from '@proxify/core'
export type { DepositRequest, DepositResponse, ... } from '@proxify/core'
```

**Key Points:**
1. **Types** - Single source of truth in `@proxify/core/sdk/types.ts`
2. **SDK Client** - Available in both packages
3. **Wrapper Client** - Only in `@proxify/b2b-client`

---

## 📊 Comparison

| Feature | `@proxify/core` SDK | `@proxify/b2b-client` |
|---------|--------------------|-----------------------|
| **Configuration** | Manual (constructor params) | Auto (env vars) |
| **Validation** | None | Zod schema |
| **Instance** | Create multiple | Singleton |
| **Dependencies** | Minimal (`axios`) | More (`dotenv`, `zod`) |
| **Environment** | Any (browser, Node, edge) | Node.js backend |
| **Use Case** | Frontend, edge functions | Backend services |
| **Setup Complexity** | Simple (just import) | Requires `.env` file |
| **Type Safety** | Full TypeScript | Full TypeScript |
| **Pattern** | Direct SDK | Wrapper + Adapter |

---

## 🎯 Usage Examples

### Example 1: Frontend App (Use Core SDK)

```typescript
// React app
import { ProxifyClient } from '@proxify/core'

const proxify = new ProxifyClient({
  apiKey: import.meta.env.VITE_PROXIFY_API_KEY,
  productId: 'my-ecommerce',
  environment: 'production'
})

function DepositButton() {
  const handleDeposit = async () => {
    const deposit = await proxify.deposits.create({
      type: 'external',
      userId: user.id,
      amount: 100,
      currency: 'USD',
      method: 'apple_pay'
    })
    
    window.open(deposit.data.paymentUrl, '_blank')
  }
  
  return <button onClick={handleDeposit}>Deposit</button>
}
```

**Why Core SDK?**
- ✅ No `.env` files in frontend
- ✅ Lightweight bundle
- ✅ Works with Vite/Webpack env vars

---

### Example 2: Backend Service (Use B2B Client)

```typescript
// Express server
import { ProxifyB2BClient } from '@proxify/b2b-client'
import express from 'express'

const app = express()
const proxify = new ProxifyB2BClient()

app.post('/api/deposits', async (req, res) => {
  try {
    const deposit = await proxify.deposits.create({
      type: 'internal',
      userId: req.body.userId,
      amount: req.body.amount,
      currency: 'USD',
      clientBalanceId: `user_${req.body.userId}_balance`
    })
    
    res.json(deposit)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**Why B2B Client?**
- ✅ Environment validation
- ✅ Singleton (efficient)
- ✅ Backend logging
- ✅ Consistent with other Proxify packages

---

## 🧹 Cleanup Summary

### ✅ What Was Removed:

**From `apps/whitelabel-web/`:**
- ❌ `src/types/deposit.ts` (duplicate - use `@proxify/core`)
- ❌ `src/lib/deposit-api.ts` (duplicate - use `@proxify/b2b-client`)
- ❌ `src/hooks/useProxifyDeposit.ts` (duplicate - use `@proxify/b2b-client`)

**Reason:** These were created before the proper packages existed. Now we have:
- Types in `@proxify/core/sdk/types.ts`
- API client in `@proxify/b2b-client`

### ✅ What Remains Clean:

**`packages/core/sdk/`** (3 files):
- `types.ts` - All type definitions
- `client.ts` - ProxifyClient + ProxifyError
- `index.ts` - Exports

**`packages/b2b-client/`** (13 files):
- `src/config/` - Environment + axios config
- `src/client/` - Deposit + main client
- `src/index.ts` - Re-exports + wrappers
- Documentation (README, IMPLEMENTATION, SUMMARY)

---

## 📋 Decision Guide

### Use `@proxify/core` SDK when:
- ✅ Building frontend applications
- ✅ Need minimal bundle size
- ✅ Running in browser/edge environments
- ✅ Want framework-agnostic code
- ✅ Manual configuration is acceptable

### Use `@proxify/b2b-client` when:
- ✅ Building backend services
- ✅ Using environment variables (`.env`)
- ✅ Want validation + error handling
- ✅ Need singleton pattern
- ✅ Following Proxify backend patterns

---

## 🎉 Final Architecture

```
proxify/
├── packages/
│   ├── core/
│   │   ├── sdk/                    ✅ Standalone SDK (3 files)
│   │   │   ├── types.ts
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   └── ...                     (other core code)
│   │
│   └── b2b-client/                 ✅ Backend wrapper (13 files)
│       ├── src/
│       │   ├── config/             (env + axios)
│       │   ├── client/             (deposit + main)
│       │   └── index.ts            (re-exports)
│       └── ...                     (docs + config)
│
└── apps/
    └── whitelabel-web/             ✅ Clean (no duplicates)
        └── src/
            ├── lib/                (no deposit-api.ts)
            ├── types/              (no deposit.ts)
            └── hooks/              (no useProxifyDeposit.ts)
```

**Status:** ✅ **Clean & Production-Ready!**

- Two-layer architecture ✅
- No duplicates ✅
- Clear separation of concerns ✅
- Follows Proxify patterns ✅
- Ready for backend integration ✅
