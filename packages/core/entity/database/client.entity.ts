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
});

export type UpdateClient = z.infer<typeof updateClientSchema>;
