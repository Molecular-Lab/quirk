/**
 * Client Entity - Database Schema with Zod Validation
 * Maps SQLC-generated types to validated domain entities
 */

import { z } from 'zod';

/**
 * Bank Account Schema for Client Withdrawals
 */
export const bankAccountSchema = z.object({
  currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]),
  bank_name: z.string(),
  account_number: z.string(),
  account_name: z.string(),
  bank_details: z.record(z.any()).optional(), // Dynamic: {swift_code, bank_code, promptpay_id, etc.}
});

export type BankAccount = z.infer<typeof bankAccountSchema>;

/**
 * Client Organization Schema
 */
export const clientSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().min(1),
  privyOrganizationId: z.string().min(1),
  name: z.string().min(1).max(255),
  apiKeyPrefix: z.string().nullable(),
  apiKeyHash: z.string().nullable(),
  isActive: z.boolean().default(true),

  // Multi-currency support
  supportedCurrencies: z.array(z.string()).default([]),
  bankAccounts: z.array(bankAccountSchema).default([]),

  // Revenue Configuration (NEW)
  clientRevenueSharePercent: z.string().regex(/^\d+(\.\d+)?$/).default('15.00'), // 10-20%
  platformFeePercent: z.string().regex(/^\d+(\.\d+)?$/).default('7.50'), // 5-10%

  // MRR/ARR Tracking (NEW)
  monthlyRecurringRevenue: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(), // MRR
  annualRunRate: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(), // ARR = MRR × 12
  lastMrrCalculationAt: z.date().nullable().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Client = z.infer<typeof clientSchema>;

/**
 * Client Balance Schema
 */
export const clientBalanceSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  currency: z.string().length(3), // USD, EUR, etc.
  availableBalance: z.string().regex(/^\d+(\.\d+)?$/), // Decimal as string for precision
  reservedBalance: z.string().regex(/^\d+(\.\d+)?$/),
  totalBalance: z.string().regex(/^\d+(\.\d+)?$/),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ClientBalance = z.infer<typeof clientBalanceSchema>;

/**
 * Client Stats Schema
 */
export const clientStatsSchema = z.object({
  clientId: z.string().uuid(),
  totalDeposits: z.string().regex(/^\d+(\.\d+)?$/),
  totalWithdrawals: z.string().regex(/^\d+(\.\d+)?$/),
  totalFees: z.string().regex(/^\d+(\.\d+)?$/),
  activeUsers: z.number().int().nonnegative(),
});

export type ClientStats = z.infer<typeof clientStatsSchema>;

/**
 * Create Client Input Schema
 */
export const createClientSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  privyOrganizationId: z.string().min(1, 'Privy Organization ID is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  apiKeyPrefix: z.string().nullable().optional(),
  apiKeyHash: z.string().nullable().optional(),
  supportedCurrencies: z.array(z.string()).optional(),
  bankAccounts: z.array(bankAccountSchema).optional(),

  // Fee Configuration (optional - defaults will be used if not provided)
  clientRevenueSharePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 10.0 && num <= 20.0;
      },
      { message: 'Client revenue share must be between 10% and 20%' }
    )
    .default('15.00')
    .optional(),
  platformFeePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 5.0 && num <= 10.0;
      },
      { message: 'Platform fee must be between 5% and 10%' }
    )
    .default('7.50')
    .optional(),
});

export type CreateClient = z.infer<typeof createClientSchema>;

/**
 * Update Client Input Schema
 */
export const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  apiKeyPrefix: z.string().nullable().optional(),
  apiKeyHash: z.string().nullable().optional(),
  isActive: z.boolean().optional(),

  // Fee Configuration (optional)
  clientRevenueSharePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 10.0 && num <= 20.0;
      },
      { message: 'Client revenue share must be between 10% and 20%' }
    )
    .optional(),
  platformFeePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 5.0 && num <= 10.0;
      },
      { message: 'Platform fee must be between 5% and 10%' }
    )
    .optional(),
});

export type UpdateClient = z.infer<typeof updateClientSchema>;

/**
 * Revenue Configuration Schemas (NEW)
 */

// Revenue config (fee percentages)
export const revenueConfigSchema = z.object({
  clientRevenueSharePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 10.0 && num <= 20.0;
      },
      { message: 'Client revenue share must be between 10% and 20%' }
    ),
  platformFeePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 5.0 && num <= 10.0;
      },
      { message: 'Platform fee must be between 5% and 10%' }
    ),
});

export type RevenueConfig = z.infer<typeof revenueConfigSchema>;

// Update revenue config input
export const updateRevenueConfigSchema = z.object({
  clientRevenueSharePercent: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Invalid percentage format')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 10.0 && num <= 20.0;
      },
      { message: 'Client revenue share must be between 10% and 20%' }
    ),
});

export type UpdateRevenueConfig = z.infer<typeof updateRevenueConfigSchema>;

// Revenue metrics (MRR, ARR, total revenue)
export const revenueMetricsSchema = z.object({
  // Current MRR/ARR
  monthlyRecurringRevenue: z.string().regex(/^\d+(\.\d+)?$/),
  annualRunRate: z.string().regex(/^\d+(\.\d+)?$/), // MRR × 12
  lastMrrCalculationAt: z.date().nullable(),

  // Cumulative revenue
  totalClientRevenue: z.string().regex(/^\d+(\.\d+)?$/), // All-time client earnings
  totalPlatformRevenue: z.string().regex(/^\d+(\.\d+)?$/), // All-time platform earnings
  totalEnduserRevenue: z.string().regex(/^\d+(\.\d+)?$/), // All-time end-user earnings

  // Current earning balance (actively staked funds)
  totalEarningBalance: z.string().regex(/^\d+(\.\d+)?$/),

  // Fee configuration
  clientRevenueSharePercent: z.string().regex(/^\d+(\.\d+)?$/),
  platformFeePercent: z.string().regex(/^\d+(\.\d+)?$/),
  enduserFeePercent: z.string().regex(/^\d+(\.\d+)?$/), // Calculated: 100 - client - platform
});

export type RevenueMetrics = z.infer<typeof revenueMetricsSchema>;
