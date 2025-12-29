/**
 * MetaMorpho Vault ABI (ERC-4626 compliant)
 * Minimal ABI - only methods we need
 */
export const METAMORPHO_VAULT_ABI = [
	// Read methods
	{
		name: 'totalAssets',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'totalSupply',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'balanceOf',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'account', type: 'address' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'convertToAssets',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'shares', type: 'uint256' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'convertToShares',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'assets', type: 'uint256' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'asset',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'address' }],
	},
	// Write methods (ERC-4626)
	{
		name: 'deposit',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'assets', type: 'uint256' },
			{ name: 'receiver', type: 'address' },
		],
		outputs: [{ name: 'shares', type: 'uint256' }],
	},
	{
		name: 'redeem',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'shares', type: 'uint256' },
			{ name: 'receiver', type: 'address' },
			{ name: 'owner', type: 'address' },
		],
		outputs: [{ name: 'assets', type: 'uint256' }],
	},
	{
		name: 'withdraw',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'assets', type: 'uint256' },
			{ name: 'receiver', type: 'address' },
			{ name: 'owner', type: 'address' },
		],
		outputs: [{ name: 'shares', type: 'uint256' }],
	},
] as const

/**
 * Morpho Blue Core ABI (minimal - only methods we need)
 */
export const MORPHO_BLUE_ABI = [
	{
		name: 'market',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'id', type: 'bytes32' }],
		outputs: [
			{
				name: '',
				type: 'tuple',
				components: [
					{ name: 'totalSupplyAssets', type: 'uint128' },
					{ name: 'totalSupplyShares', type: 'uint128' },
					{ name: 'totalBorrowAssets', type: 'uint128' },
					{ name: 'totalBorrowShares', type: 'uint128' },
					{ name: 'lastUpdate', type: 'uint128' },
					{ name: 'fee', type: 'uint128' },
				],
			},
		],
	},
	{
		name: 'position',
		type: 'function',
		stateMutability: 'view',
		inputs: [
			{ name: 'id', type: 'bytes32' },
			{ name: 'user', type: 'address' },
		],
		outputs: [
			{
				name: '',
				type: 'tuple',
				components: [
					{ name: 'supplyShares', type: 'uint256' },
					{ name: 'borrowShares', type: 'uint128' },
					{ name: 'collateral', type: 'uint128' },
				],
			},
		],
	},
] as const

/**
 * ERC20 ABI (minimal - for token operations in Morpho)
 */
export const ERC20_ABI = [
	{
		name: 'balanceOf',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'account', type: 'address' }],
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
] as const

