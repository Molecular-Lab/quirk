# Refactor Plan: Mainnet-Testnet Visibility & Network Mode Management

**Status:** Planning Phase
**Priority:** Critical
**Created:** 2025-12-08
**Target:** Separate testnet demo flow (oracle mint) from mainnet production flow (real DeFi staking)

---

## 📋 Current State Analysis

### ✅ What's Working

**Network Configuration:**
- ✅ Environment separation for API keys (`prod_pk_` vs `test_pk_`)
- ✅ `isSandbox` flag in `client_organizations` table
- ✅ Multiple chain support (Base, Ethereum, Polygon, Optimism, Arbitrum)
- ✅ RPC endpoints configured in `.env` files

**DeFi Protocol Integration (`packages/yield-engine/`):**
- ✅ AAVE protocol implementation (`src/protocols/aave/`)
- ✅ Compound protocol implementation (`src/protocols/compound/`)
- ✅ Morpho protocol implementation (`src/protocols/morpho/`)
- ✅ Protocol constants with mainnet addresses

**Mock Token Setup:**
- ✅ Mock ERC20 contract (`apps/mock-erc20/`)
- ✅ Mock USDC address in environment variables
- ✅ Base Sepolia RPC URL configured

### ⚠️ What Needs Work

**Network Mode Visibility:**
- ❌ No clear visual indicator of testnet vs mainnet mode
- ❌ No network switcher UI
- ❌ No environment-specific branding (e.g., "TESTNET" badge)
- ❌ Mixed testnet/mainnet logic in same codebase

**Testnet Oracle Mint (Demo):**
- ❌ No oracle-based minting service for testnet
- ❌ No mock yield generation for testnet
- ❌ No testnet-specific deposit flow
- ❌ No fake on-ramp simulation for testnet

**Mainnet Real DeFi:**
- ❌ No production-ready DeFi staking flow
- ❌ No real on-ramp provider integration
- ❌ No gas optimization for mainnet
- ❌ No mainnet security checks

**Configuration Management:**
- ❌ No centralized network mode configuration
- ❌ No environment-specific feature flags
- ❌ No network-aware error messages
- ❌ No network validation on API calls

---

## 🎯 Refactor Goals

### 1. Network Mode Configuration & Visibility

**Goal:** Clear separation of testnet and mainnet environments with visual indicators

**Tasks:**

#### 1.1 Centralized Network Configuration
- [ ] Create network configuration service:
  - Define network modes: `testnet`, `mainnet`, `local`
  - Define supported chains per mode
  - Define feature flags per mode
  - Define provider URLs per mode
- [ ] Add network mode detection:
  - From environment variables
  - From API key prefix (`test_pk_` → testnet, `prod_pk_` → mainnet)
  - From client `isSandbox` flag
- [ ] Create network mode validation:
  - Prevent testnet API keys from accessing mainnet
  - Prevent mainnet API keys from accessing testnet
  - Validate chain IDs per mode

**File Locations:**
- `packages/core/config/network.config.ts` (create)
- `packages/core/service/network-mode.service.ts` (create)
- `packages/core/types/network.types.ts` (create)

**Implementation Example:**
```typescript
// packages/core/config/network.config.ts
export enum NetworkMode {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
  LOCAL = 'local',
}

export const NETWORK_CONFIG = {
  [NetworkMode.TESTNET]: {
    chains: {
      'base-sepolia': {
        chainId: 84532,
        rpcUrl: process.env.BASE_SEPOLIA_RPC_URL,
        blockExplorer: 'https://sepolia.basescan.org',
        nativeToken: 'ETH',
        stablecoins: {
          USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Mock USDC
        },
      },
    },
    features: {
      realDeFi: false,
      oracleMint: true,
      realOnRamp: false,
    },
  },
  [NetworkMode.MAINNET]: {
    chains: {
      'base': {
        chainId: 8453,
        rpcUrl: process.env.BASE_RPC_URL,
        blockExplorer: 'https://basescan.org',
        nativeToken: 'ETH',
        stablecoins: {
          USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        },
        defi: {
          aave: {
            lendingPool: '0x...',
            dataProvider: '0x...',
          },
          compound: {
            comptroller: '0x...',
          },
          morpho: {
            morpho: '0x...',
          },
        },
      },
      'ethereum': {
        chainId: 1,
        // ... similar config
      },
    },
    features: {
      realDeFi: true,
      oracleMint: false,
      realOnRamp: true,
    },
  },
}
```

