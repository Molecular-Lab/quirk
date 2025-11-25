# Proxify Clean Architecture Analysis: TypeScript Services with Smart Contracts

## Executive Summary

Proxify repositories demonstrate a **production-grade clean architecture pattern** for TypeScript services that interact with smart contracts and external APIs. The architecture emphasizes **separation of concerns**, **dependency injection**, and **type safety** through layered abstractions.

### Three Key Patterns Analyzed:
1. **Proxify Analytics**: Solana trading analytics with external API integration
2. **starbase**: EVM/Solana DeFi yield platform with contract interaction
3. **rabbitswap-interface**: DEX interface with multi-protocol aggregation

---

## 1. Overall Architecture Layers

```
┌─────────────────────────────────────────────┐
│     Controller / Route Handler              │  HTTP Entry Points
│  (Express routes, request/response)         │
├─────────────────────────────────────────────┤
│     Service Layer                           │  Business Logic
│  (StarService, PriceUsecase, TokenService)  │
├─────────────────────────────────────────────┤
│     Repository Pattern                      │  Data Access Layer
│  (MongoRepository, BinanceRepository,       │
│   ContractClient, DatabaseRepository)       │
├─────────────────────────────────────────────┤
│     External Integration Layer              │  Contract/API Calls
│  (viem/ethers calls, external APIs,         │
│   off-chain services)                       │
└─────────────────────────────────────────────┘
```

### Key Principle:
Each layer has **zero knowledge** of layers above it. Dependencies flow **downward only**.

---

## 2. Directory Structure Pattern

### Monorepo Organization

```
/packages                          # Shared logic across services
  /core                           # Core business entities + repositories
    /config                       # Configuration constants
    /entity                       # Domain models (interfaces)
    /repository                   # Data access layer
      /mongodb                    # Database repositories
      /binance                    # External API repositories
      /cache                      # Cache repositories
    /usecase                      # Pure business logic (orchestrators)
    /utils                        # Utilities

  /api-core                       # API contract + client layer
    /contracts                    # ts-rest contract definitions
    /client                       # HTTP client implementations
      /router                     # Router classes (wrapper layer)
    /dto                          # Data transfer objects
    /entity                       # API entity types

  /types                          # Shared TypeScript types
  /logger                         # Logger utility
  /localstore                     # Local storage utilities

/apps
  /api                           # Main API server
    /src
      /controllers               # HTTP request handlers
      /services                  # Business logic per domain
      /routes                    # Express route setup
  
  /backend                       # Background services/indexers
    /src
      /indexer
        /controllers            # Indexer logic
        /services               # Processing services
        /interfaces             # Event interfaces
  
  /web                          # Frontend application
    /src
      /types                    # React-specific types
      /config                   # Frontend configuration
      /constants                # Smart contract ABIs, addresses
```

---

## 3. Clean Architecture Layers in Detail

### Layer 1: Controller / Route Handler

**File**: `apps/api/src/controllers/star_controllers.ts`

```typescript
export class StarController {
  private starService: StarService

  constructor(
    starService: StarService,
    private priceUsecase: PriceUsecase,
  ) {
    this.starService = starService
  }

  public getStarPackages = async (
    req: Request<unknown, unknown, unknown, { chainId?: string; tokenAddress?: string }>,
    res: Response,
  ) => {
    try {
      const starPackages = await this.starService.getStarPackages()
      
      // Orchestrate multiple services
      const price = chainId && tokenAddress 
        ? await this.priceUsecase.getPrice(chainId, tokenAddress) 
        : undefined

      // Transform and return
      const formattedData = starPackages
        .map((pkg) => ({
          id: pkg.packageId,
          starAmount: pkg.starAmount.toNumber(),
          tokenAmount: (price ? pkg.priceUsd.div(price.price) : pkg.priceUsd).toFixed(18),
        }))

      res.status(200).json({ message: "success", data: formattedData })
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch star packages" })
    }
  }
}
```

**Responsibilities**:
- Parse HTTP request parameters
- Call business logic services
- Format/transform responses
- Handle error responses
- Never contains business logic

---

### Layer 2: Service Layer

**File**: `apps/api/src/services/star_services.ts`

