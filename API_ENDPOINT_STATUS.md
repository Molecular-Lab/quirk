# API Endpoint Implementation Status

Generated: 2025-11-24

## Summary

| Flow | Endpoint | Frontend | Backend Contract | Backend Router | Backend Service | Status |
|------|----------|----------|------------------|----------------|-----------------|--------|
| FLOW 1 | POST /clients | ✅ | ✅ | ✅ | ✅ | **FIXED** - Added privyWalletAddress to DTO |
| FLOW 2 | POST /products/:productId/strategies | ✅ | ❌ | ❌ | ❌ | **MISSING** - Needs implementation |
| FLOW 3 | POST /users | ✅ | ✅ | ✅ | ✅ | **IMPLEMENTED** |
| FLOW 4 | POST /deposits | ✅ | ✅ | ✅ | ✅ | **IMPLEMENTED** |
| FLOW 5 | GET /users/:userId/balance | ✅ | ⚠️ | ⚠️ | ⚠️ | **NEEDS VERIFICATION** |

---

## FLOW 1: Client Registration (Product Owner)
**Endpoint**: `POST /api/v1/clients`

### ✅ STATUS: FIXED

**Frontend Call** (`apps/whitelabel-web/src/api/b2bClient.ts:44`):
```typescript
async registerClient(data: {
  companyName: string
  businessType: string
  walletType: "MANAGED" | "USER_OWNED"
  privyOrganizationId: string
  privyWalletAddress: string  // ✅ Now included
  privyEmail?: string          // ✅ Now included
  description?: string
  websiteUrl?: string
})
```

**Backend Contract** (`packages/b2b-api-core/dto/client.ts:11`):
```typescript
export const CreateClientDto = z.object({
  companyName: z.string().min(1),
  businessType: z.string(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  walletType: z.enum(["MANAGED", "USER_OWNED"]),
  privyOrganizationId: z.string(),
  privyWalletAddress: z.string().min(1),  // ✅ ADDED
  privyEmail: z.string().email().optional().nullable(), // ✅ ADDED
});
```

**Backend Router** (`apps/b2b-api/src/router/client.router.ts:192`):
```typescript
if (!body.privyWalletAddress) {
  return { status: 400, body: { error: "privyWalletAddress is required..." } };
}
```

**Backend Service** (`apps/b2b-api/src/service/client.service.ts`):
```typescript
async createClient(data: CreateClientInternalDto) {
  // Calls B2BClientUseCase.createClient()
  // Which calls PrivyAccountRepository.getOrCreate()
}
```

**✅ Action Required**: Rebuild backend
```bash
pnpm build --filter=@proxify/b2b-api-core
pnpm build --filter=@proxify/b2b-api-service
```

---

## FLOW 2: Configure Vault Strategies
**Endpoint**: `POST /api/v1/products/:productId/strategies`

### ❌ STATUS: MISSING - NOT IMPLEMENTED

**Frontend Call** (`apps/whitelabel-web/src/api/b2bClient.ts:95`):
```typescript
async configureStrategies(
  productId: string,
  data: {
    chain: string
    token_address: string
    strategies: { category: string; target: number }[]
  }
) {
  const response = await this.axios.post<unknown>(
    `${this.baseURL}/api/v1/products/${productId}/strategies`,
    data
  )
  return response.data
}
```

**Backend Contract**: ❌ **DOES NOT EXIST**
- No contract in `packages/b2b-api-core/contracts/`
- No DTO defined

**Backend Router**: ❌ **DOES NOT EXIST**
- No router in `apps/b2b-api/src/router/`

**Backend Service**: ❌ **DOES NOT EXIST**
- No service in `apps/b2b-api/src/service/`

**⚠️ Action Required**: 
1. Create contract and DTO for strategy configuration
2. Create service layer
3. Create router
4. Register in main router

**Suggested Implementation**:

### 1. Create DTO (`packages/b2b-api-core/dto/strategy.ts`):
```typescript
import { z } from "zod";

export const StrategyDto = z.object({
  category: z.enum(["lending", "lp", "staking"]),
  target: z.number().min(0).max(100),
});

export const ConfigureStrategiesDto = z.object({
  chain: z.string(),
  tokenAddress: z.string(),
  strategies: z.array(StrategyDto),
});

export const StrategiesResponseDto = z.object({
  productId: z.string(),
  vaultId: z.string(),
  chain: z.string(),
  tokenAddress: z.string(),
  strategies: z.array(StrategyDto),
  totalAllocation: z.number(),
});
```

### 2. Create Contract (`packages/b2b-api-core/contracts/strategy.ts`):
```typescript
import { initContract } from "@ts-rest/core";
import { ConfigureStrategiesDto, StrategiesResponseDto, ErrorResponseDto } from "../dto";

const c = initContract();

export const strategyContract = c.router({
  configure: {
    method: "POST",
    path: "/products/:productId/strategies",
    responses: {
      200: StrategiesResponseDto,
      400: ErrorResponseDto,
    },
    body: ConfigureStrategiesDto,
    summary: "Configure vault allocation strategies for a product",
  },
});
```

### 3. Create Service (`apps/b2b-api/src/service/strategy.service.ts`):
```typescript
export class StrategyService {
  async configureStrategies(productId: string, data: ConfigureStrategiesDto) {
    // 1. Validate product exists (get client by productId)
    // 2. Validate strategies sum to 100%
    // 3. Get or create vault for chain + tokenAddress
    // 4. Store strategy configuration in database
    // 5. Return configuration
  }
}
```

### 4. Create Router (`apps/b2b-api/src/router/strategy.router.ts`):
```typescript
export const createStrategyRouter = (s, strategyService) => {
  return s.router(b2bContract.strategy, {
    configure: async ({ params, body }) => {
      // Implementation
    },
  });
};
```

---

## FLOW 3: Create End User
**Endpoint**: `POST /api/v1/users`

### ✅ STATUS: IMPLEMENTED