#### 1.2 Network Mode UI Indicators
- [ ] Add network mode badge to dashboard header:
  - "TESTNET" badge (yellow) for testnet
  - "MAINNET" badge (green) for mainnet
  - "LOCAL" badge (gray) for local development
- [ ] Add network mode indicator to API Testing Page
- [ ] Add network mode to all transaction displays
- [ ] Add warning modals for mainnet operations

**File Locations:**
- `apps/whitelabel-web/src/components/NetworkBadge.tsx` (create)
- `apps/whitelabel-web/src/components/NetworkSwitcher.tsx` (create)
- `apps/whitelabel-web/src/hooks/useNetworkMode.ts` (create)

**Implementation Example:**
```tsx
// apps/whitelabel-web/src/components/NetworkBadge.tsx
export function NetworkBadge() {
  const { networkMode } = useNetworkMode()

  const config = {
    testnet: { color: 'yellow', label: 'TESTNET', icon: '🧪' },
    mainnet: { color: 'green', label: 'MAINNET', icon: '🚀' },
    local: { color: 'gray', label: 'LOCAL', icon: '💻' },
  }[networkMode]

  return (
    <div className={`badge badge-${config.color}`}>
      {config.icon} {config.label}
    </div>
  )
}
```

#### 1.3 Network-Aware Error Messages
- [ ] Add network context to error messages:
  - "This operation is only available on mainnet"
  - "This operation is only available on testnet"
  - "Invalid chain ID for current network mode"
- [ ] Add network validation middleware
- [ ] Add network-specific troubleshooting guides

**File Locations:**
- `packages/core/utils/network-errors.ts` (create)
- `apps/b2b-api/src/middleware/networkValidation.ts` (create)

---

### 2. Testnet Oracle Mint (Demo Mode)

**Goal:** Simulate on-ramp and DeFi yield without real transactions

**Tasks:**

#### 2.1 Oracle Minting Service
- [ ] Create oracle mint service:
  - Mint mock USDC/USDT for testnet deposits
  - Simulate instant minting (no real transaction delay)
  - Track minted amounts in database
  - Add minting audit logs
- [ ] Add oracle mint endpoint:
  - POST `/api/v1/testnet/mint`
  - Requires testnet API key
  - Returns mock transaction hash
- [ ] Add mock transaction hash generation

**File Locations:**
- `packages/core/service/oracle-mint.service.ts` (create)
- `apps/b2b-api/src/router/testnet.router.ts` (create)
- `database/migrations/000007_testnet_minting.up.sql` (create)

**Implementation Example:**
```typescript
// packages/core/service/oracle-mint.service.ts
export class OracleMintService {
  async mintTestnetTokens(params: {
    clientId: string
    userId: string
    amount: string
    tokenSymbol: 'USDC' | 'USDT'
    chain: string
  }): Promise<{
    txHash: string
    amount: string
    tokenAddress: string
  }> {
    // Validate testnet mode
    if (!this.isTestnetMode()) {
      throw new Error('Oracle minting is only available in testnet mode')
    }

    // Generate mock transaction hash
    const txHash = `0x${crypto.randomBytes(32).toString('hex')}`

    // Update user balance in database (no blockchain transaction)
    await this.updateUserBalance({
      userId: params.userId,
      amount: params.amount,
      operation: 'mint',
    })

    // Audit log
    await this.auditRepository.create({
      clientId: params.clientId,
      userId: params.userId,
      action: 'testnet_oracle_mint',
      resourceType: 'balance',
      metadata: {
        amount: params.amount,
        tokenSymbol: params.tokenSymbol,
        mockTxHash: txHash,
      },
    })

    return {
      txHash,
      amount: params.amount,
      tokenAddress: this.getTestnetTokenAddress(params.tokenSymbol, params.chain),
    }
  }
}
```

#### 2.2 Mock Yield Generation
- [ ] Create mock yield service:
  - Simulate DeFi yield accrual
  - Use configurable APY (default 5%)
  - Update vault index periodically
  - Add yield generation cron job
