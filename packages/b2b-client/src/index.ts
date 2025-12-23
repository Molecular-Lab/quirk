/**
 * @quirk/b2b-client
 *
 * B2B API Client package for Quirk deposit operations
 * Following Clean Architecture - all business logic and types are in @quirk/core
 *
 * This package provides:
 * 1. Configured API client (singleton with axios)
 * 2. Environment configuration
 * 3. Client registration & management
 * 4. Deposit management
 * 5. Analytics & dashboard data
 * 6. Type-safe wrappers for all B2B operations
 *
 * Usage:
 * ```typescript
 * import { QuirkB2BClient } from '@quirk/b2b-client'
 *
 * const client = new QuirkB2BClient()
 *
 * // Register new client organization
 * const registration = await client.registration.register({
 *   productId: 'my-ecommerce',
 *   companyName: 'My E-Commerce Inc.',
 *   businessType: 'ecommerce',
 *   contactEmail: 'admin@myecommerce.com'
 * })
 *
 * // External payment (Apple Pay)
 * const deposit = await client.deposits.create({
 *   type: 'external',
 *   userId: 'user_123',
 *   amount: 100,
 *   currency: 'USD',
 *   method: 'apple_pay'
 * })
 *
 * // Get dashboard stats
 * const stats = await client.analytics.getDashboardStats('my-ecommerce')
 * ```
 */

// ===== Re-export types from @quirk/core =====
export type {
	// Deposit types
	DepositRequest,
	ExternalDepositRequest,
	InternalDepositRequest,
	DepositResponse,
	ExternalDepositResponse,
	InternalDepositResponse,
	DepositStatus,
	Deposit,
	ExternalDeposit,
	InternalDeposit,
	ClientBalance as CoreClientBalance,
	PaginatedDeposits,
	APIResponse as CoreAPIResponse,
	// SDK types (from core/sdk)
	QuirkSDKConfig,
} from '@quirk/core'

// ===== Re-export SDK client from @quirk/core =====
export { QuirkClient, QuirkError } from '@quirk/core'

// ===== Client Management Types =====
export type {
	ClientOrganization,
	BusinessType,
	RiskTier,
	SubscriptionTier,
	RiskAllocation,
	CreateClientRequest,
	CreateClientResponse,
	UpdateRiskTierRequest,
	ClientDashboardStats,
	AllocationBreakdown,
	DepositSummary,
	WithdrawalSummary,
	EndUserDeposit,
	EndUserBalance,
	VaultIndex,
	ClientBalance,
	TopupBalanceRequest,
	APIResponse,
	PaginatedResponse,
	AuditLog,
} from './types/client.types'

// ===== Configuration =====
export {
	ENV,
	type ENV_TYPE,
	getBaseURL,
	isProduction,
	isStaging,
	isDevelopment,
} from './config/env'

export {
	type QuirkClientConfig,
	createClientConfig,
	createAxiosInstance,
	getAxiosInstance,
	resetAxiosInstance,
} from './config/client.config'

// ===== Client Classes =====
export { DepositClient } from './client/deposit.client'
export { ClientRegistrationClient } from './client/registration.client'
export { AnalyticsClient } from './client/analytics.client'
export { QuirkB2BClient } from './client/proxify.client'

// ===== Default export (main client) =====
import { QuirkB2BClient } from './client/proxify.client'
export default QuirkB2BClient
