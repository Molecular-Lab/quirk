# Multi-Protocol Batching Guide

> Advanced patterns for executing deposits and withdrawals across multiple DeFi protocols simultaneously

**Status**: 🚧 In Development
**Target Release**: Q1 2025

---

## Table of Contents

- [Overview](#overview)
- [Why Batch Across Protocols?](#why-batch-across-protocols)
- [Execution Modes](#execution-modes)
- [Allocation Strategies](#allocation-strategies)
- [Error Handling](#error-handling)
- [Gas Optimization](#gas-optimization)
- [Advanced Patterns](#advanced-patterns)
- [Production Considerations](#production-considerations)

---

## Overview

**Multi-protocol batching** allows you to split a single deposit/withdrawal operation across multiple DeFi protocols (AAVE, Compound, Morpho) in one transaction flow.

### Benefits

✅ **Diversification**: Spread risk across multiple protocols
✅ **Yield Optimization**: Allocate to highest-yielding protocols
✅ **Gas Efficiency**: Batch operations together
✅ **Automatic Rebalancing**: Adjust allocations over time

### Example

```
User deposits $1000 USDC
  ↓
Split across protocols:
  - 60% ($600) → AAVE V3
  - 30% ($300) → Compound V3
  - 10% ($100) → Morpho
  ↓
Result: Three separate protocol deposits
```

---

## Why Batch Across Protocols?

### Scenario 1: Risk Diversification

**Problem**: Putting all funds in one protocol exposes users to protocol-specific risks.

**Solution**: Split across multiple protocols.

```typescript
// Single protocol (higher risk)
await aaveAdapter.executeDeposit('USDC', 8453, '1000000000', walletClient)

// Multi-protocol (lower risk)
await batchExecutor.executeBatchDeposit({
  allocations: [
    { protocol: 'aave', percentage: 50, amount: '500000000' },
    { protocol: 'compound', percentage: 50, amount: '500000000' },
  ],
  // ...
})
```

### Scenario 2: Yield Optimization

**Problem**: Different protocols offer different APYs at different times.

**Solution**: Allocate more to higher-yielding protocols.

```typescript
// Check current APYs
const aaveAPY = await aaveAdapter.getSupplyAPY('USDC', 8453) // 4.5%
const compoundAPY = await compoundAdapter.getSupplyAPY('USDC', 8453) // 3.2%
const morphoAPY = await morphoAdapter.getSupplyAPY('USDC', 8453) // 5.1%

// Allocate based on yield
const allocations = [
  { protocol: 'morpho', percentage: 50, amount: '500000000' },  // Highest
  { protocol: 'aave', percentage: 40, amount: '400000000' },    // Second
  { protocol: 'compound', percentage: 10, amount: '100000000' }, // Lowest
]
```

### Scenario 3: Liquidity Management

**Problem**: Large withdrawals might deplete a single protocol's liquidity.

**Solution**: Withdraw from multiple protocols.

```typescript
// Instead of this (might fail if liquidity low)
await aaveAdapter.executeWithdrawal('USDC', 8453, '10000000000', walletClient)

// Do this (spread across protocols)
await batchExecutor.executeBatchWithdrawal({
  allocations: [
    { protocol: 'aave', percentage: 60, amount: '6000000000' },
    { protocol: 'compound', percentage: 40, amount: '4000000000' },
  ],
  // ...
})
```

---

## Execution Modes

### Sequential Execution (Recommended)

**How it works**: Execute protocols one by one

```typescript
const result = await executor.executeBatchDeposit({
  token: 'USDC',
  chainId: 8453,
  totalAmount: '1000000000',
  allocations: [
    { protocol: 'aave', percentage: 60, amount: '600000000' },
    { protocol: 'compound', percentage: 40, amount: '400000000' },
  ],
  walletClient,
  executionMode: 'sequential', // ← Execute one by one
})
```

**Execution flow**:
```
1. Execute AAVE deposit
   → Wait for confirmation
   → Record result
2. Execute Compound deposit
   → Wait for confirmation
   → Record result
3. Return aggregated results
```

**Advantages**:
- ✅ Easier to debug (clear execution order)
- ✅ Partial failures are easier to handle
- ✅ Lower nonce management complexity
- ✅ **Recommended for production**

**Disadvantages**:
- ⏱️ Slower (sequential, not parallel)
- ⏱️ Higher latency for user

### Parallel Execution (Advanced)

**How it works**: Execute all protocols simultaneously

```typescript
const result = await executor.executeBatchDeposit({
  // ... same as above ...
  executionMode: 'parallel', // ← Execute all at once
})
```

**Execution flow**:
```
1. Start AAVE deposit    ┐
2. Start Compound deposit├─ All execute simultaneously
3. Start Morpho deposit  ┘
   ↓
4. Wait for all to complete
5. Aggregate results
```

**Advantages**:
- ⚡ Faster execution
- ⚡ Better user experience (less waiting)

**Disadvantages**:
- ❌ Nonce management complexity
- ❌ Harder to debug failures
- ❌ All-or-nothing approach (harder partial failure handling)
- ❌ **Use only in development/testing**

---

## Allocation Strategies

### Strategy 1: Equal Allocation

Split evenly across all protocols.

```typescript
const allocations = [
  { protocol: 'aave', percentage: 33.33, amount: '333333333' },
  { protocol: 'compound', percentage: 33.33, amount: '333333333' },
  { protocol: 'morpho', percentage: 33.34, amount: '333333334' },
]
```

**Use case**: Maximum diversification, don't care about yield differences

### Strategy 2: Risk-Weighted Allocation

Allocate based on protocol risk (TVL, age, audit status).

```typescript
// Conservative: Favor established protocols
const allocations = [
  { protocol: 'aave', percentage: 70, amount: '700000000' },    // Highest TVL
  { protocol: 'compound', percentage: 25, amount: '250000000' }, // Medium TVL
  { protocol: 'morpho', percentage: 5, amount: '50000000' },     // Newer
]
```

**Use case**: Conservative users, prioritize safety over yield

### Strategy 3: Yield-Weighted Allocation

Allocate more to higher-yielding protocols.

```typescript
// Fetch APYs
const apys = {
  aave: parseFloat(await aaveAdapter.getSupplyAPY('USDC', 8453)),
  compound: parseFloat(await compoundAdapter.getSupplyAPY('USDC', 8453)),
  morpho: parseFloat(await morphoAdapter.getSupplyAPY('USDC', 8453)),
}

// Calculate weights (APY proportion)
const totalAPY = apys.aave + apys.compound + apys.morpho

const allocations = [
  {
    protocol: 'aave',
    percentage: (apys.aave / totalAPY) * 100,
    amount: calculateAmount(apys.aave / totalAPY),
  },
  // ... similar for others
]
```

**Use case**: Aggressive users, maximize yield

### Strategy 4: Hybrid (Balanced)

Combine yield and risk factors.

```typescript
function calculateHybridAllocation(
  protocols: Protocol[],
  apys: Record<Protocol, number>,
  tvls: Record<Protocol, number>
): ProtocolAllocation[] {
  const scores = protocols.map(protocol => {
    // 60% weight on yield, 40% weight on safety (TVL)
    const normalizedAPY = apys[protocol] / Math.max(...Object.values(apys))
    const normalizedTVL = tvls[protocol] / Math.max(...Object.values(tvls))

    return {
      protocol,
      score: (normalizedAPY * 0.6) + (normalizedTVL * 0.4)
    }
  })

  // Convert scores to percentages
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)

  return scores.map(s => ({
    protocol: s.protocol,
    percentage: (s.score / totalScore) * 100,
    amount: calculateAmount((s.score / totalScore))
  }))
}
```

**Use case**: Moderate risk users, balance yield and safety

### Strategy 5: Gas-Aware Allocation

Factor in gas costs for each protocol.

```typescript
async function calculateGasAwareAllocation(
  totalAmount: string,
  protocols: Protocol[]
): Promise<ProtocolAllocation[]> {
  // Estimate gas for each protocol
  const gasEstimates = new Map<Protocol, bigint>()

  for (const protocol of protocols) {
    const adapter = getAdapter(protocol)
    const gas = await adapter.estimateDepositGas('USDC', 8453, totalAmount, user)
    gasEstimates.set(protocol, gas)
  }

  // Exclude protocols where gas cost > yield
  const netAPYs = protocols.map(protocol => {
    const apy = await getAPY(protocol)
    const gasCostUSD = await estimateGasCostUSD(chainId, gasEstimates.get(protocol)!)

    // Calculate break-even period
    const dailyYield = (parseFloat(totalAmount) / 1e6) * (parseFloat(apy) / 365 / 100)
    const breakEvenDays = gasCostUSD / dailyYield

    // If break-even > 30 days, exclude
    return {
      protocol,
      netAPY: breakEvenDays > 30 ? 0 : parseFloat(apy),
    }
  })

  // Allocate to protocols with positive net APY
  // ...
}
```

**Use case**: Small deposits where gas matters

---

## Error Handling

### Partial Failure Recovery

When some protocols succeed and others fail:

```typescript
const result = await executor.executeBatchDeposit(request)

if (result.partialFailure) {
  console.log('⚠️ Partial failure detected')

  // Get successful deposits
  const successful = result.results.filter(r => r.success)
  const failed = result.results.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}/${result.results.length}`)
  console.log(`❌ Failed: ${failed.length}/${result.results.length}`)

  // Option 1: Accept partial deployment
  await updateVaultBalance(result.totalDeployed)

  // Option 2: Retry failed protocols
  for (const failure of failed) {
    console.log(`Retrying ${failure.protocol}...`)

    try {
      const retryResult = await retryProtocolDeposit(failure)
      console.log(`✅ Retry succeeded for ${failure.protocol}`)
    } catch (error) {
      console.error(`❌ Retry failed for ${failure.protocol}:`, error)
      // Log to monitoring system
      await logFailure(failure)
    }
  }

  // Option 3: Revert successful transactions (complex, not recommended)
  // This requires complex rollback logic
}
```

### Validation Before Execution

```typescript
function validateBatchRequest(request: BatchDepositRequest): void {
  // 1. Check allocations sum to 100%
  const totalPercentage = request.allocations.reduce(
    (sum, a) => sum + a.percentage,
    0
  )

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Allocations must sum to 100%, got ${totalPercentage}%`)
  }

  // 2. Check amounts match percentages
  const totalAllocatedAmount = request.allocations.reduce(
    (sum, a) => sum + BigInt(a.amount),
    0n
  )

  if (totalAllocatedAmount !== BigInt(request.totalAmount)) {
    throw new Error('Allocated amounts do not match total amount')
  }

  // 3. Check minimum allocations
  const MIN_ALLOCATION = parseUnits('10', 6) // $10 minimum per protocol

  for (const alloc of request.allocations) {
    if (BigInt(alloc.amount) < MIN_ALLOCATION) {
      throw new Error(`Minimum allocation is $10 per protocol`)
    }
  }

  // 4. Check supported protocols
  const supportedProtocols = ['aave', 'compound', 'morpho']

  for (const alloc of request.allocations) {
    if (!supportedProtocols.includes(alloc.protocol)) {
      throw new Error(`Unsupported protocol: ${alloc.protocol}`)
    }
  }
}
```

### Transaction Timeout Handling

```typescript
async function executeWithTimeout(
  executor: BatchExecutor,
  request: BatchDepositRequest,
  timeoutMs: number = 300000 // 5 minutes
): Promise<BatchExecutionResult> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Batch execution timeout')), timeoutMs)
  })

  try {
    const result = await Promise.race([
      executor.executeBatchDeposit(request),
      timeoutPromise,
    ])

    return result
  } catch (error) {
    if (error.message === 'Batch execution timeout') {
      // Check transaction status manually
      // Some protocols might have succeeded
      const status = await checkBatchStatus(request)
      throw new Error(`Timeout: ${status.successful}/${status.total} completed`)
    }

    throw error
  }
}
```

---

## Gas Optimization

### Estimate Before Execution

```typescript
const executor = new BatchExecutor(8453)

// Estimate gas for entire batch
const estimate = await executor.estimateBatchGas({
  token: 'USDC',
  chainId: 8453,
  totalAmount: '1000000000',
  allocations: [
    { protocol: 'aave', percentage: 60, amount: '600000000' },
    { protocol: 'compound', percentage: 40, amount: '400000000' },
  ],
  executionMode: 'sequential',
})

console.log('Total gas:', estimate.totalGas)
console.log('Per protocol:', estimate.perProtocol)

// Example output:
// Total gas: 450000n
// Per protocol: Map {
//   'aave' => 250000n,
//   'compound' => 200000n
// }
```

### Gas-Aware Protocol Selection

```typescript
async function selectProtocolsByGas(
  totalAmount: string,
  chainId: number,
  maxGasCostUSD: number
): Promise<Protocol[]> {
  const protocols: Protocol[] = ['aave', 'compound', 'morpho']
  const selected: Protocol[] = []

  for (const protocol of protocols) {
    const adapter = getAdapter(protocol)

    // Estimate gas
    const gasEstimate = await adapter.estimateDepositGas(
      'USDC',
      chainId,
      totalAmount,
      '0x0'
    )

    // Convert to USD
    const gasCostUSD = await estimateGasCostUSD(chainId, gasEstimate, 2000)

    // Include if gas cost is acceptable
    if (parseFloat(gasCostUSD) <= maxGasCostUSD) {
      selected.push(protocol)
    } else {
      console.log(`Excluding ${protocol}: gas cost $${gasCostUSD} > max $${maxGasCostUSD}`)
    }
  }

  return selected
}

// Usage
const affordableProtocols = await selectProtocolsByGas('1000000000', 8453, 5)
// Result: ['compound', 'morpho'] (AAVE too expensive)
```

### Batch Optimization Techniques

**1. Skip unnecessary approvals**:

```typescript
// Check all approvals first
const approvalStatuses = await Promise.all(
  allocations.map(alloc =>
    adapter.checkApproval(token, chainId, user, protocolAddress, alloc.amount)
  )
)

// Only execute needed approvals
const approvalsNeeded = approvalStatuses.filter(s => s.needsApproval)

for (const approval of approvalsNeeded) {
  await executeApproval(approval)
}
```

**2. Use optimal execution mode**:

```typescript
// For small batches (2-3 protocols): sequential is fine
if (allocations.length <= 3) {
  executionMode = 'sequential'
}

// For large batches (4+ protocols): parallel might be worth the complexity
if (allocations.length >= 4) {
  executionMode = 'parallel'
}
```

---

## Advanced Patterns

### Pattern 1: Rebalancing

Adjust allocations over time as APYs change.

```typescript
async function rebalanceVault(
  currentAllocations: DefiAllocation[],
  targetAllocations: ProtocolAllocation[]
) {
  const rebalanceActions: Array<{
    protocol: Protocol
    action: 'deposit' | 'withdraw'
    amount: string
  }> = []

  // Calculate differences
  for (const target of targetAllocations) {
    const current = currentAllocations.find(a => a.protocol === target.protocol)
    const currentAmount = current ? BigInt(current.balance) : 0n
    const targetAmount = BigInt(target.amount)

    if (targetAmount > currentAmount) {
      // Need to deposit more
      rebalanceActions.push({
        protocol: target.protocol,
        action: 'deposit',
        amount: (targetAmount - currentAmount).toString(),
      })
    } else if (targetAmount < currentAmount) {
      // Need to withdraw
      rebalanceActions.push({
        protocol: target.protocol,
        action: 'withdraw',
        amount: (currentAmount - targetAmount).toString(),
      })
    }
  }

  // Execute withdrawals first
  const withdrawals = rebalanceActions.filter(a => a.action === 'withdraw')
  for (const withdrawal of withdrawals) {
    await executeProtocolWithdrawal(withdrawal)
  }

  // Then execute deposits
  const deposits = rebalanceActions.filter(a => a.action === 'deposit')
  await executeBatchDeposit({ allocations: deposits, ... })
}
```

### Pattern 2: Auto-Compounding

Automatically claim and reinvest yields.

```typescript
async function autoCompound(vaultId: string) {
  // 1. Calculate accumulated yield
  const yield = await calculateYield(vaultId)

  if (parseFloat(yield) < 100) {
    // Skip if yield < $100 (gas not worth it)
    return
  }

  // 2. Claim yield from protocols (if supported)
  const claimedYield = await claimYieldFromProtocols(vaultId)

  // 3. Reinvest using current allocation strategy
  const currentAllocations = await getCurrentAllocations(vaultId)

  await executeBatchDeposit({
    totalAmount: claimedYield,
    allocations: currentAllocations,
    // ...
  })

  // 4. Update index to reflect compounding
  await updateVaultIndex(vaultId)
}
```

### Pattern 3: Dynamic Allocation Based on Capacity

Adjust allocations based on protocol capacity.

```typescript
async function calculateCapacityAwareAllocation(
  totalAmount: string,
  protocols: Protocol[]
): Promise<ProtocolAllocation[]> {
  const allocations: ProtocolAllocation[] = []

  for (const protocol of protocols) {
    const adapter = getAdapter(protocol)

    // Get protocol metrics
    const metrics = await adapter.getMetrics('USDC', 8453)

    // Calculate available capacity
    const availableCapacity = BigInt(metrics.liquidity)
    const allocationAmount = BigInt(totalAmount) * BigInt(33) / 100n // 33% target

    // Cap allocation at available capacity
    const actualAllocation = allocationAmount > availableCapacity
      ? availableCapacity
      : allocationAmount

    allocations.push({
      protocol,
      percentage: Number(actualAllocation * 100n / BigInt(totalAmount)),
      amount: actualAllocation.toString(),
    })
  }

  // Normalize percentages to 100%
  return normalizeAllocations(allocations)
}
```

---

## Production Considerations

### 1. Monitoring & Alerting

```typescript
// Track batch execution metrics
interface BatchMetrics {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  partialFailures: number
  avgGasUsed: bigint
  avgExecutionTime: number
}

async function trackBatchExecution(
  result: BatchExecutionResult,
  startTime: number
) {
  await db.query(`
    INSERT INTO batch_execution_metrics (
      total_protocols,
      successful_protocols,
      failed_protocols,
      total_gas_used,
      execution_time_ms,
      partial_failure
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    result.results.length,
    result.results.filter(r => r.success).length,
    result.results.filter(r => !r.success).length,
    result.totalGasUsed.toString(),
    Date.now() - startTime,
    result.partialFailure,
  ])

  // Alert if failure rate > 10%
  const failureRate = result.results.filter(r => !r.success).length / result.results.length

  if (failureRate > 0.1) {
    await sendAlert({
      type: 'HIGH_FAILURE_RATE',
      failureRate,
      result,
    })
  }
}
```

### 2. Rate Limiting

```typescript
class RateLimitedBatchExecutor {
  private lastExecutionTime = 0
  private readonly minIntervalMs = 10000 // 10 seconds between batches

  async executeBatchDeposit(request: BatchDepositRequest): Promise<BatchExecutionResult> {
    const now = Date.now()
    const timeSinceLastExecution = now - this.lastExecutionTime

    if (timeSinceLastExecution < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastExecution
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastExecutionTime = Date.now()
    return super.executeBatchDeposit(request)
  }
}
```

### 3. Circuit Breaker

```typescript
class CircuitBreakerExecutor {
  private failureCount = 0
  private readonly maxFailures = 5
  private readonly resetTimeMs = 60000 // 1 minute
  private lastFailureTime = 0

  async executeBatchDeposit(request: BatchDepositRequest): Promise<BatchExecutionResult> {
    // Check if circuit is open
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker open: too many recent failures')
    }

    try {
      const result = await super.executeBatchDeposit(request)

      // Reset on success
      this.failureCount = 0

      return result
    } catch (error) {
      // Increment failure count
      this.failureCount++
      this.lastFailureTime = Date.now()

      throw error
    }
  }

  private isCircuitOpen(): boolean {
    if (this.failureCount < this.maxFailures) {
      return false
    }

    // Reset after timeout
    if (Date.now() - this.lastFailureTime > this.resetTimeMs) {
      this.failureCount = 0
      return false
    }

    return true
  }
}
```

---

## Summary

### Best Practices

1. ✅ **Use sequential execution** for production
2. ✅ **Validate allocations** before execution (must sum to 100%)
3. ✅ **Estimate gas** before execution
4. ✅ **Handle partial failures** gracefully
5. ✅ **Monitor batch metrics** (success rate, gas usage)
6. ✅ **Implement rate limiting** to avoid congestion
7. ✅ **Use circuit breakers** to prevent cascade failures

### Production Checklist

- [ ] Allocation validation (sum to 100%)
- [ ] Gas estimation
- [ ] Partial failure handling
- [ ] Transaction monitoring
- [ ] Metrics tracking
- [ ] Alerting setup
- [ ] Rate limiting
- [ ] Circuit breaker
- [ ] Retry logic
- [ ] Comprehensive logging

---

**Related Documentation**:
- [EXECUTION.md](./EXECUTION.md) - Basic execution patterns
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview
- [SHARE_ACCOUNTING.md](./SHARE_ACCOUNTING.md) - Yield tracking model
