/**
 * Client (Product Owner) Types
 * Based on PRODUCT_OWNER_FLOW.md - clients table schema
 */

export type RiskTier = "low" | "moderate" | "high"

export interface Client {
	id: string
	productId: string
	companyName: string
	privyUserId: string
	custodialWalletAddress: string
	apiKey: string
	riskTier: RiskTier
	isActive: boolean
	createdAt: string
}

export interface CreateClientRequest {
	companyName: string
	productId: string
	riskTier: RiskTier
}

export interface UpdateClientRequest {
	companyName?: string
	riskTier?: RiskTier
	isActive?: boolean
}
