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
