/**
 * AAVE V3 Pool Contract ABI (minimal - only methods we need)
 */
export const AAVE_POOL_ABI = [
	// Read methods
	{
		name: 'getReserveData',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [
			{
				name: '',
				type: 'tuple',
				components: [
					{ name: 'configuration', type: 'uint256' },
					{ name: 'liquidityIndex', type: 'uint128' },
					{ name: 'currentLiquidityRate', type: 'uint128' },
					{ name: 'variableBorrowIndex', type: 'uint128' },
					{ name: 'currentVariableBorrowRate', type: 'uint128' },
					{ name: 'currentStableBorrowRate', type: 'uint128' },
					{ name: 'lastUpdateTimestamp', type: 'uint40' },
					{ name: 'id', type: 'uint16' },
					{ name: 'aTokenAddress', type: 'address' },
					{ name: 'stableDebtTokenAddress', type: 'address' },
					{ name: 'variableDebtTokenAddress', type: 'address' },
					{ name: 'interestRateStrategyAddress', type: 'address' },
					{ name: 'accruedToTreasury', type: 'uint128' },
					{ name: 'unbacked', type: 'uint128' },
					{ name: 'isolationModeTotalDebt', type: 'uint128' },
				],
			},
		],
	},
	// Write methods
	{
		name: 'supply',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'asset', type: 'address' },
			{ name: 'amount', type: 'uint256' },
			{ name: 'onBehalfOf', type: 'address' },
			{ name: 'referralCode', type: 'uint16' },
		],
		outputs: [],
	},
	{
		name: 'withdraw',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'asset', type: 'address' },
			{ name: 'amount', type: 'uint256' },
			{ name: 'to', type: 'address' },
		],
		outputs: [{ name: '', type: 'uint256' }],
	},
] as const

/**
 * ERC20 ABI (minimal - for token operations)
 */
export const ERC20_ABI = [
	// Read methods
	{
		name: 'balanceOf',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'account', type: 'address' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'decimals',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint8' }],
	},
	{
		name: 'symbol',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'string' }],
	},
	{
		name: 'name',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'string' }],
	},
	{
		name: 'totalSupply',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'allowance',
		type: 'function',
		stateMutability: 'view',
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
		],
		outputs: [{ name: '', type: 'uint256' }],
	},
	// Write methods
	{
		name: 'approve',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ name: '', type: 'bool' }],
	},
	{
		name: 'transfer',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ name: '', type: 'bool' }],
	},
] as const

/**
 * AAVE Protocol Data Provider ABI (minimal - optional, for additional data)
 */
export const AAVE_DATA_PROVIDER_ABI = [
	{
		name: 'getUserReserveData',
		type: 'function',
		stateMutability: 'view',
		inputs: [
			{ name: 'asset', type: 'address' },
			{ name: 'user', type: 'address' },
		],
		outputs: [
			{ name: 'currentATokenBalance', type: 'uint256' },
			{ name: 'currentStableDebt', type: 'uint256' },
			{ name: 'currentVariableDebt', type: 'uint256' },
			{ name: 'principalStableDebt', type: 'uint256' },
			{ name: 'scaledVariableDebt', type: 'uint256' },
			{ name: 'stableBorrowRate', type: 'uint256' },
			{ name: 'liquidityRate', type: 'uint256' },
			{ name: 'stableRateLastUpdated', type: 'uint40' },
			{ name: 'usageAsCollateralEnabled', type: 'bool' },
		],
	},
	{
		name: 'getReserveTokensAddresses',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [
			{ name: 'aTokenAddress', type: 'address' },
			{ name: 'stableDebtTokenAddress', type: 'address' },
			{ name: 'variableDebtTokenAddress', type: 'address' },
		],
	},
] as const
