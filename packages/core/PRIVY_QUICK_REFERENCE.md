# Quick Reference: Where to Find Information

This is a quick lookup guide for Privy implementation. For detailed information, see `PRIVY_IMPLEMENTATION_GUIDE.md`.

## 📖 When You Need Information About...

### Wallet Operations
| Topic | Documentation Link |
|-------|-------------------|
| Get connected wallet | https://docs.privy.io/wallets/wallets/get-a-wallet/get-connected-wallet |
| Get wallet by ID | https://docs.privy.io/wallets/wallets/get-a-wallet/get-wallet-by-id |
| Get all wallets | https://docs.privy.io/wallets/wallets/get-a-wallet/get-all-wallets |
| Server-side access | https://docs.privy.io/wallets/wallets/server-side-access |

### Transactions (Ethereum)
| Topic | Documentation Link |
|-------|-------------------|
| Send transaction | https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction |
| Sign transaction | https://docs.privy.io/wallets/using-wallets/ethereum/sign-a-transaction |
| Switch chain | https://docs.privy.io/wallets/using-wallets/ethereum/switch-chain |

### Funding & On/Off Ramp
| Topic | Documentation Link |
|-------|-------------------|
| Card-based funding | https://docs.privy.io/wallets/funding/methods/card |
| Apple & Google Pay | https://docs.privy.io/recipes/card-based-funding |
| Funding example (Next.js) | https://github.com/privy-io/examples/tree/main/examples/privy-next-funding |

## 🗺️ Implementation Roadmap

See `PRIVY_IMPLEMENTATION_GUIDE.md` for:
- ✅ Phase 1: User & Wallet Creation (DONE)
- 🚧 Phase 2: Server-Side Wallet Access (IN PROGRESS)
- 📋 Phase 3: Transaction Operations (TODO)
- 📋 Phase 4: Funding Integration (TODO)

## 💡 Quick Tips

1. **Always check `PRIVY_IMPLEMENTATION_GUIDE.md` first** - it has all implementation patterns
2. **Privy stores keys, we store mappings** - hybrid architecture for fast lookups
3. **userId ≠ privyUserId** - don't confuse them!
4. **Auto-generated userIds** - format: `email:user@x.com` or `wallet:0x123...`

## 📁 File Locations

```
packages/core/
├── PRIVY_IMPLEMENTATION_GUIDE.md    ← Full implementation guide
├── WALLET_CREATION_EXAMPLES.md      ← Wallet creation examples
├── examples/wallet-creation-examples.ts  ← Type-safe code examples
└── usecase/embedded-wallet.usecase.ts    ← Main wallet logic
```

## 🆘 If You Forget

**Read this note**: This document and `PRIVY_IMPLEMENTATION_GUIDE.md` contain all critical Privy knowledge. Always reference these before implementing new features or when troubleshooting.