```typescript
export class StarService {
  private starPackageRepository: StarPackageRepository

  constructor(starPackageRepository: StarPackageRepository) {
    this.starPackageRepository = starPackageRepository
  }

  public async getStarPackages(): Promise<StarPackage[]> {
    const data = await this.starPackageRepository.getStarPackages()
    return data
  }

  public async saveStarPakcages(): Promise<void> {
    const packages = [
      { packageId: "star-id-50", starAmount: new BigNumber("50"), priceUsd: new BigNumber("0.8625") },
      // ... more packages
    ]
    await this.starPackageRepository.saveStarPackages(packages as StarPackage[])
  }
}
```

**Business Logic Service Pattern** (`apps/api/src/services/token_services.ts`):

```typescript
export class TokenService {
  constructor(
    private priceUsecase: PriceUsecase,
    private tokenConfig: Record<string, TokenConfig[]>,
  ) {}

  public async getTokenInfo(chainId: string, tokenAddress: string) {
    const tokenConfig = this.tokenConfig[chainId]?.find(
      (token) => cmpAddress(token.address, tokenAddress)
    )
    if (!tokenConfig) {
      throw new VError(`Token config not found for token address: ${tokenAddress}`)
    }
    
    // Orchestrate multiple repositories/usecases
    const price = await this.priceUsecase.getPrice(chainId, tokenAddress)
    if (!price) {
      throw new VError(`Price not found for token address: ${tokenAddress}`)
    }
    
    return {
      ...tokenConfig,
      price,
    }
  }

  public async getMultipleTokenInfo(chainId: string, tokenAddresses: string[] = []) {
    if (tokenAddresses.length === 0) {
      tokenAddresses = this.tokenConfig[chainId]?.map((token) => token.address) ?? []
    }
    return Promise.all(
      tokenAddresses.map((tokenAddress) => this.getTokenInfo(chainId, tokenAddress))
    )
  }
}
```

**Responsibilities**:
- Orchestrate repository calls
- Business rule validation
- Data transformation
- Error handling with domain-specific errors
- Service composition

---

### Layer 3: Repository / Data Access Layer

**Database Repository** (`packages/core/repository/mongodb/starpackage.repository.ts`):

```typescript
export class StarPackageRepository {
  private readonly StarPackageModel: Model<StarPackageDocument>
  
  constructor(private client: Mongoose) {
    this.StarPackageModel = createStarPackageModel(this.client)
  }

  async saveStarPackages(packages: StarPackage[]): Promise<void> {
    try {
      await this.StarPackageModel.insertMany(packages, { ordered: true })
    } catch (error) {
      throw new VError(error as Error, "Failed to save star packages")
    }
  }

  async getStarPackages(): Promise<StarPackage[]> {
    try {
      const packages = await this.StarPackageModel.find().sort({ starAmount: 1 })
      return packages as StarPackage[]
    } catch (error) {
      throw new VError(error as Error, "Failed to get star packages")
    }
  }
}
```

**External API Repository** (`packages/core/repository/binance/marketdata.repository.ts`):

```typescript
export class BinanceMarketDataRepository {
  async getPrice(chainId: string, tokenAddress: string): Promise<PriceData> {
    // Calls external API (Binance)
    // Returns standardized domain model
  }
}
```

**Responsibilities**:
- Abstract data source (DB, API, contract)
- Return domain models (not raw responses)
- Handle data transformation from external format
- Error handling with domain-specific errors
- No business logic

---

### Layer 4: UseCase Layer (Pure Business Logic)

**File**: `packages/core/usecase/price.usecase.ts`

```typescript
export class PriceUsecase {
  constructor(
    private readonly marketDataRepository: BinanceMarketDataRepository,
    private readonly cacheRepository: PriceCacheRepository,
    private readonly tokenConfig: Record<string, TokenConfig[]>,
  ) {}

  async getPrice(chainId: string, tokenAddress: string) {
    // 1. Validate token exists in config
    const tokenConfig = this.tokenConfig[chainId]?.find(
      (token) => cmpAddress(token.address, tokenAddress)
    )
    if (!tokenConfig) {
      throw new Error(`Token not found, chainId: ${chainId}, tokenAddress: ${tokenAddress}`)
    }

    // 2. Handle stablecoins specially
    if (tokenConfig.isStableCoin) {
      return {
        price: new BigNumber(1),
        updatedAt: new Date(),
      }
    }

    // 3. Check cache first
    const cachedPrice = await this.cacheRepository.getPrice(chainId, tokenAddress)
    if (cachedPrice !== undefined) {
      return cachedPrice
    }

    // 4. Fetch from market data
    const price = await this.marketDataRepository.getPrice(chainId, tokenAddress)
    
    // 5. Update cache (async, fire-and-forget with error handling)
    this.cacheRepository.setPrice(chainId, tokenAddress, price).catch((err: unknown) => {
      Logger.error(`Failed to set price to cache`, {
        event: "price:caching",
        chainId: chainId,
        tokenAddress: tokenAddress,
        err: err as Error,
      })
    })

    return price
  }
}
```

