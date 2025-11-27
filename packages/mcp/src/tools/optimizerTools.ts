import { z } from 'zod';
import { YieldOptimizer } from '@proxify/yield-engine';

// Create a shared optimizer instance
const optimizer = new YieldOptimizer();

export const optimizerTools = [
	{
		name: 'optimize_position',
		description:
			"Analyze a user's position and get smart optimization recommendations with ranked opportunities",
		inputSchema: z.object({
			walletAddress: z
				.string()
				.regex(/^0x[a-fA-F0-9]{40}$/)
				.describe('User wallet address (0x...)'),
			token: z.string().describe('Token symbol (e.g., USDC, USDT)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
			riskLevel: z
				.enum(['conservative', 'moderate', 'aggressive'])
				.optional()
				.describe('Risk tolerance level (default: moderate)'),
			strategy: z
				.enum(['highest-yield', 'risk-adjusted', 'gas-aware'])
				.optional()
				.describe('Optimization strategy to use (default: highest-yield)'),
		}),
		handler: async (args: {
			walletAddress: string;
			token: string;
			chainId: number;
			riskLevel?: 'conservative' | 'moderate' | 'aggressive';
			strategy?: 'highest-yield' | 'risk-adjusted' | 'gas-aware';
		}) => {
			const riskProfile = args.riskLevel ? { level: args.riskLevel } : undefined;

			const result = await optimizer.optimizePosition(
				args.walletAddress,
				args.token,
				args.chainId,
				riskProfile as any,
				args.strategy
			);

			return {
				action: result.action,
				strategy: result.strategy,
				current: result.currentProtocol
					? {
							protocol: result.currentProtocol,
							apy: `${result.currentAPY}%`,
					  }
					: null,
				recommended: result.recommendedProtocol
					? {
							protocol: result.recommendedProtocol,
							apy: `${result.recommendedAPY}%`,
					  }
					: null,
				apyImprovement: `${result.apyDelta}%`,
				estimatedGains: {
					monthly: `$${result.estimatedMonthlyGain}`,
					annual: `$${result.estimatedAnnualGain}`,
				},
				estimatedGasCost: result.estimatedGasCost ? `$${result.estimatedGasCost}` : null,
				netGainAfterGas: result.netGainAfterGas ? `$${result.netGainAfterGas}` : null,
				confidence: `${result.confidence}%`,
				reason: result.reason,
				warnings: result.warnings,
				rankedOpportunities: result.rankedOpportunities.slice(0, 5).map((opp) => ({
					protocol: opp.protocol,
					token: opp.token,
					supplyAPY: `${opp.supplyAPY}%`,
				})),
			};
		},
	},
	{
		name: 'compare_position',
		description: 'Compare a current position against all available opportunities to see potential improvements',
		inputSchema: z.object({
			protocol: z.enum(['aave', 'compound', 'morpho']).describe('Current protocol'),
			token: z.string().describe('Token symbol (e.g., USDC, USDT)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
			amount: z.string().describe('Position amount in token units (e.g., "1000.50")'),
			currentAPY: z.string().describe('Current APY as a percentage (e.g., "5.25")'),
		}),
		handler: async (args: {
			protocol: 'aave' | 'compound' | 'morpho';
			token: string;
			chainId: number;
			amount: string;
			currentAPY: string;
		}) => {
			// Create a mock position for comparison
			const mockPosition = {
				protocol: args.protocol,
				token: args.token,
				tokenAddress: '0x0000000000000000000000000000000000000000', // Mock address
				chainId: args.chainId,
				amount: '0', // Not used in comparison
				amountFormatted: args.amount,
				valueUSD: args.amount, // Simplified: assume 1:1 for stablecoins
				apy: args.currentAPY,
			};

			const result = await optimizer.comparePosition(mockPosition as any, args.token, args.chainId);

			if (!result) {
				return {
					message: 'No opportunities found for comparison',
				};
			}

			return {
				current: {
					protocol: result.currentProtocol,
					apy: `${result.currentAPY}%`,
				},
				recommended: {
					protocol: result.recommendedProtocol,
					apy: `${result.recommendedAPY}%`,
				},
				improvement: {
					apyDelta: `${result.apyDelta}%`,
					percentImprovement: `${result.apyImprovementPercent}%`,
				},
				estimatedGains: {
					monthly: `$${result.estimatedMonthlyGainUSD}`,
					annual: `$${result.estimatedAnnualGainUSD}`,
				},
				recommendation:
					parseFloat(result.apyDelta) > 0
						? `Consider moving to ${result.recommendedProtocol} for ${result.apyDelta}% better APY`
						: 'Current position is already optimal',
			};
		},
	},
	{
		name: 'get_rebalance_recommendation',
		description:
			'Get detailed rebalancing recommendation with gas cost analysis and break-even calculations',
		inputSchema: z.object({
			protocol: z.enum(['aave', 'compound', 'morpho']).describe('Current protocol'),
			token: z.string().describe('Token symbol (e.g., USDC, USDT)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
			amount: z.string().describe('Position amount in token units (e.g., "1000.50")'),
			currentAPY: z.string().describe('Current APY as a percentage (e.g., "5.25")'),
			gasPriceGwei: z
				.number()
				.optional()
				.describe('Current gas price in gwei (e.g., 30)'),
			ethPriceUSD: z
				.number()
				.optional()
				.describe('Current ETH price in USD (e.g., 3500)'),
			minApyDelta: z
				.number()
				.optional()
				.describe('Minimum APY improvement required (default: 1.0%)'),
		}),
		handler: async (args: {
			protocol: 'aave' | 'compound' | 'morpho';
			token: string;
			chainId: number;
			amount: string;
			currentAPY: string;
			gasPriceGwei?: number;
			ethPriceUSD?: number;
			minApyDelta?: number;
		}) => {
			// Create a mock position for recommendation
			const mockPosition = {
				protocol: args.protocol,
				token: args.token,
				tokenAddress: '0x0000000000000000000000000000000000000000', // Mock address
				chainId: args.chainId,
				amount: '0',
				amountFormatted: args.amount,
				valueUSD: args.amount,
				apy: args.currentAPY,
			};

			const rebalanceConfig = args.minApyDelta
				? { minApyDelta: args.minApyDelta }
				: undefined;

			const result = await optimizer.getRebalanceRecommendation(
				mockPosition as any,
				args.token,
				args.chainId,
				rebalanceConfig,
				args.gasPriceGwei,
				args.ethPriceUSD
			);

			return {
				action: result.action,
				strategy: result.strategy,
				current: {
					protocol: result.currentProtocol,
					apy: `${result.currentAPY}%`,
				},
				recommended: result.recommendedProtocol
					? {
							protocol: result.recommendedProtocol,
							apy: `${result.recommendedAPY}%`,
					  }
					: null,
				apyImprovement: `${result.apyDelta}%`,
				gasCostAnalysis: {
					estimatedCost: result.estimatedGasCost ? `$${result.estimatedGasCost}` : 'N/A',
					netGainAfterGas: result.netGainAfterGas ? `$${result.netGainAfterGas}` : 'N/A',
				},
				projectedGains: {
					monthly: `$${result.estimatedMonthlyGain}`,
					annual: `$${result.estimatedAnnualGain}`,
				},
				confidence: `${result.confidence}%`,
				reason: result.reason,
				warnings: result.warnings,
			};
		},
	},
	{
		name: 'is_rebalance_worth_it',
		description:
			'Quick check if rebalancing is financially worth it after accounting for gas costs',
		inputSchema: z.object({
			currentAPY: z.string().describe('Current APY as a percentage (e.g., "5.25")'),
			newAPY: z.string().describe('New APY as a percentage (e.g., "6.80")'),
			positionValueUSD: z.string().describe('Position value in USD (e.g., "10000")'),
			estimatedGasCostUSD: z.string().describe('Estimated gas cost in USD (e.g., "25")'),
			minApyDelta: z
				.number()
				.optional()
				.describe('Minimum APY improvement required (default: 1.0%)'),
			maxGasCostUSD: z
				.string()
				.optional()
				.describe('Maximum acceptable gas cost (default: "50")'),
		}),
		handler: async (args: {
			currentAPY: string;
			newAPY: string;
			positionValueUSD: string;
			estimatedGasCostUSD: string;
			minApyDelta?: number;
			maxGasCostUSD?: string;
		}) => {
			const config = {
				minApyDelta: args.minApyDelta,
				maxGasCostUSD: args.maxGasCostUSD,
			};

			const worthIt = optimizer.isRebalanceWorthIt(
				args.currentAPY,
				args.newAPY,
				args.positionValueUSD,
				args.estimatedGasCostUSD,
				config
			);

			const apyDelta = (parseFloat(args.newAPY) - parseFloat(args.currentAPY)).toFixed(2);
			const annualGain =
				(parseFloat(apyDelta) / 100) * parseFloat(args.positionValueUSD);
			const netGain = annualGain - parseFloat(args.estimatedGasCostUSD);

			return {
				worthIt,
				analysis: {
					currentAPY: `${args.currentAPY}%`,
					newAPY: `${args.newAPY}%`,
					apyImprovement: `${apyDelta}%`,
					positionValue: `$${parseFloat(args.positionValueUSD).toLocaleString()}`,
					gasCost: `$${parseFloat(args.estimatedGasCostUSD).toLocaleString()}`,
					estimatedAnnualGain: `$${annualGain.toFixed(2)}`,
					netGainAfterGas: `$${netGain.toFixed(2)}`,
				},
				recommendation: worthIt
					? `✅ Rebalancing is recommended. Net annual gain: $${netGain.toFixed(2)}`
					: `❌ Rebalancing not recommended. Gas cost too high relative to gains.`,
			};
		},
	},
	{
		name: 'estimate_break_even_days',
		description:
			'Calculate how many days it will take to recover gas costs through improved APY',
		inputSchema: z.object({
			apyDelta: z.string().describe('APY improvement in percentage points (e.g., "1.5")'),
			positionValueUSD: z.string().describe('Position value in USD (e.g., "10000")'),
			gasCostUSD: z.string().describe('Gas cost in USD (e.g., "25")'),
		}),
		handler: async (args: {
			apyDelta: string;
			positionValueUSD: string;
			gasCostUSD: string;
		}) => {
			const breakEvenDays = optimizer.estimateBreakEvenDays(
				args.apyDelta,
				args.positionValueUSD,
				args.gasCostUSD
			);

			const dailyGain =
				(parseFloat(args.apyDelta) / 365 / 100) * parseFloat(args.positionValueUSD);

			return {
				breakEvenDays:
					breakEvenDays === Infinity ? 'Never (APY delta is zero or negative)' : breakEvenDays,
				analysis: {
					apyImprovement: `${args.apyDelta}%`,
					positionValue: `$${parseFloat(args.positionValueUSD).toLocaleString()}`,
					gasCost: `$${parseFloat(args.gasCostUSD).toLocaleString()}`,
					dailyGain: `$${dailyGain.toFixed(2)}`,
				},
				recommendation:
					breakEvenDays === Infinity
						? '❌ Cannot recover gas costs'
						: breakEvenDays <= 30
							? `✅ Good rebalance opportunity. Break even in ${breakEvenDays} days`
							: breakEvenDays <= 90
								? `⚠️  Moderate opportunity. Break even in ${breakEvenDays} days`
								: `❌ Poor opportunity. Takes ${breakEvenDays} days to break even`,
			};
		},
	},
];
