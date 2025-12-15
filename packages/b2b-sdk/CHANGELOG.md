# Changelog

All notable changes to the Quirk B2B SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-10

### 🎉 Major Release - Simplified SDK API

This is a **breaking change** release that introduces a cleaner, more intuitive API for the Quirk SDK.

### ✨ Added

- **`useQuirk()` hook** - Unified user management
  - `createUser(params)` - Create or get existing user
  - `getUser(userId)` - Retrieve user by ID
  - `getUserPortfolio(userId)` - Get user portfolio with balance and vault details
  - Includes `loading` and `error` states

- **`useQuirkTransaction()` hook** - Comprehensive transaction management
  - `deposit.createFiat(params)` - Create fiat deposits
  - `deposit.createCrypto(params)` - Initiate crypto deposits
  - `withdraw.create(params)` - Request withdrawals
  - `stats.getDeposits()` - Get deposit statistics
  - `stats.getWithdrawals()` - Get withdrawal statistics
  - Includes `loading` and `error` states

### ❌ Removed (Breaking Changes)

- **`useEndUser()` hook** - Replaced by `useQuirk()`
- **`useDeposit()` hook** - Replaced by `useQuirkTransaction()`
- **`useWithdraw()` hook** - Replaced by `useQuirkTransaction()`

### 📚 Documentation

- Complete rewrite of Integration Documentation with shadcn/ui tabs
- Added comprehensive code examples for all hooks
- Added Quick Start guide
- Added API reference for all methods

---

## Migration Guide v1.x → v2.0

### Before (v1.x)

```typescript
import { useEndUser, useDeposit, useWithdraw } from '@quirk/b2b-sdk'

function MyComponent() {
  // User management
  const { create: createUser } = useEndUser()

  // Deposits
  const { createFiat } = useDeposit()

  // Withdrawals
  const { create: createWithdrawal } = useWithdraw()

  // Usage
  await createUser({ clientUserId: 'user_123', email: 'user@example.com' })
  await createFiat({ userId: 'user_123', amount: '1000.00', currency: 'USD' })
  await createWithdrawal({ userId: 'user_123', amount: '500.00' })
}
```

### After (v2.0)

```typescript
import { useQuirk, useQuirkTransaction } from '@quirk/b2b-sdk'

function MyComponent() {
  // User management
  const { createUser, getUser, getUserPortfolio } = useQuirk()

  // Transactions
  const { deposit, withdraw, stats } = useQuirkTransaction()

  // Usage
  await createUser({ clientUserId: 'user_123', email: 'user@example.com' })
  await deposit.createFiat({ userId: 'user_123', amount: '1000.00', currency: 'USD' })
  await withdraw.create({ userId: 'user_123', amount: '500.00' })

  // NEW: User portfolio
  const portfolio = await getUserPortfolio('user_123')

  // NEW: Transaction statistics
  const depositStats = await stats.getDeposits()
  const withdrawalStats = await stats.getWithdrawals()
}
```

### Breaking Changes Summary

| Old Hook | New Hook | Method Changes |
|----------|----------|----------------|
| `useEndUser()` | `useQuirk()` | `create` → `createUser`, `get` → `getUser` |
| N/A | `useQuirk()` | NEW: `getUserPortfolio(userId)` - Get user portfolio and balance |
| `useDeposit()` | `useQuirkTransaction()` | `createFiat` → `deposit.createFiat`, `createCrypto` → `deposit.createCrypto` |
| `useWithdraw()` | `useQuirkTransaction()` | `create` → `withdraw.create` |
| N/A | `useQuirkTransaction()` | NEW: `stats.getDeposits()`, `stats.getWithdrawals()` |

### Step-by-Step Migration

#### 1. Update package version

```bash
npm install @quirk/b2b-sdk@2.0.0
# or
pnpm update @quirk/b2b-sdk@2.0.0
```

#### 2. Update imports

```typescript
// Old
import { useEndUser, useDeposit, useWithdraw } from '@quirk/b2b-sdk'

// New
import { useQuirk, useQuirkTransaction } from '@quirk/b2b-sdk'
```

#### 3. Update hook usage

**User Management:**
```typescript
// Old
const { create, get } = useEndUser()

// New
const { createUser, getUser, getUserPortfolio } = useQuirk()
// getUserPortfolio is a new method to get user balance and vault details
```

**Deposits:**
```typescript
// Old
const { createFiat, createCrypto } = useDeposit()

// New
const { deposit } = useQuirkTransaction()
// Then: deposit.createFiat(...), deposit.createCrypto(...)
```

**Withdrawals:**
```typescript
// Old
const { create } = useWithdraw()

// New
const { withdraw } = useQuirkTransaction()
// Then: withdraw.create(...)
```

#### 4. Update method calls

```typescript
// Old
await createFiat({ userId: 'user_123', amount: '1000.00' })

// New
await deposit.createFiat({ userId: 'user_123', amount: '1000.00' })
```

### Why This Change?

**Benefits of v2.0:**

1. **Clearer API** - Method names are more intuitive (`createUser` vs `create`)
2. **Better Organization** - Related operations grouped together
3. **New Features** - Transaction statistics built-in
4. **Consistent Naming** - All hooks follow `useQuirk*` pattern
5. **Better TypeScript Support** - Improved type inference for nested methods

### Need Help?

If you encounter issues during migration:

- 📚 Check the [Integration Documentation](http://localhost:5173/dashboard/integration)
- 💬 Contact support at support@quirk.com
- 🐛 Report issues at https://github.com/quirk/sdk/issues

---

## [1.0.0] - 2024-XX-XX

### Initial Release

- `QuirkProvider` component
- `useEndUser()` hook
- `useDeposit()` hook
- `useWithdraw()` hook
- Basic API client with authentication
- TypeScript support
- React 18+ compatibility
