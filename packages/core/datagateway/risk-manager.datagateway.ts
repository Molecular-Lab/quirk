import type { DeFiPosition } from "../entity/old/defi-position.entity"
import type { CreateRiskProfile, RiskProfile, RiskScore, UpdateRiskProfile } from "../entity/old/risk-profile.entity"
import type { YieldStrategy } from "../entity/old/yield-strategy.entity"

/**
 * Risk Manager DataGateway
 * Interface for risk management operations
 */
export interface IRiskManagerDataGateway {
	/**
	 * Create or update risk profile for a user
	 */
	setRiskProfile(params: { walletAddress: string; profile: CreateRiskProfile }): Promise<RiskProfile>

	/**
	 * Get risk profile by wallet address
	 */
	getRiskProfile(walletAddress: string): Promise<RiskProfile | null>

	/**
	 * Update existing risk profile
	 */
	updateRiskProfile(params: { walletAddress: string; updates: UpdateRiskProfile }): Promise<RiskProfile>

	/**
	 * Calculate risk score for current portfolio
	 */
	calculateRiskScore(params: { positions: DeFiPosition[]; riskProfile: RiskProfile }): Promise<RiskScore>

	/**
	 * Validate if a strategy matches user's risk profile
	 */
	validateStrategy(params: { strategy: YieldStrategy; riskProfile: RiskProfile }): Promise<{
		isValid: boolean
		reasons: string[]
		adjustments?: UpdateRiskProfile
	}>

	/**
	 * Get risk recommendations based on current portfolio
	 */
	getRiskRecommendations(params: { positions: DeFiPosition[]; riskProfile: RiskProfile }): Promise<{
		currentRisk: RiskScore
		recommendations: {
			priority: "high" | "medium" | "low"
			action: string
			reason: string
			impact: string
		}[]
	}>

	/**
	 * Calculate protocol risk score
	 */
	getProtocolRisk(protocol: string): Promise<{
		protocol: string
		riskScore: number
		factors: {
			auditScore: number
			tvl: string
			age: string
			exploitHistory: number
		}
	}>

	/**
	 * Check if portfolio exceeds risk limits
	 */
	checkRiskLimits(params: { positions: DeFiPosition[]; riskProfile: RiskProfile }): Promise<{
		withinLimits: boolean
		violations: {
			limit: string
			current: string
			maximum: string
		}[]
	}>
}
