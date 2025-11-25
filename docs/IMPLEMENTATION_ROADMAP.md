# LAAC Implementation Roadmap - Based on Proxify Architecture

This document maps Proxify patterns to LAAC-specific implementation.

## Recommended Monorepo Structure for LAAC

```
laac/
├── packages/
│   ├── core/
│   │   ├── entity/
│   │   │   ├── vault.ts              # Vault interface
│   │   │   ├── strategy.ts           # Strategy interface
│   │   │   ├── oracle-price.ts       # Price data interface
│   │   │   └── index.ts
│   │   ├── repository/
│   │   │   ├── vault.repository.ts   # Abstract vault repository
│   │   │   ├── mongodb/
│   │   │   │   ├── vault-impl.repository.ts
│   │   │   │   └── strategy-impl.repository.ts
│   │   │   ├── cache/
│   │   │   │   └── oracle-price.cache.ts
│   │   │   ├── blockchain/
│   │   │   │   ├── aave.repository.ts
│   │   │   │   ├── compound.repository.ts
│   │   │   │   └── curve.repository.ts
│   │   │   └── index.ts
│   │   ├── usecase/
│   │   │   ├── deposit.usecase.ts     # Core deposit logic
│   │   │   ├── withdraw.usecase.ts    # Core withdraw logic
│   │   │   ├── rebalance.usecase.ts   # Core rebalancing logic
│   │   │   ├── oracle-price.usecase.ts # Oracle aggregation + caching
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── precision.ts           # BigNumber utilities
│   │   └── package.json
│   │
│   ├── contracts-client/
│   │   ├── contracts/
│   │   │   ├── vault.contract.ts      # ts-rest contract for vault
│   │   │   ├── oracle.contract.ts     # ts-rest contract for oracle
│   │   │   └── index.ts
│   │   ├── client/
│   │   │   ├── raw-client.ts          # Raw axios client
│   │   │   └── index.ts
│   │   ├── router/
│   │   │   ├── vault.router.ts        # Response handling
│   │   │   ├── oracle.router.ts
│   │   │   └── index.ts
│   │   ├── dto/
│   │   │   ├── vault.dto.ts
│   │   │   ├── oracle.dto.ts
│   │   │   └── index.ts
│   │   ├── entity/
│   │   │   ├── blockchain.ts          # Address type, etc
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/
│   │   ├── index.ts                   # Shared types
│   │   └── package.json
│   │
│   ├── logger/
│   │   └── package.json
│   │
│   └── utils/
│       └── package.json
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── vault.controller.ts
│   │   │   │   ├── oracle.controller.ts
│   │   │   │   └── system.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── vault.service.ts
│   │   │   │   ├── oracle.service.ts
│   │   │   │   └── rebalance.service.ts
│   │   │   ├── routes/
│   │   │   │   ├── vault.routes.ts
│   │   │   │   ├── oracle.routes.ts
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   │   └── error-handler.ts
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   └── *.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── oracle/
│   │   ├── src/
│   │   │   ├── price-aggregator.ts
│   │   │   ├── protocol-manager.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── utils/
│       │   └── main.tsx
│       └── package.json
│
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

---

## Layer-by-Layer Implementation for LAAC

### Layer 1: Entity / Domain Models

**File: `packages/core/entity/vault.ts`**

```typescript
import BigNumber from "bignumber.js"

export interface VaultStrategy {
  name: string
  protocol: "aave" | "compound" | "curve"
  weight: number // percentage allocation
}

export interface Vault {
  id: string
  address: Address
  name: string
  description: string
  strategies: VaultStrategy[]
  totalAUM: BigNumber
  feePercentage: number
  createdAt: Date
}

export interface VaultPosition {
  vaultId: string
  userAddress: Address
  depositAmount: BigNumber
  shares: BigNumber
  value: BigNumber
  createdAt: Date
}
```

**File: `packages/core/entity/oracle-price.ts`**

```typescript
export interface OraclePrice {
  chainId: number
  tokenAddress: Address
  price: BigNumber
  timestamp: Date
  source: "aave" | "compound" | "chainlink" | "coingecko"
}

