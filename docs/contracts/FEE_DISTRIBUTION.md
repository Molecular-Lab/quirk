# Fee Distribution Strategy - LAAC System

## Overview

Fee distribution in the LAAC system is intentionally handled **OFF-CHAIN** in the oracle service, not in smart contracts. This approach keeps confidential business deals private and allows flexibility in fee arrangements.

---

## Why Off-Chain Fee Distribution?

### 1. **Business Confidentiality**
- Fee arrangements are private business deals between protocol and clients
- No need to expose fee percentages publicly on-chain
- Competitors can't see your pricing strategy

### 2. **Flexibility**
- Easy to negotiate custom fee splits per client
- Can adjust fees based on:
  - Client AUM (volume discounts)
  - Tenure (loyalty rewards)
  - Strategic partnerships
  - Special promotions

### 3. **Gas Efficiency**
- No complex on-chain fee calculations
- Vault index remains simple (gross yield only)
- Fee splits happen during oracle's distribution process

### 4. **Regulatory Compliance**
- Easier to adapt to different jurisdictions
- Can implement KYC/AML checks before fee distribution
- Can block sanctioned addresses off-chain

---

## Fee Model Example

### Standard Fee Structure

**Gross APY from DeFi protocols: 4.0%**

```
┌─────────────────────────────────────────────┐
│ Gross Yield: 4.0% APY                       │
├─────────────────────────────────────────────┤
│ User gets: 80% = 3.2% APY                   │
│ Protocol + Client share: 20% = 0.8% APY     │
│   ├─ Protocol: 15-20% (depends on tenure)   │
│   └─ Client: 0-5% (depends on tenure)       │
└─────────────────────────────────────────────┘
```

### Time-Based Fee Tier (Example - Configurable Off-Chain)

| Client Tenure | Client Share | Protocol Share | User Gets |
|---------------|--------------|----------------|-----------|
| Day 0         | 0% (0 bps)   | 20% (2000 bps) | 80% (3.2% APY) |
| 6 months      | 2.5% (250 bps) | 17.5% (1750 bps) | 80% (3.2% APY) |
| 1 year        | 5% (500 bps) | 15% (1500 bps) | 80% (3.2% APY) |
| 2+ years      | 5% (500 bps) | 15% (1500 bps) | 80% (3.2% APY) |

**Note:** User always gets 80% regardless of client tenure.

---

## How It Works

### On-Chain (Smart Contracts)

**ClientRegistry.sol:**
```solidity
struct ClientInfo {
    string name;
    address clientAddress;  // Where to send client fees
    bool isActive;
    uint256 registeredAt;   // For tenure calculation (off-chain)
}
```

**LAAC.sol:**
- Tracks **gross yield** via vault index
- No fee deductions in contract
- Users see full value (oracle handles fees during distribution)

### Off-Chain (Oracle Service)

**Oracle's Fee Distribution Process:**

```javascript
// Pseudocode for oracle fee distribution

async function distributeYield(clientId, userId, token) {
  // 1. Get user's gross yield from LAAC contract
  const grossYield = await laac.getAccruedYield(clientId, userId, token);

  // 2. Load client's fee arrangement from database (off-chain config)
  const clientFeeConfig = await db.getClientFeeConfig(clientId);
  // Example: { clientShareBps: 250, protocolShareBps: 1750 }

  // 3. Calculate fee splits
  const totalFeeBps = clientFeeConfig.clientShareBps + clientFeeConfig.protocolShareBps;
  const totalFees = (grossYield * totalFeeBps) / 10000;
  const clientFee = (grossYield * clientFeeConfig.clientShareBps) / 10000;
  const protocolFee = (grossYield * clientFeeConfig.protocolShareBps) / 10000;
  const userNet = grossYield - totalFees;

  // 4. Execute distributions
  // User withdraws their net amount
  await laacController.withdraw(clientId, userId, token, userNet, userAddress);

  // Protocol collects fees periodically (batched)
  await transferFees(protocolFeeAddress, token, protocolFee);

  // Client collects fees (sent to clientRegistry.getClientAddress(clientId))
  const clientFeeAddress = await clientRegistry.getClientAddress(clientId);
  await transferFees(clientFeeAddress, token, clientFee);
}
```

