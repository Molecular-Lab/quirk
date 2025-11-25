# B2B API - NEW Proxify Architecture Implementation

This is a **NEW**, clean implementation of the B2B API using the Proxify pattern, matching the architecture in `apps/api`.

## 🏗️ Architecture

### Complete Layer Stack

```
┌─────────────────────────────────────────────────────────────┐
│  1. API Layer (@proxify/b2b-api-core)                        │
│     - DTOs with Zod validation                              │
│     - ts-rest contracts                                     │
│     - Type-safe HTTP client                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Router Layer (src/router/)                              │
│     - ts-rest/express handlers                              │
│     - HTTP request/response mapping                         │
│     - Validation via Zod                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Service Layer (src/service/)                            │
│     - Business logic orchestration                          │
│     - Maps API DTOs ↔ UseCase DTOs                          │
│     - Cross-cutting concerns                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. UseCase Layer (@proxify/core/usecase/b2b/)              │
│     - Domain business rules                                 │
│     - Transaction management                                │
│     - Domain validation                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Repository Layer (@proxify/core/repository/)            │
│     - Data access abstraction                               │
│     - Uses SQLC type-safe queries                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Database Layer (@proxify/sqlcgen)                       │
│     - SQLC generated types & queries                        │
│     - PostgreSQL via postgres package                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
apps/b2b-api-new/
├── src/
│   ├── router/              # ts-rest HTTP handlers
│   │   ├── client.router.ts # Client endpoints
│   │   └── index.ts         # Main router (combines all)
│   │
│   ├── service/             # Business logic layer
│   │   └── client.service.ts
│   │
│   ├── env.ts               # Environment config (Zod validated)
│   ├── logger.ts            # Winston logger
│   └── server.ts            # Express app setup
│
├── package.json
├── tsconfig.json
└── README.md (this file)
```

## ✨ Key Features

### 1. Type-Safe API Contracts (ts-rest)

```typescript
// Define once in @proxify/b2b-api-core
export const clientContract = c.router({
  getById: {
    method: "GET",
    path: "/clients/:id",
    responses: {
      200: ClientDto,      // ← Zod schema
      404: ErrorResponseDto,
    }
  }
});

// Implement in router
export function createClientRouter(s, clientService) {
  return s.router(clientContract, {
    getById: async ({ params }) => {
      const client = await clientService.getClientByProductId(params.id);
      
      if (!client) {
        return { status: 404, body: { error: "Not found" } };
      }
      
      return { status: 200, body: client };  // ← Fully typed!
    }
  });
}
```

### 2. Service Layer Pattern

```typescript
export class ClientService {
  constructor(private readonly clientUseCase: B2BClientUseCase) {}
  
  async getClientByProductId(productId: string) {
    return await this.clientUseCase.getClientByProductId(productId);
  }
}
```

### 3. Dependency Injection

```typescript
// In server.ts
const clientRepository = new ClientRepository(db);
const clientUseCase = new B2BClientUseCase(clientRepository, auditRepository);
const clientService = new ClientService(clientUseCase);

const router = createMainRouter(s, { clientService });
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd apps/b2b-api-new
pnpm install
```

### 2. Configure Environment

Create `.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/proxify
LOG_LEVEL=info
```

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Test API

```bash
curl http://localhost:3001/health

curl http://localhost:3001/api/v1/clients/product/prod_123
```

## 📊 Comparison: Old vs NEW

| Aspect | Old (b2b-api-service) | NEW (b2b-api-new) |
|--------|----------------------|-------------------|
| **Routing** | Express Router | ts-rest/express |
| **Validation** | Manual | Automatic (Zod) |
| **Type Safety** | Partial | 100% |
| **Contracts** | None | Shared with frontend |
| **Service Layer** | Inline in controllers | Separate services/ |
| **Pattern** | Custom | Proxify (industry standard) |

## ✅ Benefits

1. **Type Safety** - End-to-end TypeScript with Zod validation
2. **Shared Contracts** - Frontend & backend use same types from `@proxify/b2b-api-core`
3. **Auto-Complete** - Full IDE support for API methods
4. **Maintainability** - Clear separation of concerns
5. **Testability** - Easy to mock services & UseCases
6. **Documentation** - API contracts serve as documentation

## 📝 Implementation Status

| Router | Status | Endpoints |
|--------|--------|-----------|
| Client | 🟡 Partial | 4/9 (GET endpoints only) |
| Vault | ⏳ TODO | 0/7 |
| User | ⏳ TODO | 0/5 |
| Deposit | ⏳ TODO | 0/6 |
| Withdrawal | ⏳ TODO | 0/6 |
| UserVault | ⏳ TODO | 0/2 |

### Why Only GET Endpoints?

The POST/PUT endpoints (create, addFunds, etc.) require **DTO mapping** between:
- **API DTOs** (simplified, in `@proxify/b2b-api-core/dto`)
- **Internal DTOs** (full, in `@proxify/core/dto/b2b`)

This mapping layer needs to be designed based on your business requirements.

## 🎯 Next Steps

1. **Install Dependencies**: `pnpm install` (will resolve import errors)
2. **DTO Mapping Layer**: Create mappers between API DTOs ↔ Internal DTOs
3. **Implement POST Endpoints**: Add create, update, delete operations
4. **Add Other Routers**: Vault, User, Deposit, Withdrawal, UserVault
5. **Testing**: Add integration tests
6. **Migration**: Gradually migrate from old b2b-api-service

## 🔗 Related Packages

- `@proxify/b2b-api-core` - API contracts, DTOs, client
- `@proxify/core` - UseCases, Repositories, Internal DTOs
- `@proxify/sqlcgen` - SQLC generated queries

## 📚 References

- [ts-rest Documentation](https://ts-rest.com/)
- [Proxify Architecture Pattern](../api/README.md)
- [B2B API Core](../../packages/b2b-api-core/README.md)
