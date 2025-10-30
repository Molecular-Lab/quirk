# Client Fee Configuration Examples

## Fee Structure (Basis Points)

**1 basis point (bps) = 0.01% = 0.0001**

```
100 bps = 1%
200 bps = 2%
500 bps = 5%
1000 bps = 10%
2000 bps = 20%
5000 bps = 50%
10000 bps = 100%
```

## Business Deal Examples

### Example 1: Standard Partner (Bitkub)
```solidity
// Gross yield: 4.0%
// Bitkub keeps: 20% (2000 bps) = 0.8%
// Protocol keeps: 0.5% (50 bps)
// User gets: 2.7%

registerClient(
    keccak256("bitkub"),
    0x..., // Bitkub's fee address
    "Bitkub",
    2000  // 20%
);
```

### Example 2: Premium Partner (Lower Fee)
```solidity
// Gross yield: 4.0%
// Partner keeps: 10% (1000 bps) = 0.4%
// Protocol keeps: 0.5% (50 bps)
// User gets: 3.1%

registerClient(
    keccak256("premium_partner"),
    0x...,
    "Premium Partner",
    1000  // 10%
);
```

### Example 3: White Label (High Fee)
```solidity
// Gross yield: 4.0%
// White label keeps: 50% (5000 bps) = 2.0%
// Protocol keeps: 0.5% (50 bps)
// User gets: 1.5%

registerClient(
    keccak256("whitelabel_co"),
    0x...,
    "WhiteLabel Co",
    5000  // 50%
);
```

### Example 4: Strategic Partner (No Fee)
```solidity
// Gross yield: 4.0%
// Partner keeps: 0% (0 bps)
// Protocol keeps: 0.5% (50 bps)
// User gets: 3.5%

registerClient(
    keccak256("strategic_partner"),
    0x...,
    "Strategic Partner",
    0  // 0% - strategic deal
);
```

### Example 5: Testing/Internal (Minimal Fee)
```solidity
// For internal testing
registerClient(
    keccak256("internal_test"),
    0x...,
    "Internal Test",
    50  // 0.5%
);
```

## Fee Update Scenarios

### Scenario 1: Renegotiating Partnership
```solidity
// Original deal: 20%
registerClient(clientId, address, "Client", 2000);

// After 6 months, renegotiate down to 15%
updateClientFee(clientId, 1500);
```

### Scenario 2: Promotional Period
```solidity
// Normal: 20%
registerClient(clientId, address, "Client", 2000);

// Promo: reduce to 5% for 3 months
updateClientFee(clientId, 500);

// After promo: restore to 20%
updateClientFee(clientId, 2000);
```

## Revenue Share Math

Given gross yield = 4.0% and client fee = 2000 bps (20%):

```
User deposits: $1,000,000
Gross yield earned (1 year): $40,000

Revenue distribution:
├─ Client fee (20% of $40k): $8,000
├─ Protocol fee (50 bps of TVL): $5,000
└─ User receives: $27,000 (2.7% APY)

Client's effective rate: 0.8% on TVL
Protocol's effective rate: 0.5% on TVL
User's net APY: 2.7%
```

## Privacy & Access Control

### Who Can View Fees?

✅ **Can view `getClientFee(clientId)`:**
- Admin (DEFAULT_ADMIN_ROLE)
- Oracle (ORACLE_ROLE)
- The client itself (clients[clientId].clientAddress)

❌ **Cannot view:**
- Other clients
- End users
- Public callers

### Who Can Update Fees?

✅ **Can call `updateClientFee(clientId, newFee)`:**
- Admin only (DEFAULT_ADMIN_ROLE)

This keeps business deals confidential between protocol and partners.

## Integration Examples

### TypeScript/API Usage

```typescript
// Register new client with custom fee
await clientRegistry.registerClient(
  ethers.utils.id("new_partner"), // clientId
  "0x...",                         // fee address
  "New Partner",                   // name
  2000                             // 20% fee
);

// Update fee after renegotiation
await clientRegistry.updateClientFee(
  ethers.utils.id("new_partner"),
  1500  // reduce to 15%
);

// Query fee (only if authorized)
const feeBps = await clientRegistry.getClientFee(
  ethers.utils.id("new_partner")
);
console.log(`Client fee: ${feeBps / 100}%`);
```

### Deployment Script Example

```typescript
// scripts/register-clients.ts
const clients = [
  {
    id: "bitkub",
    address: process.env.BITKUB_FEE_ADDRESS,
    name: "Bitkub",
    feeBps: 2000  // 20% - from business agreement
  },
  {
    id: "smbc",
    address: process.env.SMBC_FEE_ADDRESS,
    name: "SMBC Nikko",
    feeBps: 1500  // 15% - better terms
  },
  {
    id: "internal_test",
    address: process.env.TEST_ADDRESS,
    name: "Internal Testing",
    feeBps: 0     // 0% - no fee for testing
  }
];

for (const client of clients) {
  await clientRegistry.registerClient(
    ethers.utils.id(client.id),
    client.address,
    client.name,
    client.feeBps
  );
  console.log(`✅ Registered ${client.name} with ${client.feeBps/100}% fee`);
}
```

## Best Practices

1. **Document all fee agreements** in your business contracts before setting on-chain
2. **Use consistent naming** for clientIds (e.g., lowercase, underscore-separated)
3. **Validate fee calculations** off-chain before committing
4. **Monitor fee updates** via ClientFeeUpdated events
5. **Keep fees private** - only expose to authorized parties
6. **Cap at 50%** unless absolutely necessary (user experience)
7. **Review periodically** - market rates change

## Event Monitoring

```typescript
// Listen for fee changes
clientRegistry.on("ClientFeeUpdated", (clientId, oldFee, newFee) => {
  console.log(`Client ${clientId} fee changed: ${oldFee} → ${newFee} bps`);
  // Update off-chain systems, notify stakeholders, etc.
});
```