**Characteristics**:
- **Pure business logic**: Cache strategy, validation rules, data transformation
- **Dependency injection**: Repositories and configs passed in
- **Reusable**: Can be used by controllers, services, or other usecases
- **Testable**: All dependencies can be mocked

---

## 4. Contract Interaction Pattern (API Gateway)

### Approach: `ts-rest` for Type-Safe API Communication

**Step 1: Define Contract** (`packages/api-core/contracts/swap.ts`):

```typescript
import { initContract } from "@ts-rest/core"

const c = initContract()

export const swapContract = c.router({
  quote: {
    method: "POST",
    path: "/quote",
    body: QuoteRequest,
    responses: {
      200: c.type<QuoteAPIResponse>(),
      400: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
  },
})
```

**Benefits**:
- Single source of truth for API structure
- Automatic TypeScript types for request/response
- Type-safe API consumption
- Shared between frontend and backend

---

### Step 2: Raw Client** (`packages/api-core/client/rawClient.ts`):

Wraps axios with ts-rest contract support.

```typescript
// Usage internally:
const response = await this.client.swap.quote({
  body: params,
})
```

---

### Step 3: Router Layer** (`packages/api-core/client/router/swap.ts`):

```typescript
export class SwapRouter extends Router<typeof coreContract> {
  async getQuote(params: QuoteRequest): Promise<{ quote: QuoteResponse; routeCount: number }> {
    // Call raw client
    const response = await this.client.swap.quote({
      body: params,
    })

    // Handle different status codes
    switch (response.status) {
      case 200: {
        return {
          quote: response.body.quote,
          routeCount: response.body.routeCount,
        }
      }
      case 400: {
        if (response.body.errorCode === "NO_ROUTE" || response.body.errorCode === "NOT_ENOUGH_LIQUIDITY") {
          throw new APIError(response.status, response.body.errorCode, response.body)
        }
        throw new APIError(response.status, "Failed to fetch quote")
      }
      default: {
        throw new APIError(response.status, "Failed to fetch quote")
      }
    }
  }
}
```

**Pattern Benefits**:
- **Error handling**: Consistent error responses
- **Type safety**: All responses are typed
- **Single responsibility**: Router only handles response unwrapping
- **Reusability**: Router can be used by services

---

### Step 4: Main API Client** (`packages/api-core/client/client.ts`):

```typescript
export class APIClient {
  private client: RawAPIClient<typeof coreContract>
  swapRouter: SwapRouter
  poolRouter: PoolRouter
  exploreRouter: ExploreRouter
  // ... other routers

  constructor(axios: AxiosInstance, configs: APIClientConfigs) {
    this.client = initRawAPIClient(axios, configs.rabbitApiUrl, coreContract)
    this.swapRouter = new SwapRouter(this.client)
    this.poolRouter = new PoolRouter(this.client)
    this.exploreRouter = new ExploreRouter(this.client)
    // ... initialize other routers
  }
}
```

**Design Pattern**: **Facade Pattern**
- Single entry point for all API interactions
- Composes multiple routers
- Dependency injection at construction

---

## 5. Contract Interaction Pattern for On-Chain Operations

### Example: Using Alphatrace Pattern

**File**: `packages/core-lib/usecase/solana-usecase.ts`

