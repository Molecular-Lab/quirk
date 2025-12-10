/**
 * AAVE Protocol DataGateway
 * Interface for AAVE V3 lending protocol operations
 */
export interface IAAVEDataGateway {
	/**
	 * Deposit assets to AAVE lending pool
	 * @returns Transaction data to be signed and sent
	 */
	deposit(params: {
		walletAddress: string
		tokenAddress: string
		amount: string // Wei/smallest unit as string
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Withdraw assets from AAVE lending pool
	 */
	withdraw(params: {
		walletAddress: string
		tokenAddress: string
		amount: string // Wei amount or -1 for max
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Get user's position in AAVE
	 */
	getPosition(params: { walletAddress: string; chainId: number }): Promise<{
		totalSupplied: string // Total supplied in USD
		totalBorrowed: string // Total borrowed in USD
		healthFactor: string
		netAPY: string
		positions: {
			tokenAddress: string
			tokenSymbol: string
			supplied: string
			supplyAPY: string
			borrowed: string
			borrowAPY: string
		}[]
	}>

	/**
	 * Get current supply APY for a token
	 */
	getSupplyAPY(params: { tokenAddress: string; chainId: number }): Promise<string>

	/**
	 * Claim AAVE rewards
	 */
	claimRewards(params: { walletAddress: string; chainId: number }): Promise<{
		to: string
		data: string
		value: string
	}>
}

/**
 * Curve Protocol DataGateway
 * Interface for Curve stable swap pool operations
 */
export interface ICurveDataGateway {
	/**
	 * Deposit to Curve pool
	 */
	depositToPool(params: {
		walletAddress: string
		poolAddress: string
		tokens: string[] // Token addresses
		amounts: string[] // Amounts in wei
		minLPTokens: string // Minimum LP tokens to receive (slippage protection)
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Withdraw from Curve pool
	 */
	withdrawFromPool(params: {
		walletAddress: string
		poolAddress: string
		lpTokenAmount: string
		minAmounts: string[] // Minimum amounts to receive for each token
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Get pool APY (base + CRV rewards)
	 */
	getPoolAPY(params: { poolAddress: string; chainId: number }): Promise<{
		baseAPY: string
		crvAPY: string
		totalAPY: string
	}>

	/**
	 * Get user's position in Curve pool
	 */
	getPosition(params: { walletAddress: string; poolAddress: string; chainId: number }): Promise<{
		lpTokenBalance: string
		underlyingBalances: {
			tokenAddress: string
			tokenSymbol: string
			amount: string
		}[]
		valueUSD: string
	}>

	/**
	 * Get list of available Curve pools for a token
	 */
	getPoolsForToken(params: { tokenAddress: string; chainId: number }): Promise<
		{
			poolAddress: string
			name: string
			tvl: string
			apy: string
			tokens: string[]
		}[]
	>
}

/**
 * Compound Protocol DataGateway
 * Interface for Compound V3 (Comet) operations
 */
export interface ICompoundDataGateway {
	/**
	 * Supply assets to Compound
	 */
	supply(params: { walletAddress: string; tokenAddress: string; amount: string; chainId: number }): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Redeem (withdraw) assets from Compound
	 */
	redeem(params: {
		walletAddress: string
		tokenAddress: string
		amount: string // Amount or -1 for max
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Get supply APY for a token
	 */
	getSupplyAPY(params: { tokenAddress: string; chainId: number }): Promise<string>

	/**
	 * Get user's position in Compound
	 */
	getPosition(params: { walletAddress: string; chainId: number }): Promise<{
		totalSupplied: string
		supplyAPY: string
		compRewards: string
		positions: {
			tokenAddress: string
			tokenSymbol: string
			supplied: string
			apy: string
		}[]
	}>

	/**
	 * Claim COMP rewards
	 */
	claimRewards(params: { walletAddress: string; chainId: number }): Promise<{
		to: string
		data: string
		value: string
	}>
}

/**
 * Uniswap V3 Protocol DataGateway
 * Interface for Uniswap V3 liquidity provision
 */
export interface IUniswapDataGateway {
	/**
	 * Add liquidity to Uniswap V3 pool
	 */
	addLiquidity(params: {
		walletAddress: string
		token0Address: string
		token1Address: string
		amount0: string
		amount1: string
		feeTier: number // 100, 500, 3000, 10000 (0.01%, 0.05%, 0.3%, 1%)
		tickLower: number
		tickUpper: number
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Remove liquidity from Uniswap V3 pool
	 */
	removeLiquidity(params: {
		walletAddress: string
		positionId: string // NFT token ID
		liquidity: string // Amount of liquidity to remove
		chainId: number
	}): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Collect fees from Uniswap V3 position
	 */
	collectFees(params: { walletAddress: string; positionId: string; chainId: number }): Promise<{
		to: string
		data: string
		value: string
	}>

	/**
	 * Get user's Uniswap V3 positions
	 */
	getPosition(params: { walletAddress: string; positionId: string; chainId: number }): Promise<{
		positionId: string
		token0: string
		token1: string
		liquidity: string
		feeTier: number
		tickLower: number
		tickUpper: number
		uncollectedFees: {
			token0: string
			token1: string
		}
		valueUSD: string
	}>

	/**
	 * Get pool APY (fees + potential IL)
	 */
	getPoolAPY(params: { token0Address: string; token1Address: string; feeTier: number; chainId: number }): Promise<{
		feeAPY: string
		volumeUSD24h: string
		tvl: string
	}>

	/**
	 * Get all positions for a wallet
	 */
	getAllPositions(params: { walletAddress: string; chainId: number }): Promise<
		{
			positionId: string
			token0Symbol: string
			token1Symbol: string
			valueUSD: string
			apy: string
		}[]
	>
}