export interface AggregatedPrice {
  tokenAddress: Address
  priceUSD: BigNumber
  confidence: number // 0-1, how confident in the price
  timestamp: Date
}
```

---

### Layer 2: Repository Pattern

**File: `packages/core/repository/vault.repository.ts` (Abstract)**

```typescript
export interface IVaultRepository {
  getVault(vaultId: string): Promise<Vault>
  getAllVaults(): Promise<Vault[]>
  saveVault(vault: Vault): Promise<void>
  updateVault(vaultId: string, updates: Partial<Vault>): Promise<void>
}
```

**File: `packages/core/repository/mongodb/vault-impl.repository.ts`**

```typescript
export class VaultMongoRepository implements IVaultRepository {
  private VaultModel: Model<VaultDocument>

  constructor(mongoClient: Mongoose) {
    this.VaultModel = createVaultModel(mongoClient)
  }

  async getVault(vaultId: string): Promise<Vault> {
    const doc = await this.VaultModel.findById(vaultId)
    if (!doc) throw new VError(`Vault not found: ${vaultId}`)
    return this.mapToEntity(doc)
  }

  async getAllVaults(): Promise<Vault[]> {
    const docs = await this.VaultModel.find()
    return docs.map((doc) => this.mapToEntity(doc))
  }

  private mapToEntity(doc: VaultDocument): Vault {
    return {
      id: doc._id.toString(),
      address: doc.address,
      name: doc.name,
      description: doc.description,
      strategies: doc.strategies,
      totalAUM: new BigNumber(doc.totalAUM),
      feePercentage: doc.feePercentage,
      createdAt: doc.createdAt,
    }
  }
}
```

**File: `packages/core/repository/blockchain/aave.repository.ts`**

```typescript
export class AaveRepository {
  constructor(private provider: viem.PublicClient) {}

  async getSupplyAPY(tokenAddress: Address): Promise<BigNumber> {
    // Call Aave contract
    // Get current APY
    // Return as BigNumber
  }

  async getSuppliedBalance(userAddress: Address, tokenAddress: Address): Promise<BigNumber> {
    // Get user's balance in Aave
  }

  async supply(tokenAddress: Address, amount: BigNumber): Promise<string> {
    // Execute supply transaction
    // Return tx hash
  }
}
```

**File: `packages/core/repository/cache/oracle-price.cache.ts`**

```typescript
export class OraclePriceCache {
  constructor(private redis: Redis, private ttl: number = 60) {}

  async getPrice(tokenAddress: Address): Promise<OraclePrice | undefined> {
    const cached = await this.redis.get(`oracle:price:${tokenAddress}`)
    if (!cached) return undefined
    return JSON.parse(cached)
  }

  async setPrice(price: OraclePrice): Promise<void> {
    await this.redis.setex(
      `oracle:price:${price.tokenAddress}`,
      this.ttl,
      JSON.stringify(price)
    )
  }
}
```

---

### Layer 3: UseCase Layer (Pure Business Logic)

**File: `packages/core/usecase/oracle-price.usecase.ts`**

```typescript
export class OraclePriceUseCase {
  constructor(
    private aaveRepository: AaveRepository,
    private compoundRepository: CompoundRepository,
    private curveRepository: CurveRepository,
    private priceCache: OraclePriceCache,
    private allowedTokens: Address[],
  ) {}

