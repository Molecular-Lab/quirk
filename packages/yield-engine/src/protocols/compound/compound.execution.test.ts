import { describe, it, expect } from 'vitest'
import { CompoundAdapter } from './compound.adapter'
import { getTokenInfo } from './compound.constants'

describe('Compound Adapter - Write Methods', () => {
	const adapter = new CompoundAdapter(1) // Ethereum mainnet

	describe('prepareDeposit', () => {
		it('should encode deposit transaction correctly', async () => {
			const tx = await adapter.prepareDeposit(
				'USDC',
				1,
				'1000000000', // 1000 USDC
				'0x1234567890123456789012345678901234567890',
			)

			const marketConfig = getTokenInfo('USDC', 1)
			expect(tx.to).toBe(marketConfig?.cometAddress)
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			expect(tx.data).toBeDefined()
			// Function selector for supply(address,uint256)
			expect(tx.data.startsWith('0xf2b9fdb8')).toBe(true)
		})

		it('should throw for unsupported token', async () => {
			await expect(
				adapter.prepareDeposit(
					'INVALID_TOKEN',
					1,
					'1000000000',
					'0x1234567890123456789012345678901234567890',
				),
			).rejects.toThrow('not supported')
		})
	})

	describe('prepareWithdrawal', () => {
		it('should encode withdrawal transaction correctly', async () => {
			const tx = await adapter.prepareWithdrawal(
				'USDC',
				1,
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			const marketConfig = getTokenInfo('USDC', 1)
			expect(tx.to).toBe(marketConfig?.cometAddress)
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			// Function selector for withdraw(address,uint256)
			expect(tx.data.startsWith('0xf3fef3a3')).toBe(true)
		})
	})

	describe('prepareApproval', () => {
		it('should encode ERC20 approve transaction correctly', async () => {
			const marketConfig = getTokenInfo('USDC', 1)
			const tx = await adapter.prepareApproval(
				'USDC',
				1,
				marketConfig?.cometAddress || '',
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			expect(tx.to).toBe(marketConfig?.baseTokenAddress)
			expect(tx.chainId).toBe(1)
			// Function selector for approve(address,uint256)
			expect(tx.data.startsWith('0x095ea7b3')).toBe(true)
		})
	})

	describe('estimateDepositGas', () => {
		it('should return a gas estimate', async () => {
			const gas = await adapter.estimateDepositGas(
				'USDC',
				1,
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			expect(typeof gas).toBe('bigint')
			expect(gas).toBeGreaterThan(0n)
		})
	})
})
