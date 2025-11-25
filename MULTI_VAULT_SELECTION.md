# Multi-Chain Unified Token Vault Architecture

## Overview
Product owners select which **token vaults** to create (USDC, USDT, or both). Each token vault is **unified across ALL supported chains**, allowing users to deposit/withdraw from any blockchain network.

## Key Concept: Unified Token Vaults

**IMPORTANT:** Vaults are **TOKEN-CENTRIC**, not chain-centric.

- **One "USDC Vault"** = USDC support across ALL 5 chains (Base, Ethereum, Polygon, Optimism, Arbitrum)
- **One "USDT Vault"** = USDT support across ALL 5 chains

When a user deposits USDC from Base, it goes into their USDC balance. If they later deposit USDC from Ethereum, it adds to the **same USDC balance**. This is what makes the token "unified" - same token, any chain.

## User Flow (FLOW 1: Client Registration)

### Frontend Selection
In the API Testing Page (`apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`):

**Vault Selection** (lines 109-126)
- **USDC only** → Creates 5 vaults (one per chain, all USDC)
- **USDT only** → Creates 5 vaults (one per chain, all USDT)  
- **Both USDC and USDT** (default) → Creates 10 vaults (5 chains × 2 tokens)

### Backend Processing
In the client usecase (`packages/core/usecase/b2b/client.usecase.ts`):

**Supported Chains** (line 156)
```typescript
const ALL_CHAINS = ['8453', '1', '137', '10', '42161'];
// Base, Ethereum, Polygon, Optimism, Arbitrum
```

**Token Address Mapping** (lines 129-154)
```typescript
const TOKEN_ADDRESSES: Record<string, { USDC: string; USDT: string }> = {
  '8453': { // Base
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
  '1': { // Ethereum
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  '137': { // Polygon
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  '10': { // Optimism
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
  '42161': { // Arbitrum
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
};
```

**Vault Creation Logic** (lines 161-193)
```typescript
// Create USDC vaults across ALL chains if requested
if (vaultsToCreate === 'usdc' || vaultsToCreate === 'both') {
  for (const chain of ALL_CHAINS) {
    const usdcVault = await this.getOrCreateVault({
      clientId: client.id,
      chain,
      tokenAddress: TOKEN_ADDRESSES[chain].USDC,
      tokenSymbol: 'USDC',
    });
    createdVaults.push({
      id: usdcVault.id,
      chain,
      tokenSymbol: 'USDC',
      tokenAddress: TOKEN_ADDRESSES[chain].USDC,
    });
  }
}

// Create USDT vaults across ALL chains if requested
if (vaultsToCreate === 'usdt' || vaultsToCreate === 'both') {
  for (const chain of ALL_CHAINS) {
    const usdtVault = await this.getOrCreateVault({
      clientId: client.id,
      chain,
      tokenAddress: TOKEN_ADDRESSES[chain].USDT,
      tokenSymbol: 'USDT',
    });
    createdVaults.push({
      id: usdtVault.id,
      chain,
      tokenSymbol: 'USDT',
      tokenAddress: TOKEN_ADDRESSES[chain].USDT,
    });
  }
}
```

## Use Cases

### Use Case 1: USDC Only
**User Selection:** USDC only

**Result:** 5 vaults created
| Chain | Token | Address |
|-------|-------|---------|
| Base (8453) | USDC | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |
| Ethereum (1) | USDC | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |
| Polygon (137) | USDC | 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 |
| Optimism (10) | USDC | 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85 |
| Arbitrum (42161) | USDC | 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 |

**User Experience:**
- User can deposit USDC from ANY of these 5 chains
- All deposits contribute to same unified USDC balance
- User can withdraw USDC to ANY chain (cross-chain flexibility)

### Use Case 2: USDT Only
**User Selection:** USDT only

**Result:** 5 vaults created
| Chain | Token | Address |
|-------|-------|---------|
| Base (8453) | USDT | 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2 |
| Ethereum (1) | USDT | 0xdAC17F958D2ee523a2206206994597C13D831ec7 |
| Polygon (137) | USDT | 0xc2132D05D31c914a87C6611C10748AEb04B58e8F |
| Optimism (10) | USDT | 0x94b008aA00579c1307B0EF2c499aD98a8ce58e58 |
| Arbitrum (42161) | USDT | 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9 |

### Use Case 3: Both USDC and USDT (Default)
**User Selection:** Both USDC and USDT

**Result:** 10 vaults created (5 chains × 2 tokens)

All 5 USDC vaults (from Use Case 1) + All 5 USDT vaults (from Use Case 2)

**User Experience:**
- User can deposit USDC from any chain → unified USDC balance
- User can deposit USDT from any chain → unified USDT balance
- Maximum flexibility for end-users

## Database Schema

### client_vaults table
Each vault stores:
```sql
CREATE TABLE client_vaults (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES client_organizations(id),
  chain TEXT NOT NULL,              -- "8453", "1", "137", etc.
  token_address TEXT NOT NULL,       -- Contract address
  token_symbol TEXT NOT NULL,        -- "USDC" or "USDT"
  strategies JSONB,                  -- DeFi allocation strategies
  total_shares NUMERIC DEFAULT 0,    -- Total shares minted
  current_index NUMERIC DEFAULT 1e18, -- Share price index
  pending_deposit_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, chain, token_address)
);
```

## API Contract

### Request Body
```typescript
POST /api/v1/clients

{
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "MANAGED",
  "vaultsToCreate": "both",           // "usdc" | "usdt" | "both"
  "privyOrganizationId": "privy_org_123",
  "privyWalletAddress": "0x...",
  "privyEmail": "user@example.com"
}
```

**Key Change:** No `chain` parameter! Vaults are created on ALL chains automatically.

