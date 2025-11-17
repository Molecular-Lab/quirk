# Database Schema - Usage Examples

## Schema Overview

The refactored schema properly handles **multi-chain**, **multi-token**, **multi-protocol** allocations.

---

## Key Design Principles

### 1. **Supported DeFi Protocols** (Reference Table)
Static mapping of protocol addresses per chain:

```json
// Example: AAVE on Base
{
  "id": "uuid-1",
  "name": "AAVE",
  "chain": "base",
  "address_book": {
    "pool": "0x...",
    "wrapped_usdc": "0x...",
    "wrapped_usdt": "0x...",
    "reward_distributor": "0x..."
  },
  "category": "Lending",
  "risk_level": "low"
}

// Example: Curve on Ethereum
{
  "id": "uuid-2",
  "name": "Curve",
  "chain": "ethereum",
  "address_book": {
    "pool": "0x...",
    "router": "0x...",
    "usdc_pool": "0x..."
  },
  "category": "LP",
  "risk_level": "medium"
}
```

---

### 2. **Client Vaults** (Per Client, Per Chain, Per Token)

Each client can have multiple vaults for different chains and tokens:

```
Client A:
  ├─ Vault 1: Base + USDC (index: 1.05, total_value: 100,000 USDC)
  ├─ Vault 2: Base + USDT (index: 1.03, total_value: 50,000 USDT)
  ├─ Vault 3: Ethereum + USDC (index: 1.08, total_value: 200,000 USDC)
  └─ Vault 4: Polygon + DAI (index: 1.02, total_value: 75,000 DAI)
```

**Table Structure:**
```sql
client_vaults (
  id: uuid-vault-1,
  client_id: client-a,
  chain: 'base',
  token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', -- USDC on Base
  token_symbol: 'USDC',
  current_index: 1050000000000000000, -- 1.05 scaled
  total_deposits: 100000000000000000000000, -- 100k scaled
  total_value: 105000000000000000000000, -- 105k scaled
  apy_current: 5.25
)
```

---

### 3. **DeFi Allocations** (Per Vault, Per Protocol)

Each vault can allocate to multiple protocols:

```
Vault 1 (Base + USDC):
  ├─ AAVE (50%, 50,000 USDC, APY 4.5%)
  ├─ Compound (30%, 30,000 USDC, APY 3.8%)
  └─ Reserves (20%, 20,000 USDC, APY 0%)

Vault 3 (Ethereum + USDC):
  ├─ AAVE (40%, 80,000 USDC, APY 5.2%)
  ├─ Curve (35%, 70,000 USDC, APY 6.1%)
  ├─ Uniswap V3 (15%, 30,000 USDC, APY 8.5%)
  └─ Reserves (10%, 20,000 USDC, APY 0%)
```

**Table Structure:**
```sql
-- Allocation 1: Vault 1 → AAVE on Base
defi_allocations (
  id: uuid-alloc-1,
  client_id: client-a,
  client_vault_id: uuid-vault-1, -- Links to Base + USDC vault
  protocol_id: uuid-protocol-aave-base, -- AAVE on Base
  strategy: 'DeFi Lending',
  chain: 'base', -- Must match vault
  token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', -- Must match vault
  token_symbol: 'USDC',
  balance: 50000000000000000000000, -- 50k USDC scaled
  percentage_allocation: 50.00,
  apy: 4.50,
  yield_earned: 2250000000000000000000, -- 2,250 USDC scaled
  status: 'active'
)

-- Allocation 2: Vault 1 → Compound on Base
defi_allocations (
  id: uuid-alloc-2,
  client_id: client-a,
  client_vault_id: uuid-vault-1, -- Same vault
  protocol_id: uuid-protocol-compound-base,
  strategy: 'DeFi Lending',
  chain: 'base',
  token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  token_symbol: 'USDC',
  balance: 30000000000000000000000, -- 30k USDC scaled
  percentage_allocation: 30.00,
  apy: 3.80,
  yield_earned: 1140000000000000000000,
  status: 'active'
)
```

---

## Real-World Example: Complete Flow

### Scenario: Client A wants to deploy USDC on Base with custom strategy

**Step 1: Client Organization**
```sql
INSERT INTO client_organizations (
  product_id: 'acme-ecommerce',
  company_name: 'Acme Inc',
  custom_strategy: {
    "DeFi Lending": 70,
    "Placing LP": 20,
    "Reserves": 10
  },
  end_user_yield_portion: 90.00 -- Give 90% to users, keep 10%
)
```

