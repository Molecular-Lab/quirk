/**
 * Vault Entity - Database Schema with Zod Validation
 * Maps SQLC-generated types to validated domain entities
 */

import { z } from 'zod';

/**
 * Client Vault Schema (Aave-style index accounting)
 */
export const clientVaultSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  currency: z.string().length(3), // USD, USDC, ETH, etc.
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).nullable(),
  chain: z.string().min(1), // ethereum, polygon, base, etc.

  // Index accounting (like Aave)
  currentIndex: z.string().regex(/^\d+(\.\d+)?$/), // Decimal as string
  totalShares: z.string().regex(/^\d+(\.\d+)?$/),
  totalDeposited: z.string().regex(/^\d+(\.\d+)?$/),
  totalWithdrawn: z.string().regex(/^\d+(\.\d+)?$/),
  totalYield: z.string().regex(/^\d+(\.\d+)?$/),

  // Wallet Stages (NEW)
  idleBalance: z.string().regex(/^\d+(\.\d+)?$/).default('0'), // Funds ready to stake
  earningBalance: z.string().regex(/^\d+(\.\d+)?$/).default('0'), // Funds actively earning

  // Revenue Tracking (NEW - 3-way split)
  clientRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/).default('0'), // Client's share (10-20%)
  platformRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/).default('0'), // Platform's share (5-10%)
  enduserRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/).default('0'), // End-users' share (remainder)

  // Deprecated (kept for backward compatibility)
  pendingDepositBalance: z.string().regex(/^\d+(\.\d+)?$/).optional(), // Use idleBalance instead
  totalStakedBalance: z.string().regex(/^\d+(\.\d+)?$/).optional(), // Use earningBalance instead
  cumulativeYield: z.string().regex(/^\d+(\.\d+)?$/).optional(), // Raw yield before splits

  // Performance metrics
  apy7d: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(), // 7-day APY
  apy30d: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(), // 30-day APY

  // DeFi Strategy Allocation
  strategies: z.array(z.any()).default([]), // JSONB array of strategy allocations

  // Status
  isActive: z.boolean().default(true),

  // Timestamps
  lastIndexUpdate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ClientVault = z.infer<typeof clientVaultSchema>;

/**
 * Create Client Vault Input Schema
 */
export const createClientVaultSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address').nullable().optional(),
  chain: z.string().min(1, 'Chain is required'),
  currentIndex: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid index format').default('1.0'),
  totalShares: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid shares format').default('0'),
  totalDeposited: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format').default('0'),
});

export type CreateClientVault = z.infer<typeof createClientVaultSchema>;

/**
 * Update Vault Index Input Schema
 */
export const updateVaultIndexSchema = z.object({
  newIndex: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid index format'),
  yieldEarned: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid yield format'),
});

export type UpdateVaultIndex = z.infer<typeof updateVaultIndexSchema>;

/**
 * Vault Calculation Schemas
 */

// Deposit calculation result
export const depositCalculationSchema = z.object({
  depositAmount: z.string(),
  sharesIssued: z.string(),
  newTotalShares: z.string(),
  newTotalDeposited: z.string(),
});

export type DepositCalculation = z.infer<typeof depositCalculationSchema>;

// Withdrawal calculation result
export const withdrawalCalculationSchema = z.object({
  requestedAmount: z.string(),
  sharesToBurn: z.string(),
  actualWithdrawalAmount: z.string(),
  yieldEarned: z.string(),
  newTotalShares: z.string(),
  newTotalWithdrawn: z.string(),
});

export type WithdrawalCalculation = z.infer<typeof withdrawalCalculationSchema>;

// Yield calculation result
export const yieldCalculationSchema = z.object({
  userShares: z.string(),
  depositedAmount: z.string(),
  currentValue: z.string(),
  yieldEarned: z.string(),
  yieldPercentage: z.string(),
});

export type YieldCalculation = z.infer<typeof yieldCalculationSchema>;

/**
 * Wallet Stages Schemas (NEW)
 */

// Vault balances (idle & earning)
export const vaultBalancesSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  chain: z.string(),
  tokenSymbol: z.string(),
  idleBalance: z.string().regex(/^\d+(\.\d+)?$/),
  earningBalance: z.string().regex(/^\d+(\.\d+)?$/),
  clientRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/),
  platformRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/),
  enduserRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/),
  cumulativeYield: z.string().regex(/^\d+(\.\d+)?$/),
});

export type VaultBalances = z.infer<typeof vaultBalancesSchema>;

// Client total balances (aggregated)
export const clientTotalBalancesSchema = z.object({
  totalIdleBalance: z.string().regex(/^\d+(\.\d+)?$/),
  totalEarningBalance: z.string().regex(/^\d+(\.\d+)?$/),
  totalClientRevenue: z.string().regex(/^\d+(\.\d+)?$/),
  totalPlatformRevenue: z.string().regex(/^\d+(\.\d+)?$/),
  totalEnduserRevenue: z.string().regex(/^\d+(\.\d+)?$/),
  totalCumulativeYield: z.string().regex(/^\d+(\.\d+)?$/),
});

export type ClientTotalBalances = z.infer<typeof clientTotalBalancesSchema>;

/**
 * Revenue Tracking Schemas (NEW)
 */

// Client revenue summary
export const clientRevenueSummarySchema = z.object({
  id: z.string().uuid(),
  productId: z.string(),
  companyName: z.string(),
  clientRevenueSharePercent: z.string().regex(/^\d+(\.\d+)?$/),
  platformFeePercent: z.string().regex(/^\d+(\.\d+)?$/),
  monthlyRecurringRevenue: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  annualRunRate: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  lastMrrCalculationAt: z.date().nullable(),
  totalClientRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/),
  totalPlatformRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/),
  totalEnduserRevenueEarned: z.string().regex(/^\d+(\.\d+)?$/),
  totalRawYield: z.string().regex(/^\d+(\.\d+)?$/),
  totalEarningBalance: z.string().regex(/^\d+(\.\d+)?$/),
});

export type ClientRevenueSummary = z.infer<typeof clientRevenueSummarySchema>;

// Revenue distribution input
export const recordYieldDistributionSchema = z.object({
  vaultId: z.string().uuid(),
  clientRevenue: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid client revenue'),
  platformRevenue: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid platform revenue'),
  enduserRevenue: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid enduser revenue'),
  rawYield: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid raw yield'),
});

export type RecordYieldDistribution = z.infer<typeof recordYieldDistributionSchema>;

/**
 * End-User Activity Schemas (NEW)
 */

// Transaction type
export const transactionTypeSchema = z.enum(['deposit', 'withdrawal']);

// End-user transaction
export const endUserTransactionSchema = z.object({
  transactionType: transactionTypeSchema,
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string(),
  status: z.string(),
  timestamp: z.date(),
});

export type EndUserTransaction = z.infer<typeof endUserTransactionSchema>;

// End-user growth metrics
export const endUserGrowthMetricsSchema = z.object({
  totalEndUsers: z.number().int().nonnegative(),
  newUsers30d: z.number().int().nonnegative(),
  activeUsers30d: z.number().int().nonnegative(),
  totalDeposited: z.string().regex(/^\d+(\.\d+)?$/),
  totalWithdrawn: z.string().regex(/^\d+(\.\d+)?$/),
  totalDeposits: z.number().int().nonnegative(),
  totalWithdrawals: z.number().int().nonnegative(),
});

export type EndUserGrowthMetrics = z.infer<typeof endUserGrowthMetricsSchema>;
