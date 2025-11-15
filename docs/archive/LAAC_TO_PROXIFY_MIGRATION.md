# LAAC to Proxify Complete Migration Guide

**Date:** 2025-10-30
**Status:** 🚧 In Progress - Core types updated, remaining: file renames, ABIs, client implementations

---

## Migration Overview

This document tracks the complete migration from "LAAC" naming to "Proxify" naming throughout the codebase.

### ✅ Completed

1. **Entity Types** - Removed all legacy aliases
   - ✅ `ProxifyRepository` (no more LAACRepository alias)
   - ✅ `ProxifyClientRegistryRepository` (no more LAACClientRegistryRepository alias)
   - ✅ `ProxifyService` (no more LAACService alias)
   - ✅ `ProxifyVaultClientAdapter` (no more LAACVaultClientAdapter alias)
   - ✅ `ProxifyClientRegistryClientAdapter` (no more LAAC alias)
   - ✅ `ProxifyControllerClientAdapter` (renamed from LAACControllerClientAdapter)
   - ✅ `ProxifyControllerRepository` (renamed from LAACControllerRepository)

2. **Adapter Interfaces**
   - ✅ `/packages/core/entity/adapter/laac.entity.ts` - Now exports `ProxifyVaultClientAdapter`
   - ✅ `/packages/core/entity/adapter/client-registry.entity.ts` - Now exports `ProxifyClientRegistryClientAdapter`
   - ✅ `/packages/core/entity/adapter/controller.entity.ts` - Now exports `ProxifyControllerClientAdapter`
     - ✅ Method renamed: `laac()` → `proxify()`

3. **Repository Files (content updated, files not yet renamed)**
   - ✅ Content: `laac.repository.ts` → Class name: `ProxifyRepository`
   - ✅ Content: `laac-client-registry.repository.ts` → Class name: `ProxifyClientRegistryRepository`
   - ✅ Content: `laac-controller.repository.ts` → Class name: `ProxifyControllerRepository`

4. **Service Files (content updated, files not yet renamed)**
   - ✅ Content: `laac.service.ts` → Class name: `ProxifyService`

---

## 🚧 Remaining Work

### Phase 1: File Renames

#### 1.1 Repository Files
```bash
# Navigate to repository directory
cd packages/core/repository

# Rename files
mv laac.repository.ts proxify.repository.ts
mv laac-client-registry.repository.ts proxify-client-registry.repository.ts
mv laac-controller.repository.ts proxify-controller.repository.ts
```

#### 1.2 Service Files
```bash
# Navigate to service directory
cd apps/contract-executor/src/services

# Rename files
mv laac.service.ts proxify.service.ts
```

#### 1.3 Controller & Router Files
```bash
# Navigate to contract-executor
cd apps/contract-executor/src

# Rename controller
mv controllers/laac.controller.ts controllers/proxify.controller.ts

# Rename router
mv routers/laac.router.ts routers/proxify.router.ts
```

#### 1.4 Entity Adapter Files
```bash
cd packages/core/entity/adapter

# Rename entity
mv laac.entity.ts proxify.entity.ts
```

#### 1.5 ABI Files
```bash
cd packages/core/abis

# Rename ABIs
mv laac.ts proxify.ts
mv laac_client.ts proxify_client_registry.ts
mv laac_controller.ts proxify_controller.ts
```

---

### Phase 2: Update Exports

#### 2.1 Repository Index (`packages/core/repository/index.ts`)
```typescript
// FROM:
export * from "./laac-client-registry.repository"
export * from "./laac-controller.repository"
export * from "./laac.repository"

// TO:
export * from "./proxify-client-registry.repository"
export * from "./proxify-controller.repository"
export * from "./proxify.repository"
```

#### 2.2 Entity Adapter Index (`packages/core/entity/adapter/index.ts` if exists)
```typescript
// Update:
export * from "./proxify.entity" // was laac.entity
```

#### 2.3 ABI Index (`packages/core/abis/index.ts`)
```typescript
// FROM:
export * from "./laac"
export * from "./laac_client"
export * from "./laac_controller"

// TO:
export * from "./proxify"
export * from "./proxify_client_registry"
export * from "./proxify_controller"
```

---

### Phase 3: Update ABI Content

#### 3.1 Rename ABI Constants

