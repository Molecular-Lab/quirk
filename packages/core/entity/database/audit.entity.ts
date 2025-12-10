/**
 * Audit Entity - Database Schema with Zod Validation
 * Compliance and Activity Logging
 */

import { z } from "zod"

/**
 * Actor Type Enum
 */
export const actorTypeSchema = z.enum(["user", "system", "admin", "api"])

export type ActorType = z.infer<typeof actorTypeSchema>

/**
 * Audit Action Enum
 */
export const auditActionSchema = z.enum([
	"deposit",
	"withdrawal",
	"transfer",
	"stake",
	"unstake",
	"rebalance",
	"client_created",
	"client_updated",
	"user_created",
	"user_updated",
	"api_key_generated",
	"api_key_rotated",
	"allocation_created",
	"allocation_updated",
	"vault_created",
	"balance_updated",
])

export type AuditAction = z.infer<typeof auditActionSchema>

/**
 * Resource Type Enum
 */
export const resourceTypeSchema = z.enum([
	"client",
	"end_user",
	"vault",
	"deposit_transaction",
	"withdrawal_transaction",
	"defi_protocol",
	"defi_allocation",
	"api_key",
	"balance",
])

export type ResourceType = z.infer<typeof resourceTypeSchema>

/**
 * Audit Log Schema
 */
export const auditLogSchema = z.object({
	id: z.string().uuid(),

	// Who
	clientId: z.string().uuid().nullable(),
	userId: z.string().nullable(),
	actorType: actorTypeSchema,

	// What
	action: auditActionSchema,
	resourceType: resourceTypeSchema.nullable(),
	resourceId: z.string().nullable(),
	description: z.string().nullable(),

	// Context
	metadata: z.record(z.any()).nullable(), // JSON data
	ipAddress: z.string().ip().nullable(),
	userAgent: z.string().nullable(),

	// When
	createdAt: z.date(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

/**
 * Create Audit Log Input Schema
 */
export const createAuditLogSchema = z.object({
	clientId: z.string().uuid().nullable().optional(),
	userId: z.string().nullable().optional(),
	actorType: actorTypeSchema,
	action: auditActionSchema,
	resourceType: resourceTypeSchema.nullable().optional(),
	resourceId: z.string().nullable().optional(),
	description: z.string().max(500).nullable().optional(),
	metadata: z.record(z.any()).nullable().optional(),
	ipAddress: z.string().ip().nullable().optional(),
	userAgent: z.string().max(500).nullable().optional(),
})

export type CreateAuditLog = z.infer<typeof createAuditLogSchema>

/**
 * Action Frequency Schema (for analytics)
 */
export const actionFrequencySchema = z.object({
	action: auditActionSchema,
	count: z.string().regex(/^\d+$/), // Stored as string from DB
	firstOccurrence: z.string(), // ISO date string
	lastOccurrence: z.string(), // ISO date string
})

export type ActionFrequency = z.infer<typeof actionFrequencySchema>

/**
 * Resource Activity Schema (for analytics)
 */
export const resourceActivitySchema = z.object({
	resourceId: z.string(),
	resourceType: resourceTypeSchema,
	action: auditActionSchema,
	actorType: actorTypeSchema,
	timestamp: z.date(),
	description: z.string().nullable(),
})

export type ResourceActivity = z.infer<typeof resourceActivitySchema>

/**
 * Audit Log Filter Schema
 */
export const auditLogFilterSchema = z.object({
	clientId: z.string().uuid().optional(),
	userId: z.string().optional(),
	actorType: actorTypeSchema.optional(),
	action: auditActionSchema.optional(),
	resourceType: resourceTypeSchema.optional(),
	resourceId: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	limit: z.number().int().positive().max(1000).default(100),
	offset: z.number().int().nonnegative().default(0),
})

export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>