- [ ] Add yield visualization:
  - Show simulated APY
  - Show accrued yield over time
  - Add "Generate Mock Yield" button for testing

**File Locations:**
- `packages/core/service/mock-yield.service.ts` (create)
- `apps/b2b-api/src/cron/testnet-yield.cron.ts` (create)

**Implementation Example:**
```typescript
// packages/core/service/mock-yield.service.ts
export class MockYieldService {
  async generateYieldForTestnetVault(vaultId: string) {
    const vault = await this.vaultRepository.getById(vaultId)

    if (!vault) {
      throw new Error('Vault not found')
    }

    // Calculate yield (simulate 5% APY)
    const APY = 0.05
    const timeElapsed = Date.now() - vault.lastYieldUpdate.getTime()
    const yearInMs = 365 * 24 * 60 * 60 * 1000
    const yieldMultiplier = 1 + (APY * timeElapsed) / yearInMs

    // Update vault index
    const newIndex = vault.currentIndex * yieldMultiplier

    await this.vaultRepository.updateIndex(vaultId, newIndex.toString())

    return {
      oldIndex: vault.currentIndex,
      newIndex: newIndex.toString(),
      yieldGenerated: ((yieldMultiplier - 1) * vault.totalStakedBalance).toString(),
    }
  }
}
```

#### 2.3 Testnet Deposit Flow
- [ ] Create testnet-specific deposit flow:
  - Skip real on-ramp provider
  - Use oracle mint immediately
  - Skip blockchain transaction wait
  - Show instant confirmation
- [ ] Add testnet deposit visualization:
  - Show "SIMULATED DEPOSIT" label
  - Show mock transaction hash
  - Link to testnet block explorer (mock)

**File Locations:**
- `packages/core/usecase/testnet/deposit.usecase.ts` (create)
- `apps/whitelabel-web/src/feature/demo/TestnetDepositModal.tsx` (create)

#### 2.4 Testnet Withdrawal Flow
- [ ] Create testnet-specific withdrawal flow:
  - Skip real DeFi unstaking
  - Use oracle burn immediately
  - Skip real off-ramp
  - Show instant confirmation
- [ ] Add testnet withdrawal visualization:
  - Show "SIMULATED WITHDRAWAL" label
  - Show mock transaction hash

**File Locations:**
- `packages/core/usecase/testnet/withdrawal.usecase.ts` (create)
- `apps/whitelabel-web/src/feature/demo/TestnetWithdrawalModal.tsx` (create)

---

### 3. Mainnet Real DeFi Integration

**Goal:** Production-ready DeFi staking with real on-ramp integration

**Tasks:**

#### 3.1 Mainnet DeFi Service
- [ ] Create production DeFi service:
  - Real AAVE staking
  - Real Compound staking
  - Real Morpho staking
  - Strategy-based allocation
- [ ] Add gas optimization:
  - Batch transactions where possible
  - Use multicall for multiple operations
  - Estimate gas before execution
  - Add gas price monitoring
- [ ] Add DeFi transaction monitoring:
  - Track transaction status
  - Retry failed transactions
  - Alert on stuck transactions

**File Locations:**
- `packages/core/service/defi-mainnet.service.ts` (create)
- `packages/core/service/gas-optimizer.service.ts` (create)
- `packages/core/service/tx-monitor.service.ts` (create)

**Implementation Example:**
```typescript
// packages/core/service/defi-mainnet.service.ts
export class DeFiMainnetService {
  async stakeToProtocol(params: {
    protocol: 'aave' | 'compound' | 'morpho'
    amount: string
    tokenAddress: string
    chain: string
  }): Promise<{
    txHash: string
    blockNumber: number
    gasUsed: string
  }> {
    // Validate mainnet mode
    if (!this.isMainnetMode()) {
      throw new Error('Real DeFi staking is only available in mainnet mode')
    }

    // Get protocol contract addresses
    const protocolConfig = this.getProtocolConfig(params.protocol, params.chain)

    // Estimate gas
    const gasEstimate = await this.gasOptimizer.estimateGas({
      to: protocolConfig.address,
      data: this.encodeStakeCall(params.amount),
    })

    // Execute transaction
    const tx = await this.walletService.sendTransaction({
      to: protocolConfig.address,
      data: this.encodeStakeCall(params.amount),
      gas: gasEstimate * 1.2, // 20% buffer
    })

    // Monitor transaction
    const receipt = await this.txMonitor.waitForConfirmation(tx.hash)

    // Update vault balance
    await this.vaultRepository.addStakedBalance({
      vaultId: params.vaultId,
      amount: params.amount,
      protocol: params.protocol,
      txHash: receipt.transactionHash,
    })

    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    }
  }
}
```

