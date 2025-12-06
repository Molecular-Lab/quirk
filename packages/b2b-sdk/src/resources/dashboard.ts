/**
 * Dashboard Resource - Dashboard Metrics Endpoint
 */

import { HttpClient } from "../utils/http-client"

import type { DashboardMetrics } from "../types"

export class DashboardResource {
	constructor(private http: HttpClient) {}

	/**
	 * 9.1 Get Dashboard Metrics
	 * Get client dashboard metrics (fund stages, revenue, strategies)
	 */
	async getMetrics(params?: { clientId?: string }): Promise<DashboardMetrics> {
		const queryString = params ? this.http.buildQueryString(params) : ""
		return this.http.get<DashboardMetrics>(`/api/v1/dashboard/metrics${queryString}`)
	}
}
