# Proxify Clean Architecture - Quick Reference Guide

## The 5-Layer Pattern (Used in Production)

```
HTTP Request
    ↓
[1] CONTROLLER - Parse input, orchestrate services, format response
    ↓
[2] SERVICE - Business logic, call usecases/repositories
    ↓
[3] USECASE - Pure business rules (cache strategy, validation)
    ↓
[4] REPOSITORY - Data access (DB, API, contracts)
    ↓
[5] EXTERNAL - Blockchain/APIs (viem, ethers, axios)
```

---

## Real Examples from Proxify

### Pattern 1: Simple Data Fetch (Starbase Star Packages)

```
GET /stars/packages
    ↓
StarController.getStarPackages()
    ↓
StarService.getStarPackages() → calls repository
    ↓
StarPackageRepository.getStarPackages() → MongoDB query
    ↓
Return: StarPackage[] entity
```

### Pattern 2: Price Lookup with Cache & External API (Starbase)

```
GET /tokens/:chainId/:tokenAddress
    ↓
TokenController.getTokenInfo()
    ↓
TokenService.getTokenInfo()
    ↓
PriceUsecase.getPrice()  ← Pure business logic
  - Validate token exists in config
  - Handle stablecoins (always $1)
  - Check Redis cache
  - Fetch from Binance API
  - Store in cache (async)
    ↓
BinanceMarketDataRepository.getPrice() → External API
PriceCacheRepository.getPrice()/setPrice() → Redis
```

### Pattern 3: Smart Contract Quote (Rabbitswap)

```
POST /swap/quote
    ↓
SwapController.getQuote()
    ↓
SwapRouter.getQuote()  ← Type-safe response handling
    ↓
RawAPIClient.swap.quote()  ← ts-rest HTTP call
    ↓
Response handling (switch on status codes)
  200 → return response.body.quote
  400 → throw APIError with specific code
  default → throw APIError
```

---

## Key Code Patterns to Copy

### 1. UseCase Pattern (Pure Business Logic)

```typescript
export class PriceUsecase {
  constructor(
    private readonly marketDataRepository: BinanceMarketDataRepository,
    private readonly cacheRepository: PriceCacheRepository,
    private readonly tokenConfig: Record<string, TokenConfig[]>,
  ) {}

  async getPrice(chainId: string, tokenAddress: string) {
    // 1. Validation
    const tokenConfig = this.tokenConfig[chainId]?.find(
      (token) => cmpAddress(token.address, tokenAddress)
    )
    if (!tokenConfig) {
      throw new Error(`Token not found`)
    }

    // 2. Business rule
    if (tokenConfig.isStableCoin) {
      return { price: new BigNumber(1), updatedAt: new Date() }
    }

    // 3. Cache check
    const cached = await this.cacheRepository.getPrice(chainId, tokenAddress)
    if (cached !== undefined) return cached

    // 4. Fetch external
    const price = await this.marketDataRepository.getPrice(chainId, tokenAddress)
    
    // 5. Update cache (fire and forget)
    this.cacheRepository.setPrice(chainId, tokenAddress, price).catch((err) => {
      Logger.error(`Failed to cache`, { err })
    })

    return price
  }
}
```

**Why this works**:
- Zero dependencies on HTTP layer
- Reusable by any client
- Testable (inject mock repositories)
- Handles cross-cutting concerns (cache, validation)

---

### 2. Router Pattern (Type-Safe Response Handling)

```typescript
export class SwapRouter extends Router<typeof coreContract> {
  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    const response = await this.client.swap.quote({ body: params })

    switch (response.status) {
      case 200:
        return response.body.quote  // Type-safe, never undefined
      case 400:
        if (response.body.errorCode === "NO_ROUTE") {
          throw new APIError(400, "NO_ROUTE", response.body)
        }
        throw new APIError(400, "Failed to quote")
      default:
        throw new APIError(response.status, "Unknown error")
    }
  }
}
```

**Why this works**:
- All status codes handled
- Exceptions are predictable
- Caller never needs null checks
- Errors have context

