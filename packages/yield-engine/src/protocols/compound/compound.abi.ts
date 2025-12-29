/**
 * Compound V3 (Comet) Contract ABI (minimal - only methods we need)
 */
export const COMET_ABI = [
	// Read methods
	{
		name: 'getSupplyRate',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'utilization', type: 'uint256' }],
		outputs: [{ name: '', type: 'uint64' }],
	},
	{
		name: 'getBorrowRate',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'utilization', type: 'uint256' }],
		outputs: [{ name: '', type: 'uint64' }],
	},
	{
		name: 'getUtilization',
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
		name: 'totalSupply',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'totalBorrow',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
	},
	{
		name: 'baseToken',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'address' }],
	},
	{
		name: 'decimals',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint8' }],
	},
	// Write methods
	{
		name: 'supply',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'asset', type: 'address' },
			{ name: 'amount', type: 'uint256' },
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
		],
		outputs: [],
	},
	{
		name: 'allow',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'manager', type: 'address' },
			{ name: 'isAllowed', type: 'bool' },
		],
		outputs: [],
	},
] as const

/**
 * ERC20 ABI (minimal - for token operations in Compound)
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
		name: 'decimals',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint8' }],
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