#### 3.2 Mainnet On-Ramp Integration
- [ ] Integrate real on-ramp providers (TransFi/ZeroHash):
  - KYC verification flow
  - Payment method selection
  - Real fiat → crypto conversion
  - Transaction status webhooks
- [ ] Add on-ramp transaction tracking:
  - Track pending on-ramps
  - Alert on failed on-ramps
  - Show estimated completion time
- [ ] Add on-ramp fee calculation:
  - Provider fees
  - Network fees
  - Total cost display

**File Locations:**
- `packages/core/service/onramp-mainnet.service.ts` (create)
- `apps/whitelabel-web/src/feature/dashboard/MainnetOnRampModal.tsx` (create)

#### 3.3 Mainnet Off-Ramp Integration
- [ ] Integrate real off-ramp providers:
  - Bank account verification
  - Crypto → fiat conversion
  - Bank transfer initiation
  - Transaction status tracking
- [ ] Add off-ramp security checks:
  - Daily withdrawal limits
  - Multi-signature approval (if configured)
  - Whitelist bank accounts only
- [ ] Add off-ramp compliance:
  - AML checks
  - Transaction reporting
  - Audit trail

**File Locations:**
- `packages/core/service/offramp-mainnet.service.ts` (create)
- `apps/whitelabel-web/src/feature/dashboard/MainnetOffRampModal.tsx` (create)

#### 3.4 Mainnet Security Enhancements
- [ ] Add mainnet-specific security checks:
  - Transaction amount limits
  - Multi-signature requirements
  - Time-locked withdrawals (optional)
  - Address whitelisting
- [ ] Add mainnet monitoring:
  - Real-time balance monitoring
  - Abnormal activity detection
  - Alerting on large transactions
- [ ] Add mainnet audit requirements:
  - Comprehensive audit logs
  - Immutable transaction records
  - Compliance reporting

**File Locations:**
- `packages/core/service/mainnet-security.service.ts` (create)
- `packages/core/service/mainnet-monitoring.service.ts` (create)

---

### 4. Network Mode Migration & Testing

**Goal:** Smooth transition between testnet and mainnet

**Tasks:**

#### 4.1 Network Mode Switcher (Admin Only)
- [ ] Create admin panel for network mode switching:
  - Switch organization between testnet and mainnet
  - Migrate data if needed
  - Show migration status
  - Add rollback functionality
- [ ] Add network mode validation:
  - Prevent switching with active transactions
  - Require confirmation for mainnet switch
  - Show impact analysis

**File Locations:**
- `apps/whitelabel-web/src/feature/admin/NetworkModeSwitcher.tsx` (create)
- `packages/core/usecase/admin/network-migration.usecase.ts` (create)

#### 4.2 Network Mode Testing
- [ ] Create testnet test suite:
  - Test oracle minting
  - Test mock yield generation
  - Test simulated deposits/withdrawals
- [ ] Create mainnet test suite (on testnet):
  - Test real DeFi integration (on testnet protocols)
  - Test gas optimization
  - Test transaction monitoring
- [ ] Create integration tests:
  - Test network mode switching
  - Test API key validation per mode
  - Test feature flag enforcement

**File Locations:**
- `packages/core/__tests__/testnet.test.ts` (create)
- `packages/core/__tests__/mainnet.test.ts` (create)
- `packages/core/__tests__/network-mode.test.ts` (create)

#### 4.3 Network Mode Documentation
- [ ] Create testnet usage guide:
  - How to use testnet mode
  - How to get testnet tokens
  - Testnet limitations
- [ ] Create mainnet migration guide:
  - Prerequisites for mainnet
  - Migration checklist
  - Post-migration verification
- [ ] Create network comparison table:
  - Testnet vs Mainnet features
  - Cost comparison
  - Performance comparison