---

### 3. Service Pattern (Orchestration)

```typescript
export class TokenService {
  constructor(
    private priceUsecase: PriceUsecase,
    private tokenConfig: Record<string, TokenConfig[]>,
  ) {}

  async getTokenInfo(chainId: string, tokenAddress: string) {
    // Orchestrate multiple components
    const tokenConfig = this.tokenConfig[chainId]?.find(
      (token) => cmpAddress(token.address, tokenAddress)
    )
    if (!tokenConfig) throw new VError(`Token not found`)

    const price = await this.priceUsecase.getPrice(chainId, tokenAddress)
    if (!price) throw new VError(`Price not found`)

    return { ...tokenConfig, price }
  }

  async getMultipleTokenInfo(chainId: string, tokenAddresses: string[] = []) {
    if (tokenAddresses.length === 0) {
      tokenAddresses = this.tokenConfig[chainId]?.map((t) => t.address) ?? []
    }
    return Promise.all(
      tokenAddresses.map((addr) => this.getTokenInfo(chainId, addr))
    )
  }
}
```

**Why this works**:
- Single responsibility per service
- Reuses usecases
- Easy to test each piece
- Composable at multiple levels

---

### 4. Dependency Injection Pattern

```typescript
// Create repositories
const binanceRepo = new BinanceMarketDataRepository()
const cacheRepo = new PriceCacheRepository()

// Create usecase with deps
const priceUsecase = new PriceUsecase(binanceRepo, cacheRepo, tokenConfig)

// Create service with deps
const tokenService = new TokenService(priceUsecase, tokenConfig)

// Use in controller
router.get("/token/:id", async (req, res) => {
  const info = await tokenService.getTokenInfo(req.params.chainId, req.params.id)
  res.json(info)
})
```

**Why this works**:
- All dependencies explicit
- Easy to swap implementations (e.g., mock for tests)
- No global state
- Clear data flow

---

### 5. Error Handling Pattern

```typescript
// Custom error types
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public context?: Record<string, unknown>
  ) {
    super(message)
  }
}

// In router layer
switch (response.status) {
  case 200:
    return response.body.data
  case 400:
    throw new APIError(400, "Bad request", { errorCode: response.body.errorCode })
  case 404:
    throw new APIError(404, "Not found")
  default:
    throw new APIError(response.status, "Unknown error")
}

// In controller
try {
  const result = await service.doSomething()
  res.json(result)
} catch (error) {
  if (error instanceof APIError) {
    res.status(error.status).json({ message: error.message, ...error.context })
  } else {
    res.status(500).json({ message: "Internal server error" })
  }
}
```

**Why this works**:
- Errors flow up predictably
- HTTP status codes preserved
- Context data available
- Easy to log/monitor

---

## Entity/Type Patterns

### Pure Interface (No Implementation)

```typescript
// packages/core/entity/starpackage.ts
export interface StarPackage {
  packageId: string
  starAmount: BigNumber
  priceUsd: BigNumber
}

// packages/api-core/entity/blockchain.ts
export type Address = `0x${string}`

export interface OraclePrice {
  chainId: string
  tokenAddress: Address
  price: BigNumber
  updatedAt: Date
}
```

**Why this works**:
- Represents pure business concept
- Used across layers
- No implementation details
- Easy to extend

---

### DTO for External APIs

```typescript
// packages/api-core/dto/swap.ts
export interface QuoteRequest {
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippage: number
}

export interface QuoteResponse {
  amountOut: string
  route: SwapRoute[]
  gasEstimate: string
}
```

**Why this works**:
- Decouples implementation from contract
- Frontend has type-safe API
- Backend can change internals
- Can generate code for frontend

---

## Directory Structure to Copy