  async getAggregatedPrice(tokenAddress: Address): Promise<AggregatedPrice> {
    // 1. Validate token is whitelisted
    if (!this.allowedTokens.includes(tokenAddress)) {
      throw new Error(`Token not whitelisted: ${tokenAddress}`)
    }

    // 2. Check cache
    const cached = await this.priceCache.getPrice(tokenAddress)
    if (cached && Date.now() - cached.timestamp.getTime() < 30000) {
      // Cache hit within 30 seconds
      return {
        tokenAddress,
        priceUSD: cached.price,
        confidence: 0.95,
        timestamp: cached.timestamp,
      }
    }

    // 3. Fetch from multiple protocols in parallel
    const prices = await Promise.all([
      this.aaveRepository.getTokenPrice(tokenAddress).catch(() => null),
      this.compoundRepository.getTokenPrice(tokenAddress).catch(() => null),
      this.curveRepository.getTokenPrice(tokenAddress).catch(() => null),
    ])

    // 4. Aggregate (median approach)
    const validPrices = prices.filter((p) => p !== null) as BigNumber[]
    if (validPrices.length === 0) {
      throw new Error(`Could not fetch price from any oracle: ${tokenAddress}`)
    }

    const aggregatedPrice = this.getMedianPrice(validPrices)
    const confidence = validPrices.length / 3 // 0.33-1.0

    // 5. Cache result
    const result: AggregatedPrice = {
      tokenAddress,
      priceUSD: aggregatedPrice,
      confidence,
      timestamp: new Date(),
    }

    await this.priceCache.setPrice({
      chainId: 1,
      tokenAddress,
      price: aggregatedPrice,
      timestamp: new Date(),
      source: "aave", // Log primary source
    }).catch((err) => {
      Logger.warn("Failed to cache oracle price", { err })
    })

    return result
  }

  private getMedianPrice(prices: BigNumber[]): BigNumber {
    const sorted = prices.sort((a, b) => a.minus(b).toNumber())
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : sorted[mid].plus(sorted[mid - 1]).div(2)
  }
}
```

**File: `packages/core/usecase/deposit.usecase.ts`**

```typescript
export class DepositUseCase {
  constructor(
    private vaultRepository: IVaultRepository,
    private oraclePriceUseCase: OraclePriceUseCase,
    private blockchainClient: viem.WalletClient,
  ) {}

  async deposit(
    vaultAddress: Address,
    depositAmount: BigNumber,
    userAddress: Address,
  ): Promise<string> {
    // 1. Get vault config
    const vault = await this.vaultRepository.getVault(vaultAddress)
    if (!vault) throw new Error(`Vault not found: ${vaultAddress}`)

    // 2. Validate amount (against TVL cap from docs)
    if (vault.totalAUM.plus(depositAmount).gt(new BigNumber(500000))) {
      throw new Error("Deposit would exceed TVL cap")
    }

    // 3. Get current prices for all assets in vault
    const prices = await Promise.all(
      vault.strategies.map((strategy) =>
        this.oraclePriceUseCase.getAggregatedPrice(strategy.tokenAddress)
      )
    )

    // 4. Calculate vault value and shares
    const vaultValueUSD = vault.totalAUM
    const userSharePercentage = depositAmount.div(vaultValueUSD.plus(depositAmount))
    const sharesIssued = userSharePercentage.times(100) // Simplified

    // 5. Execute deposit transaction
    // (Actual tx execution would be in repository)
    const txHash = await this.blockchainClient.sendTransaction({
      to: vaultAddress,
      data: encodeDepositCall(depositAmount),
    })

    // 6. Update vault state in DB
    await this.vaultRepository.updateVault(vaultAddress, {
      totalAUM: vault.totalAUM.plus(depositAmount),
    })

    return txHash
  }

  async validateDeposit(
    vaultAddress: Address,
    depositAmount: BigNumber,
  ): Promise<DepositValidation> {
    const vault = await this.vaultRepository.getVault(vaultAddress)

    const newTVL = vault.totalAUM.plus(depositAmount)
    const maxTVL = new BigNumber(500000)

    return {
      isValid: newTVL.lte(maxTVL),
      newTVL,
      maxTVL,
      message: newTVL.gt(maxTVL) ? "Deposit exceeds TVL cap" : "Valid",
    }
  }
}
```

---

### Layer 4: Service Layer

**File: `apps/api/src/services/vault.service.ts`**

```typescript
export class VaultService {
  constructor(
    private vaultRepository: IVaultRepository,
    private depositUseCase: DepositUseCase,
    private withdrawUseCase: WithdrawUseCase,
  ) {}

