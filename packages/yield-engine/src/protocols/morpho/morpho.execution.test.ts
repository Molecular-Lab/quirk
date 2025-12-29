import { describe, it, expect } from 'vitest'
import { MorphoAdapter } from './morpho.adapter'
import { getTokenInfo } from './morpho.constants'

describe('Morpho Adapter - Write Methods', () => {
	const adapter = new MorphoAdapter(1) // Ethereum mainnet

	describe('prepareDeposit', () => {
		it('should encode ERC-4626 deposit transaction correctly', async () => {
			const tx = await adapter.prepareDeposit(
				'USDC',
				1,
				'1000000000', // 1000 USDC
				'0x1234567890123456789012345678901234567890',
			)

			const vaultConfig = getTokenInfo('USDC', 1)
			expect(tx.to).toBe(vaultConfig?.vaultAddress)
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			expect(tx.data).toBeDefined()
			// Function selector for deposit(uint256,address)
			expect(tx.data.startsWith('0x6e553f65')).toBe(true)
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
		it('should encode ERC-4626 withdraw transaction correctly', async () => {
			const tx = await adapter.prepareWithdrawal(
				'USDC',
				1,
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			const vaultConfig = getTokenInfo('USDC', 1)
			expect(tx.to).toBe(vaultConfig?.vaultAddress)
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			// Function selector for withdraw(uint256,address,address)
			expect(tx.data.startsWith('0xb460af94')).toBe(true)
		})
	})

	describe('prepareApproval', () => {
		it('should encode ERC20 approve transaction correctly', async () => {
			const vaultConfig = getTokenInfo('USDC', 1)
			const tx = await adapter.prepareApproval(
				'USDC',
				1,
				vaultConfig?.vaultAddress || '',
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			expect(tx.to).toBe(vaultConfig?.baseTokenAddress)
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