```typescript
export class SolanaUseCase {
  solanaClient: ReturnType<typeof createSolanaClient>
  solanaUserClient: ReturnType<typeof createSolanaUserClient>

  constructor(
    solanaClient: ReturnType<typeof createSolanaClient>,
    solanaUserClient: ReturnType<typeof createSolanaUserClient>,
  ) {
    this.solanaClient = solanaClient
    this.solanaUserClient = solanaUserClient
  }

  // Business logic wrapping contract calls
  async getTokenDetail(chainId: string, tokenAddress: string): Promise<TokenDiscoveryDetail> {
    // Validation
    if (!isSolanaAddress(tokenAddress)) {
      throw new ErrorException(ErrorCode.INVALID_REQUEST)
    }

    // Call off-chain service (wrapped as if it were a contract call)
    const response = await this.solanaClient.tokenDiscovery.getTokenDetail({
      params: {
        chainId: chainId || "sol",
        tokenAddress: tokenAddress,
      },
      query: {
        timeframe: "1M,1H,5M,6H,1D",
      },
    })

    // Error handling
    if (response.status === 200) {
      return response.body.result
    }

    throw new ErrorException(ErrorCode.INTERNAL_SERVER_ERROR)
  }

  async createLimitOrder(data: {
    baseToken: string
    quoteToken: string
    amount: string
    price: string
    slippage: number
    side: "BUY" | "SELL"
    triggerType: "PRICE"
    walletAddress: string
  }): Promise<string> {
    // Get authentication token
    const token = await this.getBotJwtToken()

    // Call contract through client
    const response = await this.solanaClient.tradingBot.createLimitOrder({
      body: data,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    // Unwrap response
    if (response.status === 200) {
      return response.body.orderId
    }

    throw new ErrorException(ErrorCode.INTERNAL_SERVER_ERROR)
  }
}
```

**Key Patterns**:
1. **Validation first**: Check inputs before calling contract
2. **Error handling**: Standardized error responses
3. **Authentication**: Include necessary headers/signatures
4. **Response unwrapping**: Extract meaningful data from response
5. **Status code handling**: Switch on HTTP status codes

---

## 6. Entity / Domain Model Pattern

**File**: `packages/core/entity/starpackage.ts`

```typescript
import type BigNumber from "bignumber.js"

export interface StarPackage {
  packageId: string
  starAmount: BigNumber
  priceUsd: BigNumber
}
```

**Characteristics**:
- **Pure interfaces**: No implementation
- **Type-safe**: Uses specific types (BigNumber, not number)
- **Domain-focused**: Represents business concept, not database schema
- **Single responsibility**: One entity per file

---

## 7. Dependency Injection Pattern

**File**: `apps/api/src/app.ts`

```typescript
import { BinanceMarketDataRepository } from "@starbase/core/repository/binance/marketdata.repository"
import { PriceCacheRepository } from "@starbase/core/repository/cache/price.repository"
import { StarPackageRepository } from "@starbase/core/repository/mongodb/starpackage.repository"
import { PriceUsecase } from "@starbase/core/usecase/price.usecase"

import starRoutes from "./routes/star_routes"
import { StarService } from "./services/star_services"

// Create repositories
const binanceRepository = new BinanceMarketDataRepository()
const cacheRepository = new PriceCacheRepository()

// Create usecase with dependencies
const priceUsecase = new PriceUsecase(
  binanceRepository,
  cacheRepository,
  tokens,
)

// Create services with dependencies
const starPackageRepository = new StarPackageRepository(mongoClient)
const starService = new StarService(starPackageRepository)

// Create routes with services
app.use("/stars", starRoutes(starService, priceUsecase))
```

**Benefits**:
- **Testability**: Easy to inject mocks
- **Flexibility**: Can swap implementations
- **Clarity**: Dependencies are explicit
- **Centralized**: All setup in one place

---

## 8. Error Handling Pattern

**Consistent Error Model**:

```typescript
// From Proxify Analytics
throw new ErrorException(ErrorCode.INVALID_REQUEST)
throw new ErrorException(ErrorCode.INTERNAL_SERVER_ERROR)

// From rabbitswap
throw new APIError(response.status, "Failed to fetch quote", {
  errorCode: response.body.error,
  message: response.body.error,
})

// From starbase
throw new VError(error as Error, "Failed to save star packages")
throw new VError(`Token config not found for token address: ${tokenAddress}`)
```

**Standardized HTTP Error Handling**:

```typescript
switch (response.status) {
  case 200:
    return response.body.data
  case 400:
    throw new APIError(response.status, "Failed to buy stars", response.body)
  case 404:
    throw new APIError(response.status, "Order not found", response.body)
  default:
    throw new APIError(response.status, "Failed to buy stars")
}
```

---

## 9. Data Transfer Objects (DTOs)

**File**: `packages/api-core/dto/swap.ts`

```typescript
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

export interface ErrorResponse {
  error: string
  code?: string
}
```

**Usage**:
- Decouples frontend from backend implementation
- Enables code generation for frontend types
- Version-safe API changes
- Type-safe across services

---

## 10. Key Technologies & Frameworks

### Backend Stack
- **HTTP Framework**: Express.js (Node.js)
- **API Contracts**: `@ts-rest/core` for type-safe API definitions
- **HTTP Client**: axios
- **Validation**: zod
- **ORM**: Mongoose (MongoDB)
- **Cache**: Redis (via dedicated repository)
- **Error Handling**: VError for error chaining
- **Logging**: Custom logger package

