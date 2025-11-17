/**
 * End User Entity - Database Schema with Zod Validation
 */

import { z } from 'zod';

/**
 * User Type Enum
 */
export const userTypeSchema = z.enum(['retail', 'institutional', 'vip', 'test']);

export type UserType = z.infer<typeof userTypeSchema>;

/**
 * End User Schema
 */
export const endUserSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  userId: z.string().min(1), // Client's app-specific user ID
  userType: userTypeSchema,
  userWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).nullable(),
  isActive: z.boolean().default(true),
  
  // Activity timestamps
  firstDepositAt: z.date().nullable(),
  lastDepositAt: z.date().nullable(),
  lastWithdrawalAt: z.date().nullable(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EndUser = z.infer<typeof endUserSchema>;

/**
 * Create End User Input Schema
 */
export const createEndUserSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  userId: z.string().min(1, 'User ID is required'),
  userType: userTypeSchema,
  userWalletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
});

export type CreateEndUser = z.infer<typeof createEndUserSchema>;

/**
 * Update End User Input Schema
 */
export const updateEndUserSchema = z.object({
  userWalletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateEndUser = z.infer<typeof updateEndUserSchema>;

/**
 * User Portfolio Schema
 */
export const userPortfolioSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  clientId: z.string().uuid(),
  userType: userTypeSchema,
  
  // Activity
  firstDepositAt: z.date().nullable(),
  lastDepositAt: z.date().nullable(),
  lastWithdrawalAt: z.date().nullable(),
  
  // Vault balances (aggregated)
  totalDeposited: z.string().regex(/^\d+(\.\d+)?$/),
  totalWithdrawn: z.string().regex(/^\d+(\.\d+)?$/),
  currentBalance: z.string().regex(/^\d+(\.\d+)?$/),
  totalYield: z.string().regex(/^\d+(\.\d+)?$/),
  
  // Transaction counts
  depositCount: z.number().int().nonnegative(),
  withdrawalCount: z.number().int().nonnegative(),
  
  createdAt: z.date(),
});

export type UserPortfolio = z.infer<typeof userPortfolioSchema>;

/**
 * User Activity Schema
 */
export const userActivitySchema = z.object({
  userId: z.string(),
  action: z.enum(['deposit', 'withdrawal', 'stake', 'unstake', 'yield_claim']),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string().length(3),
  status: z.string(),
  transactionId: z.string().uuid(),
  timestamp: z.date(),
});

export type UserActivity = z.infer<typeof userActivitySchema>;