**Frontend Call** (`apps/whitelabel-web/src/api/b2bClient.ts:107`):
```typescript
async createUser(data: { 
  user_id: string
  user_type: string 
}) {
  const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/users`, data)
  return response.data
}
```

**Backend Contract** (`packages/b2b-api-core/contracts/user.ts:14`):
```typescript
const CreateUserSchema = z.object({
  clientId: z.string(),
  clientUserId: z.string(),
  email: z.string().optional(),
  walletAddress: z.string().optional(),
});
```

**⚠️ MISMATCH**: Frontend sends `user_id` and `user_type`, but contract expects `clientId` and `clientUserId`.

**Backend Router** (`apps/b2b-api/src/router/user.router.ts:17`):
```typescript
getOrCreate: async ({ body }) => {
  const user = await userService.getOrCreateUser({
    clientId: body.clientId,
    userId: body.clientUserId,
    userType: "individual",
    userWalletAddress: body.walletAddress,
  });
}
```

**⚠️ Action Required**: 
- Frontend needs to send `clientId` (product ID) and `clientUserId` instead of `user_id`
- OR update backend contract to accept frontend format

---

## FLOW 4: Initiate Deposit (On-Ramp)
**Endpoint**: `POST /api/v1/deposits`

### ✅ STATUS: IMPLEMENTED

**Frontend Call** (`apps/whitelabel-web/src/api/b2bClient.ts:119`):
```typescript
async createDeposit(data: {
  user_id: string
  amount: string
  currency: string
  chain: string
  token: string
  payment_method: string
}) {
  const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/deposits`, data)
  return response.data
}
```

**Backend Contract** (`packages/b2b-api-core/contracts/deposit.ts:13`):
```typescript
const CreateDepositSchema = z.object({
  clientId: z.string(),
  userId: z.string(),
  vaultId: z.string(),
  amount: z.string(),
  transactionHash: z.string().optional(),
});
```

**⚠️ MISMATCH**: Frontend sends different fields than contract expects.

**Backend Router** (`apps/b2b-api/src/router/deposit.router.ts:16`):
```typescript
create: async ({ body }) => {
  const [chain, tokenAddress] = body.vaultId.split("-");
  
  const deposit = await depositService.createDeposit({
    clientId: body.clientId,
    userId: body.userId,
    depositType: "external",
    fiatAmount: body.amount,
    fiatCurrency: "USD",
    cryptoCurrency: "USDC",
    gatewayProvider: body.transactionHash,
  });
}
```

**⚠️ Action Required**:
- Frontend needs to send `clientId`, `userId`, and `vaultId`
- OR update backend contract to match frontend format

---

## FLOW 5: Get User Balance
**Endpoint**: `GET /api/v1/users/:userId/balance`

### ⚠️ STATUS: NEEDS VERIFICATION

**Frontend Call** (`apps/whitelabel-web/src/api/b2bClient.ts:112`):
```typescript
async getUserBalance(userId: string, params?: { chain?: string; token?: string }) {
  const response = await this.axios.get<unknown>(
    `${this.baseURL}/api/v1/users/${userId}/balance`,
    { params }
  )
  return response.data
}
```

**Backend Contract**: ❌ **ENDPOINT DOES NOT EXIST**

The contract has `GET /users/:userId/portfolio` instead:
```typescript
getPortfolio: {
  method: "GET",
  path: "/users/:userId/portfolio",
  responses: {
    200: UserPortfolioSchema,
    404: z.object({ error: z.string() }),
  },
}
```

**⚠️ Action Required**:
- Frontend should call `/users/:userId/portfolio` instead of `/users/:userId/balance`
- OR add balance endpoint to backend

---

## Rebuild Checklist

### Required Actions:

1. **✅ FLOW 1 - Client Registration**
   - [x] Fix CreateClientDto schema (DONE)
   - [ ] Rebuild @proxify/b2b-api-core
   - [ ] Rebuild @proxify/b2b-api-service
   - [ ] Restart backend server
   - [ ] Test client registration

2. **❌ FLOW 2 - Strategy Configuration**
   - [ ] Create strategy DTO
   - [ ] Create strategy contract
   - [ ] Create strategy service
   - [ ] Create strategy router
   - [ ] Register in main router
   - [ ] Rebuild and test

3. **⚠️ FLOW 3 - Create End User**
   - [ ] Fix frontend to send `clientId` and `clientUserId`
   - [ ] OR update backend contract to match frontend
   - [ ] Test user creation

4. **⚠️ FLOW 4 - Deposit**
   - [ ] Fix frontend to send `clientId`, `userId`, `vaultId`
   - [ ] OR update backend contract
   - [ ] Test deposit creation

5. **⚠️ FLOW 5 - User Balance**
   - [ ] Update frontend to call `/portfolio` endpoint
   - [ ] OR implement `/balance` endpoint
   - [ ] Test balance retrieval

---

## Database Schema Status

### ✅ privy_accounts Table
- [x] Migration applied
- [x] Repository implemented
- [x] Used in client registration

### ✅ client_organizations Table
- [x] Migration applied
- [x] FK to privy_accounts
- [x] Repository implemented

### ⚠️ vault_strategies Table
- [ ] **MISSING** - Needs migration and table for storing strategy configuration

---

## Next Steps

1. **Immediate** (Fix existing):
   ```bash
   cd /Users/wtshai/Work/Protocolcamp/proxify
   pnpm build --filter=@proxify/b2b-api-core
   pnpm build --filter=@proxify/b2b-api-service
   cd apps/b2b-api && pnpm dev
   ```

2. **High Priority** (Implement missing):
   - Implement strategy configuration endpoint (FLOW 2)
   - Fix field name mismatches (FLOW 3, 4, 5)

3. **Testing**:
   - Test complete flow after fixes
   - Verify all endpoints work end-to-end