**File: `packages/core/abis/laac.ts` → `proxify.ts`**
```typescript
// FROM:
export const LAAC_ABI = [...]

// TO:
export const PROXIFY_ABI = [...]
```

**File: `packages/core/abis/laac_client.ts` → `proxify_client_registry.ts`**
```typescript
// FROM:
export const LAAC_CLIENT_REGISTRY_ABI = [...]

// TO:
export const PROXIFY_CLIENT_REGISTRY_ABI = [...]
```

**File: `packages/core/abis/laac_controller.ts` → `proxify_controller.ts`**
```typescript
// FROM:
export const LACC_CONTROLLER_ABI = [...]

// TO:
export const PROXIFY_CONTROLLER_ABI = [...]
```

#### 3.2 Update ABI Function/Constructor Parameters

In the ABIs, update internal references:
- `_laac` parameter → `_proxify`
- Any "laac" strings in events/methods → "proxify"

**Note:** These ABIs should ultimately be regenerated from the actual deployed Proxify contracts.

---

### Phase 4: Update Contract Client Implementations

**Location:** `packages/contract-executor-client/src/client/`

#### 4.1 Rename Client Files
```bash
cd packages/contract-executor-client/src/client

mv laac.client.ts proxify.client.ts
mv laac-registry.client.ts proxify-client-registry.client.ts
mv laac-controller.client.ts proxify-controller.client.ts
```

#### 4.2 Update Class Names

**File: `proxify.client.ts`**
```typescript
// FROM:
export class LAACClient implements LAACVaultClientAdapter

// TO:
export class ProxifyClient implements ProxifyVaultClientAdapter
```

**File: `proxify-client-registry.client.ts`**
```typescript
// FROM:
export class LAACClientRegistryClient implements LAACClientRegistryClientAdapter

// TO:
export class ProxifyClientRegistryClient implements ProxifyClientRegistryClientAdapter
```

**File: `proxify-controller.client.ts`**
```typescript
// FROM:
export class LAACControllerClient implements LAACControllerClientAdapter

// TO:
export class ProxifyControllerClient implements ProxifyControllerClientAdapter
```

#### 4.3 Update ABI Imports

In all client files:
```typescript
// FROM:
import { LAAC_ABI } from '@proxify/core/abis'

// TO:
import { PROXIFY_ABI } from '@proxify/core/abis'
```

#### 4.4 Update Contract Method Calls

In ProxifyControllerClient, update the method that reads the vault address:
```typescript
// FROM:
async laac(): Promise<Address> {
  return this.publicClient.readContract({
    address: this.address,
    abi: PROXIFY_CONTROLLER_ABI,
    functionName: 'laac', // contract method name
  })
}

// TO:
async proxify(): Promise<Address> {
  return this.publicClient.readContract({
    address: this.address,
    abi: PROXIFY_CONTROLLER_ABI,
    functionName: 'proxify', // NEW contract method name
  })
}
```

---

### Phase 5: Update Client Factory & Config

#### 5.1 Update Client Index (`packages/contract-executor-client/src/client/index.ts`)
```typescript
// FROM:
export * from "./laac.client"
export * from "./laac-registry.client"
export * from "./laac-controller.client"

// TO:
export * from "./proxify.client"
export * from "./proxify-client-registry.client"
export * from "./proxify-controller.client"
```

#### 5.2 Update Config Files

**File: `packages/contract-executor-client/src/config/viem-client.ts`**
- Update any references to LAAC_ABI → PROXIFY_ABI
- Update class instantiations

**File: Any config that references contract addresses**
- Update environment variable names from `LAAC_ADDRESS` → `PROXIFY_ADDRESS`
- Update `LAAC_CONTROLLER_ADDRESS` → `PROXIFY_CONTROLLER_ADDRESS`
- Update `LAAC_CLIENT_REGISTRY_ADDRESS` → `PROXIFY_CLIENT_REGISTRY_ADDRESS`

---

### Phase 6: Update Environment Variables

#### 6.1 `.env.example` files
```bash
# FROM:
LAAC_ADDRESS=0x...
LAAC_CONTROLLER_ADDRESS=0x...
LAAC_CLIENT_REGISTRY_ADDRESS=0x...

# TO:
PROXIFY_ADDRESS=0x...
PROXIFY_CONTROLLER_ADDRESS=0x...
PROXIFY_CLIENT_REGISTRY_ADDRESS=0x...
```

---

### Phase 7: Update Constants