### Monorepo Tools
- **Package Manager**: pnpm + workspaces
- **Build Orchestration**: TurboRepo
- **TypeScript**: Single tsconfig shared across packages
- **Linting**: ESLint with shared config packages
- **Testing**: Vitest

---

## 11. Best Practices Observed

### 1. Single Responsibility Principle
- Controllers handle HTTP
- Services handle business logic
- Repositories handle data access
- Usecases handle pure business rules

### 2. Dependency Injection
- Never use `new` inside a service
- Always inject dependencies
- Easy to test and mock

### 3. Type Safety
- Use interfaces for contracts
- Zod for runtime validation
- No `any` types
- BigNumber for precision calculations

### 4. Error Handling
- Domain-specific error codes
- Error chaining with VError
- Consistent error responses
- Proper logging context

### 5. Testing Structure
- Spec files colocated with implementation
- `.test.ts` naming convention
- Repository repositories return domain models, never raw responses

### 6. Configuration Management
- Environment variables via config files
- Token whitelists as configuration
- Chain configurations per environment

---

## 12. Smart Contract Interaction Flow

For direct smart contract calls (not shown in detail but implied):

```
┌──────────────────┐
│   Frontend/SDK   │  React + Vite + TypeScript
└────────┬─────────┘
         │
         │ (1) Call contract method
         ↓
┌──────────────────┐
│   UseCase Layer  │  Business logic + validation
│  (e.g., Order    │  - Check user permissions
│   Creation)      │  - Validate parameters
└────────┬─────────┘  - Prepare transaction
         │
         │ (2) Execute transaction
         ↓
┌──────────────────┐
│  Contract Client │  viem/ethers wrapper
│  (Repository)    │  - Build transaction
└────────┬─────────┘  - Send to blockchain
         │
         │ (3) Wait for confirmation
         ↓
┌──────────────────┐
│   Blockchain     │  On-chain state
│   (Smart        │
│   Contract)      │
└──────────────────┘
```

---

## 13. Comparison: Three Repos

| Aspect | Alphatrace | Starbase | Rabbitswap |
|--------|-----------|----------|-----------|
| **Primary Domain** | Trading Analytics | DeFi Yield | DEX Aggregation |
| **Data Source** | External APIs | On-chain + DB | DEX APIs |
| **Key UseCase** | SolanaUseCase | PriceUsecase | SwapRouter |
| **Repository Type** | API Repositories | DB + API | API Gateway |
| **Authentication** | JWT Tokens | No auth | No auth |
| **Caching** | API responses | Price cache | Route caching |

---

## 14. Recommended Patterns for LAAC Implementation

Based on this analysis, here's how to structure the liquidity aggregator:

```
packages/
  core/
    entity/
      - Strategy (interface)
      - Vault (interface)
      - OraclePrice (interface)
    repository/
      - StrategyRepository (abstract)
      - VaultRepository (MongoDB)
      - OraclePriceRepository (cache)
    usecase/
      - DepositUseCase
      - WithdrawUseCase
      - RebalanceUseCase
  
  contracts-client/
    client/
      - VaultClient (viem/ethers wrapper)
    router/
      - DepositRouter
      - WithdrawRouter
    
  oracle-service/
    - PriceUseCase (fetches + validates prices)
    - ProtocolRepository (Aave, Compound, etc.)

apps/
  api/
    controllers/
      - VaultController
      - StrategyController
    services/
      - VaultService
      - StrategyService
    routes/
      - vault.routes.ts
      - strategy.routes.ts
  
  oracle/
    - PriceAggregator
    - ProtocolInteraction
```

---

## Conclusion

The Proxify architecture demonstrates **production-grade patterns** for building scalable TypeScript services:

1. **Clear separation of concerns** with 4-5 distinct layers
2. **Type-safe API integration** using ts-rest contracts
3. **Dependency injection** for testability
4. **Repository pattern** to abstract data sources
5. **UseCase pattern** for pure business logic
6. **Consistent error handling** with domain-specific codes
7. **Monorepo structure** with shared packages
8. **Reusable services** composable at multiple levels

This approach is ideal for **LAAC** because:
- Oracle pricing logic can be isolated in a UseCase
- Vault operations can be in Services
- Contract interactions can be abstracted via Repositories
- Multiple frontend/backend consumers can use the same service layer
