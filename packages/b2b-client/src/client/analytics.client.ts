/**
 * Analytics Client
 * Dashboard metrics, portfolio analytics, and reporting
 */

import type { AxiosInstance } from 'axios'
import type {
	ClientDashboardStats,
	VaultIndex,
	AllocationBreakdown,
	EndUserBalance,
	APIResponse,
	PaginatedResponse,
	AuditLog,
} from '../types/client.types'

export interface TimeRange {
	startDate: string
	endDate: string
}

export interface PerformanceMetrics {
	tvl: number // Total Value Locked
	apy: number
	totalUsers: number
	revenue: number
	yieldGenerated: number
	timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly'
	data: Array<{
		timestamp: string
		value: number
	}>
}

export class AnalyticsClient {
	constructor(private axios: AxiosInstance) {}

	/**
	 * Get comprehensive dashboard statistics
	 */
	async getDashboardStats(productId: string): Promise<APIResponse<ClientDashboardStats>> {
		const response = await this.axios.get<APIResponse<ClientDashboardStats>>(
			`/analytics/${productId}/dashboard`,
		)
		return response.data
	}

	/**
	 * Get performance metrics over time
	 */
	async getPerformanceMetrics(
		productId: string,
		timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly',
	): Promise<APIResponse<PerformanceMetrics>> {
		const response = await this.axios.get<APIResponse<PerformanceMetrics>>(
			`/analytics/${productId}/performance`,
			{
				params: { timeRange },
			},
		)
		return response.data
	}

	/**
	 * Get vault indices (per risk tier)
	 */
	async getVaultIndices(productId: string): Promise<APIResponse<VaultIndex[]>> {
		const response = await this.axios.get<APIResponse<VaultIndex[]>>(
			`/analytics/${productId}/vault-indices`,
		)
		return response.data
	}

	/**
	 * Get allocation breakdown
	 */
	async getAllocations(productId: string): Promise<APIResponse<AllocationBreakdown[]>> {
		const response = await this.axios.get<APIResponse<AllocationBreakdown[]>>(
			`/analytics/${productId}/allocations`,
		)
		return response.data
	}

	/**
	 * Get top earning users
	 */
	async getTopEarners(
		productId: string,
		limit: number = 10,
	): Promise<APIResponse<EndUserBalance[]>> {
		const response = await this.axios.get<APIResponse<EndUserBalance[]>>(
			`/analytics/${productId}/top-earners`,
			{
				params: { limit },
			},
		)
		return response.data
	}

	/**
	 * Get user balance details
	 */
	async getUserBalance(
		productId: string,
		userId: string,
	): Promise<APIResponse<EndUserBalance>> {
		const response = await this.axios.get<APIResponse<EndUserBalance>>(
			`/analytics/${productId}/users/${userId}/balance`,
		)
		return response.data
	}

	/**
	 * Get audit logs
	 */
	async getAuditLogs(
		productId: string,
		page: number = 1,
		limit: number = 50,
		filters?: {
			userId?: string
			action?: string
			startDate?: string
			endDate?: string
		},
	): Promise<PaginatedResponse<AuditLog>> {
		const response = await this.axios.get<PaginatedResponse<AuditLog>>(
			`/analytics/${productId}/audit-logs`,
			{
				params: {
					page,
					limit,
					...filters,
				},
			},
		)
		return response.data
	}

	/**
	 * Export data to CSV
	 */
	async exportData(
		productId: string,
		type: 'deposits' | 'withdrawals' | 'users' | 'allocations',
		timeRange?: TimeRange,
	): Promise<Blob> {
		const response = await this.axios.get(`/analytics/${productId}/export/${type}`, {
			params: timeRange,
			responseType: 'blob',
		})
		return response.data
	}
}