**Step 2: Create Vault (Base + USDC)**
```sql
INSERT INTO client_vaults (
  client_id: client-a,
  chain: 'base',
  token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  token_symbol: 'USDC',
  current_index: 1000000000000000000 -- Start at 1.0
)
```

**Step 3: User Deposits 1,000 USDC**
```sql
-- Create end user
INSERT INTO end_users (
  client_id: client-a,
  user_id: 'user-123',
  user_type: 'custodial'
)

-- Create user vault
INSERT INTO end_user_vaults (
  end_user_id: user-123,
  client_id: client-a,
  chain: 'base',
  token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  token_symbol: 'USDC',
  balance: 1000000000000000000000, -- 1,000 USDC scaled
  entry_index: 1000000000000000000 -- Current index at deposit
)
```

**Step 4: Deploy to DeFi (Following Custom Strategy)**
```sql
-- 70% to AAVE (DeFi Lending)
INSERT INTO defi_allocations (
  client_vault_id: vault-base-usdc,
  protocol_id: aave-base,
  strategy: 'DeFi Lending',
  balance: 700000000000000000000, -- 700 USDC
  percentage_allocation: 70.00
)

-- 20% to Curve (Placing LP)
INSERT INTO defi_allocations (
  client_vault_id: vault-base-usdc,
  protocol_id: curve-base,
  strategy: 'Placing LP',
  balance: 200000000000000000000, -- 200 USDC
  percentage_allocation: 20.00
)

-- 10% Reserves (no allocation)
```

**Step 5: Yield Accrues (Cron Job Every 15 min)**
```sql
-- AAVE earns 5% APY → +35 USDC
-- Curve earns 8% APY → +16 USDC
-- Total yield: 51 USDC

-- Update allocations
UPDATE defi_allocations 
SET yield_earned = 35000000000000000000
WHERE id = alloc-aave;

UPDATE defi_allocations 
SET yield_earned = 16000000000000000000
WHERE id = alloc-curve;

-- Update vault index
UPDATE client_vaults
SET current_index = 1051000000000000000, -- 1.051 (5.1% growth)
    total_yield_earned = 51000000000000000000
WHERE id = vault-base-usdc;
```

**Step 6: User Checks Balance**
```sql
-- Query user vault
SELECT balance, entry_index FROM end_user_vaults 
WHERE user_id = 'user-123' AND chain = 'base';
-- balance: 1000000000000000000000
-- entry_index: 1000000000000000000

-- Query current index
SELECT current_index FROM client_vaults
WHERE id = vault-base-usdc;
-- current_index: 1051000000000000000

-- Calculate actual value
actual_value = (balance × current_index) / entry_index
            = (1000 × 1.051) / 1.0
            = 1,051 USDC ✅
```

---

## Query Examples

### Get all allocations for a specific vault
```sql
SELECT 
  da.*,
  sdp.name as protocol_name,
  sdp.category,
  sdp.address_book
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_vault_id = 'vault-base-usdc'
  AND da.status = 'active';
```

### Get total deployed per chain
```sql
SELECT 
  chain,
  token_symbol,
  SUM(balance) as total_deployed,
  AVG(apy) as avg_apy
FROM defi_allocations
WHERE client_id = 'client-a' AND status = 'active'
GROUP BY chain, token_symbol;
```

### Get protocol addresses for deployment
```sql
SELECT address_book->>'pool' as pool_address
FROM supported_defi_protocols
WHERE name = 'AAVE' AND chain = 'base';
```

---

## Benefits of This Design

✅ **Multi-chain support**: Each vault is specific to one chain  
✅ **Multi-token support**: Each vault is specific to one token  
✅ **Multi-protocol**: Each vault can allocate to multiple protocols  
✅ **Proper foreign keys**: `client_vault_id` ensures allocation matches vault's chain + token  
✅ **Centralized protocol config**: `address_book` JSONB stores all contract addresses  
✅ **Easy rebalancing**: Update `percentage_allocation` and redeploy  
✅ **Accurate yield tracking**: Index-based accounting per vault  

---

## Constraints & Validation

```sql
-- Ensure allocation chain/token matches vault
ALTER TABLE defi_allocations
ADD CONSTRAINT check_allocation_matches_vault
CHECK (
  (chain, token_address) = (
    SELECT chain, token_address 
    FROM client_vaults 
    WHERE id = client_vault_id
  )
);

-- Ensure protocol exists for the chain
ALTER TABLE defi_allocations
ADD CONSTRAINT check_protocol_chain
CHECK (
  EXISTS (
    SELECT 1 FROM supported_defi_protocols
    WHERE id = protocol_id AND chain = defi_allocations.chain
  )
);
```