```
monorepo/
├── packages/
│   ├── core/
│   │   ├── entity/              # Pure interfaces
│   │   │   └── vault.ts
│   │   ├── repository/          # Data access layer
│   │   │   ├── vault.repository.ts
│   │   │   ├── mongodb/
│   │   │   ├── cache/
│   │   │   └── blockchain/
│   │   └── usecase/             # Pure business logic
│   │       ├── deposit.usecase.ts
│   │       ├── price.usecase.ts
│   │       └── rebalance.usecase.ts
│   │
│   ├── contracts/               # Smart contract definitions
│   │   ├── contracts/
│   │   ├── client/
│   │   │   └── router/
│   │   └── dto/
│   │
│   └── utils/                   # Shared utilities
│
└── apps/
    └── api/
        ├── controllers/         # HTTP handlers
        ├── services/            # Orchestration
        ├── routes/              # Express routes
        └── middleware/
```

---

## Testing Strategy

### Pattern: Inject Mocks

```typescript
describe('PriceUsecase', () => {
  let usecase: PriceUsecase
  let mockMarketDataRepo: BinanceMarketDataRepository
  let mockCacheRepo: PriceCacheRepository

  beforeEach(() => {
    mockMarketDataRepo = { getPrice: jest.fn() }
    mockCacheRepo = { getPrice: jest.fn(), setPrice: jest.fn() }
    
    usecase = new PriceUsecase(
      mockMarketDataRepo,
      mockCacheRepo,
      { '1': [{ address: '0x...', isStableCoin: true }] }
    )
  })

  it('should return 1 for stablecoins', async () => {
    const price = await usecase.getPrice('1', '0x...')
    expect(price.price.toString()).toBe('1')
  })

  it('should check cache before fetching', async () => {
    mockCacheRepo.getPrice.mockResolvedValue({ price: new BigNumber('100') })
    
    await usecase.getPrice('1', '0x...')
    
    expect(mockMarketDataRepo.getPrice).not.toHaveBeenCalled()
  })
})
```

---

## Technology Stack (Copy This)

**Backend**:
- Express.js
- TypeScript
- ts-rest/core (type-safe APIs)
- axios (HTTP client)
- Mongoose (MongoDB)
- viem or ethers (blockchain)
- Zod (validation)

**Monorepo**:
- pnpm + workspaces
- TurboRepo
- Shared ESLint config
- Shared tsconfig

**Error Handling**:
- VError (error chaining)
- Custom APIError class
- Domain-specific error codes

---

## Common Mistakes to Avoid

1. **Business logic in controllers**
   - DON'T: `res.json(db.find())`
   - DO: `const data = await service.getData(); res.json(data)`

2. **Services calling services directly**
   - DON'T: `this.otherService.something()`
   - DO: Inject both services into usecase/higher service

3. **No dependency injection**
   - DON'T: `const repo = new Repository()`
   - DO: `constructor(private repo: Repository) {}`

4. **Mixing data models**
   - DON'T: Return raw DB document from repository
   - DO: Map to domain entity first

5. **Swallowing errors**
   - DON'T: `catch (error) {}`
   - DO: `catch (error) { throw new APIError(...) }`

---

## Performance Patterns Used

### Caching Strategy (PriceUsecase)
- Check cache first
- Fetch if miss
- Update cache async (fire-and-forget with error logging)

### Batch Operations (TokenService)
- `Promise.all()` for parallel requests
- Config-driven allowlists

### Lazy Loading
- Load repositories only when needed
- Use factory pattern for complex initialization

---

## How to Apply to LAAC

**Oracle Service**:
```typescript
export class OraclePriceUseCase {
  constructor(
    private aaveRepository: AaveRepository,
    private compoundRepository: CompoundRepository,
    private priceCache: PriceCacheRepository,
  ) {}

  async getAggregatedPrice(tokens: Address[]): Promise<Map<Address, BigNumber>> {
    // Fetch from protocols
    // Cache results
    // Return aggregated
  }
}
```

**Vault Service**:
```typescript
export class VaultService {
  constructor(
    private vaultRepository: VaultRepository,
    private oracleUseCase: OraclePriceUseCase,
  ) {}

  async deposit(vaultAddress: Address, amount: BigNumber): Promise<TxHash> {
    // Validate
    // Get prices from oracle
    // Call repository
    // Return tx hash
  }
}
```

