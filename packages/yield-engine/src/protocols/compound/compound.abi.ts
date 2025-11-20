/**
 * Compound V3 (Comet) Contract ABI (minimal - only methods we need)
 */
export const COMET_ABI = [
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
] as const
