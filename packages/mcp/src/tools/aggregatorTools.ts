import { z } from 'zod';
import { YieldAggregator } from '@proxify/yield-engine';

// Create a shared aggregator instance
const aggregator = new YieldAggregator();

export const aggregatorTools = [
	{
		name: 'fetch_all_opportunities',
		description:
			'Fetch and compare yield opportunities across all protocols (AAVE, Compound, Morpho) for a specific token',
		inputSchema: z.object({
			token: z.string().describe('Token symbol (e.g., USDC, USDT)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
			minAPY: z.string().optional().describe('Minimum APY to include (e.g., "3.0" for 3%)'),
			minTVL: z
				.string()
				.optional()
				.describe('Minimum TVL in USD (e.g., "1000000" for $1M)'),
			limit: z
				.number()
				.optional()
				.describe('Maximum number of results to return (default: all)'),
		}),
		handler: async (args: {
			token: string;
			chainId: number;
			minAPY?: string;
			minTVL?: string;
			limit?: number;
		}) => {
			const filter = {
				minAPY: args.minAPY,
				minTVL: args.minTVL,
				limit: args.limit,
			};

			const result = await aggregator.fetchAllOpportunities(
				args.token,
				args.chainId,
				Object.keys(filter).length > 0 ? filter : undefined
			);

			return {
				token: args.token,
				chainId: args.chainId,
				opportunities: result.opportunities,
				best: result.best,
				worst: result.worst,
				apySpread: `${result.apySpread}%`,
				summary: {
					totalOpportunities: result.opportunities.length,
					successfulProtocols: result.successfulProtocols,
					failedProtocols: result.failedProtocols,
				},
				errors: result.errors,
			};
		},
	},
	{
		name: 'get_best_opportunity',
		description:
			'Get the single best yield opportunity (highest APY) for a token across all protocols',
		inputSchema: z.object({
			token: z.string().describe('Token symbol (e.g., USDC, USDT)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
		}),
		handler: async (args: { token: string; chainId: number }) => {
			const best = await aggregator.getBestOpportunity(args.token, args.chainId);

			if (!best) {
				return {
					token: args.token,
					chainId: args.chainId,
					best: null,
					message: 'No opportunities found for this token on this chain',
				};
			}

			return {
				token: args.token,
				chainId: args.chainId,
				protocol: best.protocol,
				supplyAPY: `${best.supplyAPY}%`,
				borrowAPY: best.borrowAPY ? `${best.borrowAPY}%` : 'N/A',
				tvl: `$${parseFloat(best.tvl).toLocaleString()}`,
				liquidity: `$${parseFloat(best.liquidity).toLocaleString()}`,
			};
		},
	},
	{
		name: 'get_all_user_positions',
		description:
			"Get a user's positions across all DeFi protocols (AAVE, Compound, Morpho) with aggregated metrics",
		inputSchema: z.object({
			walletAddress: z
				.string()
				.regex(/^0x[a-fA-F0-9]{40}$/)
				.describe('User wallet address (0x...)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
			tokens: z
				.array(z.string())
				.optional()
				.describe('Tokens to check (default: [USDC, USDT])'),
		}),
		handler: async (args: {
			walletAddress: string;
			chainId: number;
			tokens?: string[];
		}) => {
			const result = await aggregator.getAllPositions(
				args.walletAddress,
				args.chainId,
				args.tokens
			);

			return {
				walletAddress: args.walletAddress,
				chainId: args.chainId,
				summary: {
					totalValueUSD: `$${parseFloat(result.totalValueUSD).toLocaleString()}`,
					weightedAvgAPY: `${result.weightedAvgAPY}%`,
					totalYieldEarned: `$${parseFloat(result.totalYieldEarned).toLocaleString()}`,
					protocolCount: result.protocolCount,
					positionCount: result.positions.length,
				},
				bestPosition: result.bestPosition
					? {
							protocol: result.bestPosition.protocol,
							token: result.bestPosition.token,
							apy: `${result.bestPosition.apy}%`,
							valueUSD: `$${parseFloat(result.bestPosition.valueUSD).toLocaleString()}`,
					  }
					: null,
				positions: result.positions.map((p) => ({
					protocol: p.protocol,
					token: p.token,
					amount: p.amountFormatted,
					valueUSD: `$${parseFloat(p.valueUSD).toLocaleString()}`,
					apy: `${p.apy}%`,
					earnedYield: p.earnedYield ? `$${parseFloat(p.earnedYield).toLocaleString()}` : 'N/A',
				})),
			};
		},
	},
	{
		name: 'get_aggregated_metrics',
		description:
			'Get aggregated metrics across all protocols for a specific chain (TVL, APY, health)',
		inputSchema: z.object({
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
		}),
		handler: async (args: { chainId: number }) => {
			const result = await aggregator.getAggregatedMetrics(args.chainId);

			return {
				chainId: args.chainId,
				summary: {
					totalTVL: `$${parseFloat(result.totalTVLUSD).toLocaleString()}`,
					totalLiquidity: `$${parseFloat(result.totalAvailableLiquidityUSD).toLocaleString()}`,
					weightedAvgSupplyAPY: `${result.weightedAvgSupplyAPY}%`,
					bestSupplyAPY: `${result.bestSupplyAPY}%`,
					bestProtocol: result.bestProtocol,
					healthyProtocols: `${result.healthyProtocolCount}/${result.totalProtocolCount}`,
				},
				protocolMetrics: result.protocolMetrics.map((m) => ({
					protocol: m.protocol,
					tvlUSD: `$${parseFloat(m.tvlUSD).toLocaleString()}`,
					avgSupplyAPY: `${m.avgSupplyAPY}%`,
					availableLiquidity: `$${parseFloat(m.availableLiquidityUSD).toLocaleString()}`,
					isHealthy: m.isHealthy,
				})),
			};
		},
	},
	{
		name: 'compare_protocols',
		description:
			'Directly compare yield opportunities between two specific protocols for a token',
		inputSchema: z.object({
			token: z.string().describe('Token symbol (e.g., USDC, USDT)'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
			protocol1: z.enum(['aave', 'compound', 'morpho']).describe('First protocol to compare'),
			protocol2: z
				.enum(['aave', 'compound', 'morpho'])
				.describe('Second protocol to compare'),
		}),
		handler: async (args: {
			token: string;
			chainId: number;
			protocol1: 'aave' | 'compound' | 'morpho';
			protocol2: 'aave' | 'compound' | 'morpho';
		}) => {
			const result = await aggregator.compareProtocols(
				args.token,
				args.chainId,
				args.protocol1,
				args.protocol2
			);

			return {
				token: args.token,
				chainId: args.chainId,
				winner: result.winner,
				apyDifference: `${result.apyDifference}%`,
				protocol1: result.protocol1
					? {
							protocol: result.protocol1.protocol,
							supplyAPY: `${result.protocol1.supplyAPY}%`,
							tvl: `$${parseFloat(result.protocol1.tvl).toLocaleString()}`,
					  }
					: null,
				protocol2: result.protocol2
					? {
							protocol: result.protocol2.protocol,
							supplyAPY: `${result.protocol2.supplyAPY}%`,
							tvl: `$${parseFloat(result.protocol2.tvl).toLocaleString()}`,
					  }
					: null,
				recommendation:
					result.winner === args.protocol1
						? `${args.protocol1} offers better yield by ${result.apyDifference}%`
						: `${args.protocol2} offers better yield by ${result.apyDifference}%`,
			};
		},
	},
	{
		name: 'fetch_opportunities_for_tokens',
		description:
			'Fetch yield opportunities for multiple tokens at once and return all opportunities sorted by APY',
		inputSchema: z.object({
			tokens: z
				.array(z.string())
				.min(1)
				.describe('Array of token symbols (e.g., ["USDC", "USDT"])'),
			chainId: z
				.number()
				.describe('Chain ID (1=Ethereum, 137=Polygon, 8453=Base, 42161=Arbitrum)'),
		}),
		handler: async (args: { tokens: string[]; chainId: number }) => {
			const opportunities = await aggregator.fetchOpportunitiesForTokens(
				args.tokens,
				args.chainId
			);

			return {
				tokens: args.tokens,
				chainId: args.chainId,
				totalOpportunities: opportunities.length,
				opportunities: opportunities.map((opp) => ({
					protocol: opp.protocol,
					token: opp.token,
					supplyAPY: `${opp.supplyAPY}%`,
					tvl: `$${parseFloat(opp.tvl).toLocaleString()}`,
					liquidity: `$${parseFloat(opp.liquidity).toLocaleString()}`,
				})),
			};
		},
	},
];