**File: `packages/core/constants/access_control.ts`**

If this file contains LAAC references, update them:
```typescript
// Example:
export const LAAC_DEFAULT_ADMIN_ROLE = "..."
// TO:
export const PROXIFY_DEFAULT_ADMIN_ROLE = "..."
```

---

### Phase 8: Update API Routes (if any)

**In `apps/contract-executor/src/routers/proxify.router.ts`:**

Update route paths if they contain "laac":
```typescript
// FROM:
router.get('/api/laac/accounts/:clientId/:userId', ...)

// TO:
router.get('/api/proxify/accounts/:clientId/:userId', ...)
```

---

### Phase 9: Update Documentation

Files that mention LAAC should be updated (these are markdown/doc files, lower priority):

- `REFACTORING_SUMMARY.md` - Update all LAAC references
- `PROXIFY_INTEGRATION_PLAN.md` - Update if contains LAAC
- Contract documentation files

---

## Verification Checklist

After completing all phases, verify:

```bash
# 1. No "laac" in filenames (case-insensitive)
find . -iname "*laac*" -type f

# 2. No "LAAC" exports/types in TypeScript files (excluding docs)
grep -r "LAAC" --include="*.ts" --include="*.tsx" packages/ apps/

# 3. No "laac" in import statements
grep -r 'from.*laac' --include="*.ts" --include="*.tsx" packages/ apps/

# 4. TypeScript compilation succeeds
pnpm type-check

# 5. Tests pass (if any)
pnpm test
```

---

## Migration Script

Here's a bash script to automate the file renaming:

```bash
#!/bin/bash

echo "🚀 Starting LAAC to Proxify migration..."

# Repository files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/packages/core/repository
[ -f laac.repository.ts ] && git mv laac.repository.ts proxify.repository.ts
[ -f laac-client-registry.repository.ts ] && git mv laac-client-registry.repository.ts proxify-client-registry.repository.ts
[ -f laac-controller.repository.ts ] && git mv laac-controller.repository.ts proxify-controller.repository.ts

# Entity adapter files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/packages/core/entity/adapter
[ -f laac.entity.ts ] && git mv laac.entity.ts proxify.entity.ts

# ABI files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/packages/core/abis
[ -f laac.ts ] && git mv laac.ts proxify.ts
[ -f laac_client.ts ] && git mv laac_client.ts proxify_client_registry.ts
[ -f laac_controller.ts ] && git mv laac_controller.ts proxify_controller.ts

# Service files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/apps/contract-executor/src/services
[ -f laac.service.ts ] && git mv laac.service.ts proxify.service.ts

# Controller files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/apps/contract-executor/src/controllers
[ -f laac.controller.ts ] && git mv laac.controller.ts proxify.controller.ts

# Router files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/apps/contract-executor/src/routers
[ -f laac.router.ts ] && git mv laac.router.ts proxify.router.ts

# Client implementation files
cd /Users/wtshai/Work/Protocolcamp/defai-liquidity-aggregator/packages/contract-executor-client/src/client
[ -f laac.client.ts ] && git mv laac.client.ts proxify.client.ts
[ -f laac-registry.client.ts ] && git mv laac-registry.client.ts proxify-client-registry.client.ts
[ -f laac-controller.client.ts ] && git mv laac-controller.client.ts proxify-controller.client.ts

echo "✅ File renaming complete!"
echo "⚠️  Next steps:"
echo "1. Update index.ts export statements"
echo "2. Update ABI constant names"
echo "3. Update client class names and imports"
echo "4. Update environment variable names"
echo "5. Run 'pnpm type-check' to verify"
```

---

## Summary

**Files to Rename:** 14 files
**Types to Update:** ~20 type/class names
**ABIs to Regenerate:** 3 files (from deployed contracts)
**Estimated Time:** 1-2 hours for complete migration

**Critical Path:**
1. ✅ Remove legacy aliases (DONE)
2. 🚧 Rename all files (IN PROGRESS - use script above)
3. Update all exports in index.ts files
4. Update ABI constant names
5. Update client implementations
6. Update environment variables
7. Verify with TypeScript compilation

---

## Notes

- Use `git mv` instead of `mv` to preserve git history
- The actual contract ABIs should be regenerated from deployed Proxify contracts
- Consider updating this migration in a single atomic commit for easier rollback if needed
- Test thoroughly after migration before deploying