**File Locations:**
- `docs/TESTNET_GUIDE.md` (create)
- `docs/MAINNET_MIGRATION.md` (create)
- `docs/NETWORK_COMPARISON.md` (create)

---

## 📊 Implementation Priority

### Phase 1: Network Configuration (Week 1)
**Priority:** Critical
**Impact:** Foundation for all network-specific features

- [ ] 1.1 Centralized Network Configuration
- [ ] 1.2 Network Mode UI Indicators
- [ ] 1.3 Network-Aware Error Messages

### Phase 2: Testnet Oracle Mint (Week 2)
**Priority:** High
**Impact:** Demo functionality without real transactions

- [ ] 2.1 Oracle Minting Service
- [ ] 2.2 Mock Yield Generation
- [ ] 2.3 Testnet Deposit Flow
- [ ] 2.4 Testnet Withdrawal Flow

### Phase 3: Mainnet DeFi (Week 3-4)
**Priority:** Critical
**Impact:** Production-ready staking

- [ ] 3.1 Mainnet DeFi Service
- [ ] 3.2 Mainnet On-Ramp Integration
- [ ] 3.3 Mainnet Off-Ramp Integration
- [ ] 3.4 Mainnet Security Enhancements

### Phase 4: Migration & Testing (Week 5)
**Priority:** High
**Impact:** Safe network mode switching

- [ ] 4.1 Network Mode Switcher
- [ ] 4.2 Network Mode Testing
- [ ] 4.3 Network Mode Documentation

---

## 🎯 Success Criteria

### Network Configuration Success Metrics
- [ ] Network mode visible in all UI components
- [ ] API key validation enforces network separation
- [ ] Feature flags work correctly per mode
- [ ] Error messages include network context

### Testnet Success Metrics
- [ ] Oracle minting success rate > 99%
- [ ] Mock yield generation accurate to 0.01%
- [ ] Deposit/withdrawal instant (<1 second)
- [ ] No real blockchain transactions in testnet

### Mainnet Success Metrics
- [ ] DeFi staking success rate > 95%
- [ ] On-ramp completion rate > 90%
- [ ] Off-ramp completion rate > 90%
- [ ] Gas optimization reduces costs by > 30%
- [ ] Security checks prevent unauthorized transactions

### Migration Success Metrics
- [ ] Zero data loss during migration
- [ ] Migration completes in < 10 minutes
- [ ] Rollback works in < 5 minutes
- [ ] All tests pass after migration

---

## 🔄 Network Mode Flow Diagrams

### Testnet Flow (Demo Mode)
```
User Deposit Request
    ↓
API: Validate testnet API key
    ↓
Oracle Mint Service: Mint mock tokens
    ↓
DB: Update user balance (instant)
    ↓
Mock Yield Service: Simulate yield accrual
    ↓
User sees updated balance with simulated APY
```

### Mainnet Flow (Production)
```
User Deposit Request
    ↓
API: Validate mainnet API key
    ↓
On-Ramp Provider: Real fiat → crypto
    ↓
Wallet: Receive USDC/USDT
    ↓
DeFi Service: Real staking to AAVE/Compound/Morpho
    ↓
Blockchain: Transaction confirmed
    ↓
Vault Index: Updated with real yield
    ↓
User sees real balance with real APY
```

---

## 📝 Additional Notes

### Testnet Limitations
- No real money involved
- Instant transactions (no gas fees)
- Simulated yield (not real protocol yield)
- Mock transaction hashes
- Limited to demo purposes

### Mainnet Requirements
- Real KYC/AML compliance
- Real gas fees
- Real transaction delays
- Real DeFi protocol integration
- Production-grade security
- Regulatory compliance

### Cost Comparison
| Operation | Testnet | Mainnet |
|-----------|---------|---------|
| Deposit | Free (instant) | $0.50-$2.00 (fiat conversion fee) |
| Staking | Free (instant) | $5-$20 (gas fee) |
| Yield | Simulated (5% APY) | Real (3-7% APY based on protocol) |
| Withdrawal | Free (instant) | $5-$20 (gas fee) + off-ramp fee |

---

**Last Updated:** 2025-12-08
**Next Review:** After Phase 1 completion
