/**
 * DeFi Entities - Database Schema with Zod Validation
 * Protocols, Allocations, and Yield Tracking
 */

import { z } from 'zod';

/**
 * DeFi Category Enum
 */
export const defiCategorySchema = z.enum([
  'lending',
  'staking',
  'liquidity_pool',
  'yield_farming',
  'liquid_staking',
  'restaking',
  'real_world_assets',
]);

export type DefiCategory = z.infer<typeof defiCategorySchema>;

/**
 * Protocol Status Enum
 */
export const protocolStatusSchema = z.enum(['active', 'inactive', 'deprecated']);

export type ProtocolStatus = z.infer<typeof protocolStatusSchema>;

/**
 * DeFi Protocol Schema
 */
export const defiProtocolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  category: defiCategorySchema,
  chain: z.string().min(1), // ethereum, polygon, arbitrum, etc.
  
  // Contract info
  protocolAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).nullable(),
  poolId: z.string().nullable(),
  
  // APY tracking
  currentAPY: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  minAPY: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  maxAPY: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  
  // Risk
  riskScore: z.number().int().min(0).max(100),
  auditStatus: z.enum(['audited', 'unaudited', 'bug_bounty']).nullable(),
  
  // Status
  isActive: z.boolean().default(true),
  
  // Metadata
  description: z.string().nullable(),
  website: z.string().url().nullable(),
  
  // Timestamps
  deployedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DefiProtocol = z.infer<typeof defiProtocolSchema>;

/**
 * Create DeFi Protocol Input Schema
 */
export const createDefiProtocolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: defiCategorySchema,
  chain: z.string().min(1, 'Chain is required'),
  protocolAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).nullable().optional(),
  poolId: z.string().nullable().optional(),
  currentAPY: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(),
  riskScore: z.number().int().min(0).max(100).default(50),
  auditStatus: z.enum(['audited', 'unaudited', 'bug_bounty']).nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
});

export type CreateDefiProtocol = z.infer<typeof createDefiProtocolSchema>;

/**
 * Allocation Status Enum
 */
export const allocationStatusSchema = z.enum(['active', 'rebalancing', 'withdrawn']);

export type AllocationStatus = z.infer<typeof allocationStatusSchema>;

/**
 * DeFi Allocation Schema
 */
export const defiAllocationSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  clientVaultId: z.string().uuid(),
  protocolId: z.string().uuid(),
  
  // Allocation details
  category: defiCategorySchema,
  chain: z.string(),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenSymbol: z.string().min(1),
  
  // Amounts
  balance: z.string().regex(/^\d+(\.\d+)?$/),
  percentageAllocation: z.string().regex(/^\d+(\.\d+)?$/), // 0-100
  
  // Yield tracking
  yieldEarned: z.string().regex(/^\d+(\.\d+)?$/).default('0'),
  apy: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  
  // Status
  status: allocationStatusSchema,
  
  // Timestamps
  deployedAt: z.date(),
  lastRebalanceAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DefiAllocation = z.infer<typeof defiAllocationSchema>;

/**
 * Create DeFi Allocation Input Schema
 */
export const createDefiAllocationSchema = z.object({
  clientId: z.string().uuid(),
  clientVaultId: z.string().uuid(),
  protocolId: z.string().uuid(),
  category: defiCategorySchema,
  chain: z.string().min(1),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenSymbol: z.string().min(1),
  balance: z.string().regex(/^\d+(\.\d+)?$/),
  percentageAllocation: z.string().regex(/^\d+(\.\d+)?$/),
  apy: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(),
  status: allocationStatusSchema.default('active'),
});

export type CreateDefiAllocation = z.infer<typeof createDefiAllocationSchema>;

/**
 * Protocol Performance Schema
 */
export const protocolPerformanceSchema = z.object({
  protocolName: z.string(),
  category: defiCategorySchema,
  chain: z.string(),
  tokenSymbol: z.string(),
  balance: z.string().regex(/^\d+(\.\d+)?$/),
  yieldEarned: z.string().regex(/^\d+(\.\d+)?$/),
  apy: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  deployedAt: z.date(),
  lastRebalanceAt: z.date().nullable(),
  totalReturnPercent: z.string().regex(/^-?\d+(\.\d+)?$/), // Can be negative
});

export type ProtocolPerformance = z.infer<typeof protocolPerformanceSchema>;

/**
 * Allocation Summary Schema
 */
export const allocationSummarySchema = z.object({
  clientVaultId: z.string().uuid(),
  totalAllocated: z.string().regex(/^\d+(\.\d+)?$/),
  totalYieldEarned: z.string().regex(/^\d+(\.\d+)?$/),
  activeAllocations: z.number().int().nonnegative(),
  averageAPY: z.string().regex(/^\d+(\.\d+)?$/),
});

export type AllocationSummary = z.infer<typeof allocationSummarySchema>;

/**
 * Category Breakdown Schema
 */
export const categoryAllocationBreakdownSchema = z.object({
  category: defiCategorySchema,
  totalAllocated: z.string().regex(/^\d+(\.\d+)?$/),
  percentageOfTotal: z.string().regex(/^\d+(\.\d+)?$/),
  allocationCount: z.number().int().nonnegative(),
  averageAPY: z.string().regex(/^\d+(\.\d+)?$/),
});

export type CategoryAllocationBreakdown = z.infer<typeof categoryAllocationBreakdownSchema>;