  async getVaultDetails(vaultId: string) {
    const vault = await this.vaultRepository.getVault(vaultId)
    
    return {
      id: vault.id,
      name: vault.name,
      description: vault.description,
      aum: vault.totalAUM.toString(),
      strategies: vault.strategies,
      fee: vault.feePercentage,
    }
  }

  async getAllVaults() {
    const vaults = await this.vaultRepository.getAllVaults()
    
    return vaults.map((vault) => ({
      id: vault.id,
      name: vault.name,
      aum: vault.totalAUM.toString(),
      strategies: vault.strategies,
    }))
  }

  async initiateDeposit(
    vaultId: string,
    amount: BigNumber,
    userAddress: Address,
  ): Promise<DepositResponse> {
    // Validate first
    const validation = await this.depositUseCase.validateDeposit(vaultId, amount)
    if (!validation.isValid) {
      throw new Error(validation.message)
    }

    // Execute
    const txHash = await this.depositUseCase.deposit(vaultId, amount, userAddress)

    return {
      success: true,
      transactionHash: txHash,
      vaultId,
      amount: amount.toString(),
      userAddress,
      timestamp: new Date(),
    }
  }
}
```

**File: `apps/api/src/services/oracle.service.ts`**

```typescript
export class OracleService {
  constructor(private oraclePriceUseCase: OraclePriceUseCase) {}

  async getTokenPrice(tokenAddress: Address): Promise<PriceResponse> {
    const aggregatedPrice = await this.oraclePriceUseCase.getAggregatedPrice(tokenAddress)

    return {
      tokenAddress,
      priceUSD: aggregatedPrice.priceUSD.toString(),
      confidence: (aggregatedPrice.confidence * 100).toFixed(2),
      timestamp: aggregatedPrice.timestamp,
    }
  }

  async getPrices(tokenAddresses: Address[]): Promise<PriceResponse[]> {
    return Promise.all(
      tokenAddresses.map((address) => this.getTokenPrice(address))
    )
  }
}
```

---

### Layer 5: Controllers

**File: `apps/api/src/controllers/vault.controller.ts`**

```typescript
export class VaultController {
  constructor(private vaultService: VaultService) {}

  async getVault(req: Request, res: Response) {
    try {
      const vault = await this.vaultService.getVaultDetails(req.params.vaultId)
      res.json({ success: true, data: vault })
    } catch (error) {
      res.status(404).json({ success: false, error: "Vault not found" })
    }
  }

  async listVaults(req: Request, res: Response) {
    try {
      const vaults = await this.vaultService.getAllVaults()
      res.json({ success: true, data: vaults })
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to list vaults" })
    }
  }

  async initiateDeposit(req: Request, res: Response) {
    try {
      const { vaultId, amount, userAddress } = req.body

      const response = await this.vaultService.initiateDeposit(
        vaultId,
        new BigNumber(amount),
        userAddress,
      )

      res.status(201).json({ success: true, data: response })
    } catch (error) {
      const err = error as Error
      res.status(400).json({ success: false, error: err.message })
    }
  }
}
```

---

### Layer 6: Routes

**File: `apps/api/src/routes/vault.routes.ts`**

```typescript
export default (vaultService: VaultService, oracleService: OracleService) => {
  const router = express.Router()
  const vaultController = new VaultController(vaultService)

  router.get("/", vaultController.listVaults)
  router.get("/:vaultId", vaultController.getVault)
  router.post("/:vaultId/deposit", vaultController.initiateDeposit)

  return router
}
```

---

### Dependency Injection Setup

**File: `apps/api/src/app.ts`**

```typescript
import mongoose from "mongoose"
import { createPublicClient, createWalletClient, http } from "viem"

