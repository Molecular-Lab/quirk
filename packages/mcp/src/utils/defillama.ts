/**
 * DeFiLlama API client for fetching protocol, TVL, and fee data
 * Base URL: https://api.llama.fi
 */

const BASE_URL = 'https://api.llama.fi';

export interface Protocol {
	id: string;
	name: string;
	address: string;
	symbol: string;
	url: string;
	description: string;
	chain: string;
	logo: string;
	audits?: string;
	audit_note?: string;
	gecko_id?: string;
	cmcId?: string;
	category: string;
	chains: string[];
	module: string;
	twitter?: string;
	forkedFrom?: string[];
	oracles?: string[];
	listedAt?: number;
	slug: string;
	tvl: number;
	chainTvls: Record<string, number>;
	change_1h?: number;
	change_1d?: number;
	change_7d?: number;
	fdv?: number;
	mcap?: number;
}

export interface ProtocolDetail extends Omit<Protocol, 'tvl'> {
	currentChainTvls: Record<string, number>;
	tvl: Array<{
		date: number;
		totalLiquidityUSD: number;
	}>;
	tokens: Record<string, { tvl: Array<{ date: number; totalLiquidityUSD: number }> }>;
}

export interface ChainTVL {
	gecko_id: string | null;
	tvl: number;
	tokenSymbol: string | null;
	cmcId: string | null;
	name: string;
	chainId?: number;
}

export interface FeeProtocol {
	total24h: number | null;
	total7d: number | null;
	total30d: number | null;
	revenue24h: number | null;
	revenue7d: number | null;
	revenue30d: number | null;
	dailyRevenue?: number;
	dailyFees?: number;
	dailyUserFees?: number;
	dailyHoldersRevenue?: number;
	dailyCreatorRevenue?: number;
	dailySupplySideRevenue?: number;
	dailyProtocolRevenue?: number;
}

export interface FeeOverview {
	totalDataChart: Array<[number, number]>;
	totalDataChartBreakdown: Array<[number, Record<string, number>]>;
	protocols: Record<string, FeeProtocol>;
}

export interface ProtocolFeeDetail {
	total24h: number | null;
	total7d: number | null;
	totalAllTime: number | null;
	revenue24h: number | null;
	revenue7d: number | null;
	revenueAllTime: number | null;
	name: string;
	logo?: string;
	chains: string[];
	methodologyURL?: string;
	methodology?: Record<string, { [key: string]: string }>;
	latestFetchIsOk?: boolean;
}

/**
 * Fetch all protocols with TVL data
 */
export async function getAllProtocols(): Promise<Protocol[]> {
	const response = await fetch(`${BASE_URL}/protocols`);
	if (!response.ok) {
		throw new Error(`Failed to fetch protocols: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch detailed information about a specific protocol
 */
export async function getProtocol(protocol: string): Promise<ProtocolDetail> {
	const response = await fetch(`${BASE_URL}/protocol/${protocol}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch protocol ${protocol}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch current TVL for a specific protocol
 */
export async function getProtocolTVL(protocol: string): Promise<number> {
	const response = await fetch(`${BASE_URL}/tvl/${protocol}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch TVL for ${protocol}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch TVL data for all chains
 */
export async function getAllChains(): Promise<ChainTVL[]> {
	const response = await fetch(`${BASE_URL}/v2/chains`);
	if (!response.ok) {
		throw new Error(`Failed to fetch chain TVLs: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch historical TVL data for a specific chain
 */
export async function getChainHistoricalTVL(
	chain: string
): Promise<Array<{ date: number; tvl: number }>> {
	const response = await fetch(`${BASE_URL}/v2/historicalChainTvl/${chain}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch historical TVL for ${chain}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch fees overview across all protocols
 */
export async function getFeesOverview(): Promise<FeeOverview> {
	const response = await fetch(`${BASE_URL}/overview/fees`);
	if (!response.ok) {
		throw new Error(`Failed to fetch fees overview: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch fees for a specific protocol
 */
export async function getProtocolFees(protocol: string): Promise<ProtocolFeeDetail> {
	const response = await fetch(`${BASE_URL}/summary/fees/${protocol}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch fees for ${protocol}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Calculate approximate APY from fee data
 * APY = (Annual Revenue / TVL) * 100
 */
export function calculateAPYFromFees(
	dailyRevenue: number,
	tvl: number
): number {
	if (tvl === 0) return 0;
	const annualRevenue = dailyRevenue * 365;
	return (annualRevenue / tvl) * 100;
}

/**
 * Filter protocols by minimum TVL
 */
export function filterByMinTVL(protocols: Protocol[], minTVL: number): Protocol[] {
	return protocols.filter((p) => p.tvl >= minTVL);
}

/**
 * Filter protocols by chain
 */
export function filterByChain(protocols: Protocol[], chain: string): Protocol[] {
	return protocols.filter((p) => p.chains.includes(chain));
}

/**
 * Sort protocols by TVL (descending)
 */
export function sortByTVL(protocols: Protocol[]): Protocol[] {
	return [...protocols].sort((a, b) => b.tvl - a.tvl);
}