---

## Database Schema for Fee Config (Oracle)

### `client_fee_configs` Table

```sql
CREATE TABLE client_fee_configs (
    client_id BYTEA PRIMARY KEY,
    client_name TEXT NOT NULL,

    -- Fee split configuration
    client_share_bps INT NOT NULL,     -- 0-500 bps (0-5%)
    protocol_share_bps INT NOT NULL,   -- 1500-2000 bps (15-20%)

    -- Fee tier settings
    use_tenure_based_fees BOOLEAN DEFAULT false,
    max_client_share_bps INT DEFAULT 500,
    tenure_days_for_max INT DEFAULT 365,

    -- Special arrangements
    custom_fee_structure JSONB,  -- For complex deals

    -- Audit
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),

    CONSTRAINT valid_fee_split CHECK (
        client_share_bps + protocol_share_bps = 2000  -- Total 20%
    )
);
```

### Example Records

```sql
-- Standard client (new)
INSERT INTO client_fee_configs VALUES (
    '\xabc123...', 'Bitkub',
    0,      -- client_share_bps (0% initially)
    2000,   -- protocol_share_bps (20%)
    true,   -- use_tenure_based_fees
    500,    -- max_client_share_bps (5% after 1 year)
    365     -- tenure_days_for_max
);

-- Premium client (negotiated deal)
INSERT INTO client_fee_configs VALUES (
    '\xdef456...', 'SMBC Nikko',
    500,    -- client_share_bps (5% from day 1)
    1500,   -- protocol_share_bps (15%)
    false,  -- use_tenure_based_fees (fixed rate)
    NULL,
    NULL
);

-- High-volume client (volume discount)
INSERT INTO client_fee_configs VALUES (
    '\x789ghi...', 'Big Exchange',
    750,    -- client_share_bps (7.5% - special deal)
    1250,   -- protocol_share_bps (12.5%)
    false,
    NULL,
    NULL
);
```

---

## Oracle Implementation Example

### Fee Calculation Logic

```typescript
// server/apps/yield-engine/src/fees/calculator.ts

interface ClientFeeConfig {
  clientId: string;
  clientShareBps: number;
  protocolShareBps: number;
  useTenureBasedFees: boolean;
  maxClientShareBps?: number;
  tenureDaysForMax?: number;
  registeredAt: Date;
}

export class FeeCalculator {
  /**
   * Calculate fee splits based on client's configuration
   */
  async calculateFeeSplit(
    clientId: string,
    grossYield: bigint
  ): Promise<{
    userNet: bigint;
    clientFee: bigint;
    protocolFee: bigint;
  }> {
    // 1. Load client config from database
    const config = await this.loadClientConfig(clientId);

    // 2. Calculate effective fee rates
    let clientShareBps = config.clientShareBps;
    let protocolShareBps = config.protocolShareBps;

    if (config.useTenureBasedFees) {
      const tenureDays = this.calculateTenureDays(config.registeredAt);
      clientShareBps = this.calculateTenureBasedFee(
        tenureDays,
        config.maxClientShareBps || 500,
        config.tenureDaysForMax || 365
      );
      protocolShareBps = 2000 - clientShareBps; // Total always 20%
    }

    // 3. Calculate amounts
    const clientFee = (grossYield * BigInt(clientShareBps)) / 10000n;
    const protocolFee = (grossYield * BigInt(protocolShareBps)) / 10000n;
    const userNet = grossYield - clientFee - protocolFee;

    return { userNet, clientFee, protocolFee };
  }

  /**
   * Calculate tenure-based fee tier
   */
  private calculateTenureBasedFee(
    tenureDays: number,
    maxClientShareBps: number,
    tenureDaysForMax: number
  ): number {
    if (tenureDays >= tenureDaysForMax) {
      return maxClientShareBps; // Max tier reached
    }

    // Linear interpolation
    return Math.floor((tenureDays * maxClientShareBps) / tenureDaysForMax);
  }

  /**
   * Calculate days since client registration
   */
  private calculateTenureDays(registeredAt: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - registeredAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Load client fee configuration from database
   */
  private async loadClientConfig(clientId: string): Promise<ClientFeeConfig> {
    // Load from PostgreSQL
    const result = await this.db.query(
      'SELECT * FROM client_fee_configs WHERE client_id = $1',
      [clientId]
    );

    if (!result.rows[0]) {
      throw new Error(`No fee config for client ${clientId}`);
    }

    return result.rows[0];
  }
}
```