### Response Body
```typescript
{
  "id": "uuid...",
  "productId": "prod_uuid...",
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "custodial",
  "privyOrganizationId": "privy_org_123",
  "isActive": true,
  "isSandbox": false,
  "createdAt": "2025-11-24T10:00:00Z",
  "updatedAt": "2025-11-24T10:00:00Z",
  "vaults": [
    {
      "id": "vault_1",
      "chain": "8453",
      "tokenSymbol": "USDC",
      "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    },
    {
      "id": "vault_2",
      "chain": "1",
      "tokenSymbol": "USDC",
      "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    // ... 8 more vaults (3 more USDC chains + 5 USDT chains)
  ]
}
```

## Benefits

1. **Unified User Experience**: Users see one USDC balance, regardless of which chain they deposited from
2. **Cross-Chain Flexibility**: Deposit from Polygon (cheap fees), withdraw to Ethereum (more liquidity)
3. **Simplified Product Logic**: Product owners think in terms of "which tokens to support", not "which chains"
4. **Future-Proof**: Easy to add new chains - just update TOKEN_ADDRESSES and ALL_CHAINS arrays
5. **Cost Optimization**: Users can choose cheapest chain for deposits (e.g., Polygon) but still access same balance
6. **Multi-Chain Yield**: DeFi strategies can deploy across all chains, maximizing returns

## Mental Model Comparison

### ❌ Old (Wrong) Mental Model
- Product owner: "I want to support USDC on Base"
- System: Creates 1 vault (Base-USDC)
- Problem: Users on Ethereum can't deposit USDC

### ✅ New (Correct) Mental Model  
- Product owner: "I want to support USDC"
- System: Creates 5 vaults (Base-USDC, Eth-USDC, Polygon-USDC, Optimism-USDC, Arbitrum-USDC)
- Benefit: Users on ANY chain can deposit USDC into the same unified balance

## Example User Journey

1. **Product Owner (GrabPay):**
   - Registers organization
   - Selects "Both USDC and USDT"
   - System creates 10 vaults (5 chains × 2 tokens)

2. **End User (Alice):**
   - Has wallet on Base with 100 USDC
   - Deposits 100 USDC from Base → Goes to Base-USDC vault
   - Balance shows: 100 USDC (unified across all chains)

3. **End User (Alice) - Later:**
   - Receives 50 USDC on Polygon from a friend
   - Deposits 50 USDC from Polygon → Goes to Polygon-USDC vault
   - Balance now shows: 150 USDC (still unified!)

4. **End User (Alice) - Withdrawal:**
   - Wants to buy NFT on Ethereum
   - Withdraws 150 USDC to Ethereum
   - System can pull from any chain vault (Base + Polygon combined, or just one)

## Future Enhancements

1. **Smart Chain Selection**: Auto-route withdrawals to cheapest chain for gas
2. **Cross-Chain Rebalancing**: Automatically move funds to chains with better yield
3. **More Tokens**: Add DAI, FRAX, other stablecoins with same unified approach
4. **Layer 2s**: Add more L2 chains (zkSync, Starknet, etc.)
5. **Vault Analytics**: Show users which chains they've deposited from
6. **Chain-Specific Yield**: Display APY per chain in vault strategies

## Testing

### Manual Test Flow
1. Go to API Testing Page
2. Select FLOW 1: Client Registration
3. Choose "Both USDC and USDT" (default)
4. Fill in company details
5. Click "Send Request"
6. Verify response shows 10 vaults created
7. Check database:
   ```sql
   SELECT client_id, chain, token_symbol, token_address 
   FROM client_vaults 
   WHERE client_id = '<client_id_from_response>'
   ORDER BY token_symbol, chain;
   ```
8. Should see:
   - 5 USDC rows (chains: 8453, 1, 137, 10, 42161)
   - 5 USDT rows (chains: 8453, 1, 137, 10, 42161)

### Validation Queries
```sql
-- Count vaults per client by token
SELECT 
  client_id, 
  token_symbol,
  COUNT(*) as vault_count,
  array_agg(chain ORDER BY chain::int) as chains
FROM client_vaults
GROUP BY client_id, token_symbol
ORDER BY client_id, token_symbol;

-- Expected result for "both" selection:
-- client_id | token_symbol | vault_count | chains
-- uuid...   | USDC         | 5           | {1,10,137,42161,8453}
-- uuid...   | USDT         | 5           | {1,10,137,42161,8453}

-- Verify token addresses are correct per chain
SELECT 
  chain,
  token_symbol,
  token_address,
  COUNT(*) as vault_count
FROM client_vaults
GROUP BY chain, token_symbol, token_address
ORDER BY chain::int, token_symbol;
```

## Database Impact

### Before (Per Client with "both" selection):
- 2 vaults (1 chain, 2 tokens)

### After (Per Client with "both" selection):
- 10 vaults (5 chains, 2 tokens)

### Storage Impact:
- Each vault row: ~200 bytes (with indexes)
- 10 vaults × 200 bytes = 2KB per client
- 1000 clients = 2MB (negligible)

### Query Performance:
- Indexes on `(client_id, chain, token_address)` ensure fast lookups
- Deposits/withdrawals query by `(client_id, chain, token_address)` → O(1) with index
- Balance view aggregates all vaults for a client → Scans max 10 rows (fast)

## Related Documentation
- [CHAIN_STANDARDS.md](./CHAIN_STANDARDS.md) - Chain IDs and token addresses
- [INDEX_VAULT_SYSTEM.md](./INDEX_VAULT_SYSTEM.md) - Vault accounting system
- [VAULT_STRATEGIES_JSONB_MIGRATION.md](./VAULT_STRATEGIES_JSONB_MIGRATION.md) - Strategy configuration
