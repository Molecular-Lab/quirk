# Testing Guide for @proxify/yield-engine

## Overview

The yield-engine package has two types of tests:
1. **Unit Tests** - Mock RPC calls, fast, always run
2. **Integration Tests** - Real RPC calls to blockchain, slower, run manually

---

## Running Tests

### Unit Tests Only (Default)

```bash
cd packages/yield-engine
pnpm test
```

This runs all tests except those marked with `.skip` (integration tests).

### Integration Tests (Real Blockchain Data)

Integration tests make real RPC calls to fetch live data from AAVE, Compound, and Morpho protocols.

#### Step 1: Set Up RPC Endpoints

Create a `.env` file in `packages/yield-engine`:

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your RPC URLs
ETHEREUM_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
BASE_RPC_URL=https://mainnet.base.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
```

**Free Public RPC Endpoints** (included in `.env.example`):
- Ethereum: `https://eth.llamarpc.com`
- Polygon: `https://polygon-rpc.com`
- Base: `https://mainnet.base.org`
- Arbitrum: `https://arb1.arbitrum.io/rpc`

**Recommended** (for better reliability):
- Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- Infura: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

#### Step 2: Remove `.skip` from Tests

Open `src/protocols/aave/aave.test.ts` and change:

```typescript
it.skip('should fetch real supply APY', async () => {
```

To:

```typescript
it('should fetch real supply APY', async () => {
```

#### Step 3: Run Integration Tests

```bash
# Run all tests (including integration)
pnpm vitest run

# Run specific test
pnpm vitest run -t "should fetch real supply APY"

# Run with watch mode
pnpm vitest --watch
```

---

## Example Output

```bash
$ pnpm vitest run -t "should fetch real supply APY"

✓ AAVE Adapter > should fetch real supply APY from Ethereum 533ms
   ✅ AAVE USDC Supply APY: 4.27%

Test Files  1 passed (1)
Tests  1 passed | 12 skipped (13)
```

---

## Available Integration Tests

### AAVE Protocol

Located in `src/protocols/aave/aave.test.ts`:

1. **`should fetch real supply APY from Ethereum`**
   - Fetches live USDC supply APY from AAVE V3 on Ethereum
   - Verifies APY is a valid percentage (0-100%)
   - Example result: 4.27%

2. **`should fetch user position`** (`.skip`)
   - Fetches user's AAVE position for a wallet address
   - Returns deposited amount, value in USD, current APY
   - Requires: Replace test address with real wallet address

3. **`should fetch metrics for USDC on Ethereum`** (`.skip`)
   - Fetches detailed market metrics for USDC
   - Returns: supplyAPY, borrowAPY, TVL, liquidity
   - Example use: Understanding market conditions

4. **`should fetch protocol metrics`** (`.skip`)
   - Fetches overall AAVE protocol health
   - Returns: total TVL, average APY, health status
   - Slower (queries multiple markets)

### Compound Protocol (Phase 3 - Coming Soon)

Integration tests will be added when Compound adapter is implemented.

### Morpho Protocol (Phase 4 - Coming Soon)

Integration tests will be added when Morpho adapter is implemented.

---

## Troubleshooting

### Test Timeout

If tests timeout (default 30s):

```typescript
it('test name', async () => {
  // ...
}, 60000) // Increase timeout to 60 seconds
```

### RPC Rate Limiting

Free RPC endpoints may rate limit you. Solutions:

1. **Use Alchemy/Infura** - Higher rate limits
2. **Add delays** between tests
3. **Cache results** - Yield-engine already does this (5-min TTL)

### Network Issues

```bash
# Test RPC connectivity manually
curl https://eth.llamarpc.com \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'
```

Should return latest block number.

---

## Writing New Integration Tests

When adding tests for new protocols:

1. **Mark as `.skip` by default**
   ```typescript
   it.skip('should fetch APY from Compound', async () => {
     // Test implementation
   }, 30000)
   ```

2. **Add helpful console output**
   ```typescript
   console.log(`✅ Compound USDC APY: ${apy}%`)
   ```

3. **Use descriptive error messages**
   ```typescript
   expect(apy, `APY should be valid, got: "${apy}"`).toBeGreaterThanOrEqual(0)
   ```

4. **Test realistic scenarios**
   ```typescript
   // Good: Test with actual token that exists
   const apy = await adapter.getSupplyAPY('USDC', 1)

   // Bad: Test with token that doesn't exist
   const apy = await adapter.getSupplyAPY('FAKE_TOKEN', 1)
   ```

---

## CI/CD Integration

For automated testing in CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  env:
    ETHEREUM_RPC_URL: ${{ secrets.ETHEREUM_RPC_URL }}
    POLYGON_RPC_URL: ${{ secrets.POLYGON_RPC_URL }}
  run: |
    pnpm vitest run --reporter=verbose
```

**Important**: Store RPC URLs as GitHub secrets, not in code.

---

## Performance Benchmarks

Expected test durations (with free RPC endpoints):

| Test Type | Duration | Notes |
|-----------|----------|-------|
| Unit tests | < 100ms | No network calls |
| Single protocol APY | 300-600ms | One RPC call |
| User position | 400-800ms | Two RPC calls (reserve + balance) |
| Protocol metrics | 1-3s | Multiple tokens queried |
| All integration tests | 5-10s | Full suite |

---

## Best Practices

1. **Cache results** - Yield-engine auto-caches APY for 5 minutes
2. **Use batch requests** - When querying multiple tokens
3. **Handle failures gracefully** - RPC calls can fail
4. **Test on testnet first** - Before mainnet
5. **Monitor RPC costs** - Some providers charge per request

---

## Next Steps

After Phase 3-4 (Compound, Morpho):

- Add integration tests for all protocols
- Create aggregation tests (compare APYs across protocols)
- Add performance benchmarks
- Set up automated daily health checks

---

**Last Updated**: November 19, 2024
**Status**: AAVE integration tests working ✅
