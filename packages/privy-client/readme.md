# @proxify/privy-client

Thin wrapper package for Privy wallet operations following Clean Architecture.

## 📦 What This Package Provides

This package is a **convenience wrapper** around `@proxify/core`. It provides:

1. **Privy Client Configuration** - Singleton PrivyClient management
2. **Environment Configuration** - Validated environment variables with Zod
3. **Chain Configuration** - Multi-chain support (Ethereum, Solana, Polygon, etc.)
4. **Factory Functions** - Easy initialization of repositories and usecases

> **Note:** All business logic (entities, repositories, usecases) lives in `@proxify/core`.
> This package only handles configuration and convenient initialization.

---

## 🚀 Quick Start

```typescript
import { initializePrivyServices } from '@proxify/privy-client'
import { UserEmbeddedWalletRepository } from './repository'

// 1. Initialize database repository (you must implement this)
const userWalletRepo = new UserEmbeddedWalletRepository(db)

// 2. Initialize all Privy services
const services = initializePrivyServices(userWalletRepo)

// 3. Create embedded wallet for user
const result = await services.embeddedWalletUsecase.createEmbeddedWallet({
  productId: 'my-gaming-app',
  userId: 'player123',
  chainType: 'ethereum',
})

console.log('Wallet Address:', result.wallet.address)
```

---

## 📖 Documentation

- **Complete Usage Guide:** See full README above
- **Architecture:** `@proxify/core/EMBEDDED_WALLET_ARCHITECTURE.md`
- **Identity Solution:** `@proxify/core/IDENTITY_SOLUTION.md`

---

**Status:** Production Ready ✅