---

## API Response Example

### User Balance Query

When user queries their balance via API, oracle returns:

```json
{
  "clientId": "0xabc123...",
  "userId": "0xdef456...",
  "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "balance": {
    "principal": "1000.00",
    "grossYield": "40.00",
    "fees": {
      "total": "8.00",
      "breakdown": {
        "client": "2.50",
        "protocol": "5.50"
      }
    },
    "netYield": "32.00",
    "totalValue": "1032.00"
  },
  "apy": {
    "gross": "4.0%",
    "net": "3.2%"
  }
}
```

**Note:** Fee breakdown is only visible in oracle API responses, not on-chain.

---

## Advantages of This Approach

### ✅ For Protocol Owners
- **Privacy:** Competitors can't see your pricing
- **Flexibility:** Easy to negotiate custom deals
- **Control:** Adjust fees without contract upgrades
- **Simplicity:** Contracts remain minimal and auditable

### ✅ For Clients (B2B Partners)
- **Custom Deals:** Negotiate based on volume/tenure
- **Predictability:** Fee address stored on-chain (immutable)
- **Transparency:** Can verify fees in oracle's response
- **Revenue Share:** Earn passive income from user deposits

### ✅ For End Users
- **Simplicity:** See clean net APY (e.g., "3.2%")
- **No Surprises:** Fees already deducted before display
- **Trust:** Gross yield visible on-chain for verification
- **Consistency:** Always get 80% of gross yield

---

## Security Considerations

### 1. **Client Address Verification**
```solidity
// Client fee address is stored on-chain
address clientFeeAddress = clientRegistry.getClientAddress(clientId);
// Oracle must send fees to this address (auditable)
```

### 2. **Fee Distribution Auditing**
- Log all fee distributions to database
- Monthly reconciliation reports
- Client can verify fees received match expected amounts

### 3. **Oracle Integrity**
- Oracle calculates fees but doesn't control client addresses
- Multi-sig can update oracle if compromised
- Client addresses require admin multi-sig to change

---

## Migration Path

### Phase 1 (Current): Fully Off-Chain
- All fee logic in oracle database
- Maximum flexibility for early deals
- Easy to adjust as market evolves

### Phase 2 (Optional): Hybrid Approach
If transparency becomes important:
```solidity
// Could add optional on-chain fee config
mapping(bytes32 => uint256) public clientFeeShareBps;

// But keep ability to override off-chain for special deals
```

### Phase 3 (Unlikely): Fully On-Chain
Only if required by regulations or DAO governance:
```solidity
// Full transparency via on-chain fee tiers
// Loses flexibility but gains trustlessness
```

---

## Summary

**Key Decision:** Keep fee distribution OFF-CHAIN in oracle service.

**Why:**
1. Business deals are confidential
2. Flexible negotiations per client
3. Simpler smart contracts
4. Gas efficient
5. Easy to update without contract upgrades

**What's On-Chain:**
- Client fee address (where to send fees)
- Client registration timestamp (for tenure calculation if needed)
- Gross yield (via vault index)

**What's Off-Chain:**
- Fee percentages (confidential deals)
- Fee tier logic (flexible business rules)
- Actual fee distribution (oracle handles transfers)

This approach gives you maximum business flexibility while keeping contracts simple and secure. 🎯