// Import all repositories
import { VaultMongoRepository } from "@laac/core/repository/mongodb/vault-impl.repository"
import { AaveRepository } from "@laac/core/repository/blockchain/aave.repository"
import { CompoundRepository } from "@laac/core/repository/blockchain/compound.repository"
import { OraclePriceCache } from "@laac/core/repository/cache/oracle-price.cache"

// Import usecases
import { OraclePriceUseCase } from "@laac/core/usecase/oracle-price.usecase"
import { DepositUseCase } from "@laac/core/usecase/deposit.usecase"

// Import services
import { VaultService } from "./services/vault.service"
import { OracleService } from "./services/oracle.service"

// Import routes
import vaultRoutes from "./routes/vault.routes"

export async function createApp() {
  const app = express()

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URL!)

  // Setup blockchain clients
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  const walletClient = createWalletClient({
    chain: mainnet,
    transport: http(),
    account: process.env.PRIVATE_KEY!,
  })

  // Setup repositories
  const vaultRepository = new VaultMongoRepository(mongoose)
  const aaveRepository = new AaveRepository(publicClient)
  const compoundRepository = new CompoundRepository(publicClient)
  const priceCache = new OraclePriceCache(redis, 60) // 60 second TTL

  // Setup usecases
  const oraclePriceUseCase = new OraclePriceUseCase(
    aaveRepository,
    compoundRepository,
    new CurveRepository(publicClient),
    priceCache,
    ALLOWED_TOKENS, // from config
  )

  const depositUseCase = new DepositUseCase(
    vaultRepository,
    oraclePriceUseCase,
    walletClient,
  )

  // Setup services
  const vaultService = new VaultService(
    vaultRepository,
    depositUseCase,
    new WithdrawUseCase(...),
  )

  const oracleService = new OracleService(oraclePriceUseCase)

  // Setup routes
  app.use("/api/vaults", vaultRoutes(vaultService, oracleService))

  return app
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Create monorepo structure with pnpm workspaces
- [ ] Set up shared packages (tsconfig, eslint-config)
- [ ] Create `@laac/core` package
- [ ] Create `@laac/contracts-client` package
- [ ] Create `@laac/types` package

### Phase 2: Core Entities & Repositories (Week 2-3)
- [ ] Define all domain entities (Vault, Strategy, OraclePrice, etc)
- [ ] Implement abstract repositories
- [ ] Implement MongoDB repositories
- [ ] Implement blockchain protocol repositories (Aave, Compound, Curve)
- [ ] Implement cache repository

### Phase 3: UseCase Layer (Week 3-4)
- [ ] Implement OraclePriceUseCase (with caching + aggregation)
- [ ] Implement DepositUseCase
- [ ] Implement WithdrawUseCase
- [ ] Implement RebalanceUseCase
- [ ] Write tests for all usecases

### Phase 4: Service Layer (Week 4)
- [ ] Implement VaultService
- [ ] Implement OracleService
- [ ] Implement RebalanceService
- [ ] Add test coverage

### Phase 5: Controllers & Routes (Week 5)
- [ ] Implement all controllers
- [ ] Setup Express routes
- [ ] Add error middleware
- [ ] Add request validation middleware

### Phase 6: Integration & Testing (Week 5-6)
- [ ] End-to-end tests
- [ ] Integration tests
- [ ] Contract interaction tests
- [ ] Load testing

---

## Key Differences from Proxify

1. **Multi-protocol support**: LAAC must support Aave, Compound, Curve simultaneously
2. **Oracle aggregation**: Proxify uses single data source; LAAC aggregates from multiple
3. **TVL caps**: Phase 1 has $500k cap that must be enforced in UseCase
4. **Manual oracle**: Phase 1 uses manual price updates; UseCase must handle this

---

## Files Needed Before Implementation

1. ABIs for Vault contract, Aave, Compound, Curve
2. Contract addresses per chain
3. Allowed token list
4. Oracle endpoint URLs
5. MongoDB connection string
6. Private key for transactions

Store these in environment variables or config files, never hardcoded.

