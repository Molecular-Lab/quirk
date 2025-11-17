import { z } from 'zod';
import {
	YieldOpportunitySchema,
	ImpermanentLossSchema,
} from '../types/index.js';
import {
	aprToApy,
	calculateImpermanentLoss,
	calculateRiskScore,
	rankOpportunities,
} from '../utils/calculations.js';
import {
	getAllProtocols,
	getProtocol,
	getAllChains,
	getFeesOverview,
	getProtocolFees,
	filterByMinTVL,
	filterByChain,
	sortByTVL,
	calculateAPYFromFees,
} from '../utils/defillama.js';

export const yieldTools = [
	{
		name: 'calculate_apy',
		description: 'Convert APR to APY based on compounding frequency',
		inputSchema: z.object({
			apr: z.number().describe('Annual Percentage Rate (as percentage)'),
			compoundingFrequency: z
				.number()
				.default(365)
				.describe('Number of times compounded per year'),
		}),
		handler: async (args: { apr: number; compoundingFrequency: number }) => {
			const apy = aprToApy(args.apr, args.compoundingFrequency);
			return {
				apr: args.apr,
				apy: apy.toFixed(2),
				compoundingFrequency: args.compoundingFrequency,
			};
		},
	},
	{
		name: 'calculate_impermanent_loss',
		description: 'Calculate impermanent loss for a liquidity pool position',
		inputSchema: ImpermanentLossSchema,
		handler: async (args: {
			asset1: string;
			asset2: string;
			priceChange1: number;
			priceChange2: number;
		}) => {
			const priceRatio = (1 + args.priceChange1 / 100) / (1 + args.priceChange2 / 100);
			const il = calculateImpermanentLoss(priceRatio);

			return {
				pair: `${args.asset1}/${args.asset2}`,
				priceChange1: `${args.priceChange1}%`,
				priceChange2: `${args.priceChange2}%`,
				impermanentLoss: `${il.toFixed(2)}%`,
			};
		},
	},
	{
		name: 'assess_protocol_risk',
		description: 'Assess risk level of a DeFi protocol using real-time TVL data',
		inputSchema: z.object({
			protocol: z.string().describe('Protocol slug (e.g., aave, compound)'),
			auditScore: z.number().min(0).max(100).optional(),
			age: z.number().optional().describe('Protocol age in days'),
		}),
		handler: async (args: {
			protocol: string;
			auditScore?: number;
			age?: number;
		}) => {
			// Fetch real TVL data from DeFiLlama
			let tvl: number | undefined;
			let protocolInfo;

			try {
				protocolInfo = await getProtocol(args.protocol);
				tvl = protocolInfo.tvl.length > 0
					? protocolInfo.tvl[protocolInfo.tvl.length - 1].totalLiquidityUSD
					: undefined;
			} catch (error) {
				// If protocol not found, continue with provided TVL
				tvl = undefined;
			}

			const riskScore = calculateRiskScore({
				tvl: tvl,
				age: args.age,
				auditScore: args.auditScore,
			});

			let riskLevel: string;
			if (riskScore < 30) riskLevel = 'Low';
			else if (riskScore < 60) riskLevel = 'Medium';
			else riskLevel = 'High';

			return {
				protocol: args.protocol,
				name: protocolInfo?.name,
				riskScore: riskScore.toFixed(0),
				riskLevel,
				factors: {
					tvl,
					age: args.age,
					auditScore: args.auditScore,
					chains: protocolInfo?.chains,
					category: protocolInfo?.category,
				},
			};
		},
	},
	{
		name: 'compare_yields',
		description: 'Compare multiple yield opportunities and rank them',
		inputSchema: z.object({
			opportunities: z.array(YieldOpportunitySchema).min(1),
		}),
		handler: async (args: {
			opportunities: Array<{
				protocol: string;
				asset: string;
				apy: number;
				tvl?: number;
				chain: string;
			}>;
		}) => {
			const ranked = rankOpportunities(args.opportunities);

			return {
				totalOpportunities: args.opportunities.length,
				ranked: ranked.map((r, idx) => ({
					rank: idx + 1,
					...r,
					score: r.score.toFixed(2),
				})),
			};
		},
	},
	{
		name: 'optimize_portfolio',
		description: 'Get portfolio optimization suggestions based on risk tolerance',
		inputSchema: z.object({
			currentHoldings: z.array(
				z.object({
					asset: z.string(),
					amount: z.number(),
					currentYield: z.number(),
				})
			),
			riskTolerance: z.enum(['low', 'medium', 'high']),
			targetYield: z.number().optional(),
		}),
		handler: async (args: {
			currentHoldings: Array<{
				asset: string;
				amount: number;
				currentYield: number;
			}>;
			riskTolerance: 'low' | 'medium' | 'high';
			targetYield?: number;
		}) => {
			// Placeholder implementation
			const totalValue = args.currentHoldings.reduce((sum, h) => sum + h.amount, 0);
			const avgYield =
				args.currentHoldings.reduce((sum, h) => sum + h.currentYield * h.amount, 0) /
				totalValue;

			return {
				currentPortfolio: {
					totalValue,
					averageYield: avgYield.toFixed(2),
					assets: args.currentHoldings.length,
				},
				riskTolerance: args.riskTolerance,
				suggestions: [
					'This is a placeholder suggestion',
					'Connect to real yield data sources for accurate recommendations',
					`Based on ${args.riskTolerance} risk tolerance, consider diversification`,
				],
			};
		},
	},
	{
		name: 'get_top_protocols',
		description: 'Get top DeFi protocols by TVL with optional filtering',
		inputSchema: z.object({
			limit: z.number().min(1).max(100).default(10).describe('Number of protocols to return'),
			minTVL: z.number().optional().describe('Minimum TVL in USD'),
			chain: z.string().optional().describe('Filter by blockchain (e.g., Ethereum, Arbitrum)'),
		}),
		handler: async (args: { limit: number; minTVL?: number; chain?: string }) => {
			let protocols = await getAllProtocols();

			// Apply filters
			if (args.minTVL) {
				protocols = filterByMinTVL(protocols, args.minTVL);
			}
			if (args.chain) {
				protocols = filterByChain(protocols, args.chain);
			}

			// Sort and limit
			const sorted = sortByTVL(protocols).slice(0, args.limit);

			return {
				count: sorted.length,
				totalProtocols: protocols.length,
				protocols: sorted.map((p) => ({
					name: p.name,
					slug: p.slug,
					tvl: p.tvl,
					change_1d: p.change_1d?.toFixed(2),
					change_7d: p.change_7d?.toFixed(2),
					chains: p.chains,
					category: p.category,
				})),
			};
		},
	},
	{
		name: 'get_protocol_details',
		description: 'Get detailed information about a specific protocol including TVL and chains',
		inputSchema: z.object({
			protocol: z.string().describe('Protocol slug (e.g., aave, uniswap)'),
		}),
		handler: async (args: { protocol: string }) => {
			const protocol = await getProtocol(args.protocol);

			// Get current TVL from the most recent data point
			const currentTVL = protocol.tvl.length > 0
				? protocol.tvl[protocol.tvl.length - 1].totalLiquidityUSD
				: 0;

			return {
				name: protocol.name,
				slug: protocol.slug,
				description: protocol.description,
				currentTVL,
				chains: protocol.chains,
				category: protocol.category,
				chainTvls: protocol.currentChainTvls,
				url: protocol.url,
				twitter: protocol.twitter,
				audits: protocol.audits,
			};
		},
	},
	{
		name: 'get_chain_tvls',
		description: 'Get TVL data for all blockchain networks',
		inputSchema: z.object({
			minTVL: z.number().optional().describe('Minimum TVL in USD'),
		}),
		handler: async (args: { minTVL?: number }) => {
			let chains = await getAllChains();

			// Filter by minimum TVL if specified
			if (args.minTVL !== undefined) {
				chains = chains.filter((c) => c.tvl >= args.minTVL!);
			}

			// Sort by TVL descending
			chains.sort((a, b) => b.tvl - a.tvl);

			return {
				count: chains.length,
				totalTVL: chains.reduce((sum, c) => sum + c.tvl, 0),
				chains: chains.map((c) => ({
					name: c.name,
					tvl: c.tvl,
					tokenSymbol: c.tokenSymbol,
					gecko_id: c.gecko_id,
				})),
			};
		},
	},
	{
		name: 'get_protocol_fees',
		description: 'Get fee and revenue data for a specific protocol',
		inputSchema: z.object({
			protocol: z.string().describe('Protocol slug (e.g., aave, uniswap)'),
		}),
		handler: async (args: { protocol: string }) => {
			const fees = await getProtocolFees(args.protocol);

			return {
				name: fees.name,
				total24h: fees.total24h,
				total7d: fees.total7d,
				totalAllTime: fees.totalAllTime,
				revenue24h: fees.revenue24h,
				revenue7d: fees.revenue7d,
				revenueAllTime: fees.revenueAllTime,
				chains: fees.chains,
				methodology: fees.methodology,
			};
		},
	},
	{
		name: 'get_top_fee_protocols',
		description: 'Get protocols with the highest fees/revenue',
		inputSchema: z.object({
			limit: z.number().min(1).max(50).default(10).describe('Number of protocols to return'),
			sortBy: z
				.enum(['fees24h', 'revenue24h', 'fees7d', 'revenue7d'])
				.default('fees24h')
				.describe('Metric to sort by'),
		}),
		handler: async (args: { limit: number; sortBy: string }) => {
			const overview = await getFeesOverview();

			// Convert protocols object to array and sort
			const protocols = Object.entries(overview.protocols)
				.map(([name, data]) => ({
					name,
					...data,
				}))
				.filter((p) => {
					// Filter out protocols with null values for the sort metric
					if (args.sortBy === 'fees24h') return p.total24h !== null;
					if (args.sortBy === 'revenue24h') return p.revenue24h !== null;
					if (args.sortBy === 'fees7d') return p.total7d !== null;
					if (args.sortBy === 'revenue7d') return p.revenue7d !== null;
					return true;
				})
				.sort((a, b) => {
					const aVal =
						args.sortBy === 'fees24h'
							? a.total24h || 0
							: args.sortBy === 'revenue24h'
								? a.revenue24h || 0
								: args.sortBy === 'fees7d'
									? a.total7d || 0
									: a.revenue7d || 0;
					const bVal =
						args.sortBy === 'fees24h'
							? b.total24h || 0
							: args.sortBy === 'revenue24h'
								? b.revenue24h || 0
								: args.sortBy === 'fees7d'
									? b.total7d || 0
									: b.revenue7d || 0;
					return bVal - aVal;
				})
				.slice(0, args.limit);

			return {
				count: protocols.length,
				sortedBy: args.sortBy,
				protocols: protocols.map((p) => ({
					name: p.name,
					fees24h: p.total24h,
					fees7d: p.total7d,
					revenue24h: p.revenue24h,
					revenue7d: p.revenue7d,
				})),
			};
		},
	},
	{
		name: 'find_best_yields',
		description:
			'Find protocols with the best estimated yields based on fees/TVL ratio',
		inputSchema: z.object({
			limit: z.number().min(1).max(50).default(10).describe('Number of protocols to return'),
			minTVL: z
				.number()
				.default(1000000)
				.describe('Minimum TVL in USD to filter reliable protocols'),
			chain: z.string().optional().describe('Filter by blockchain'),
		}),
		handler: async (args: { limit: number; minTVL: number; chain?: string }) => {
			// Fetch both protocols and fees data
			const [protocols, feesOverview] = await Promise.all([
				getAllProtocols(),
				getFeesOverview(),
			]);

			// Filter protocols by TVL and chain
			let filtered = filterByMinTVL(protocols, args.minTVL);
			if (args.chain) {
				filtered = filterByChain(filtered, args.chain);
			}

			// Calculate estimated APY for each protocol based on fees/TVL
			const withYields = filtered
				.map((protocol) => {
					const feeData = feesOverview.protocols[protocol.name];
					if (!feeData || !feeData.revenue24h) {
						return null;
					}

					const estimatedAPY = calculateAPYFromFees(feeData.revenue24h, protocol.tvl);

					return {
						name: protocol.name,
						slug: protocol.slug,
						tvl: protocol.tvl,
						chains: protocol.chains,
						category: protocol.category,
						dailyRevenue: feeData.revenue24h,
						estimatedAPY,
					};
				})
				.filter((p) => p !== null)
				.sort((a, b) => b!.estimatedAPY - a!.estimatedAPY)
				.slice(0, args.limit);

			return {
				count: withYields.length,
				minTVL: args.minTVL,
				chain: args.chain,
				opportunities: withYields.map((p) => ({
					name: p!.name,
					slug: p!.slug,
					tvl: p!.tvl,
					chains: p!.chains,
					category: p!.category,
					dailyRevenue: p!.dailyRevenue,
					estimatedAPY: p!.estimatedAPY.toFixed(2) + '%',
				})),
			};
		},
	},
];
