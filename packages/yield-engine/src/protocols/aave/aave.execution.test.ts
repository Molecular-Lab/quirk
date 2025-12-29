import { describe, it, expect } from 'vitest'
import { AaveAdapter } from './aave.adapter'
import { getPoolAddress, getTokenAddress } from './aave.constants'

describe('AAVE Adapter - Write Methods', () => {
	const adapter = new AaveAdapter(1) // Ethereum mainnet

	describe('prepareDeposit', () => {
		it('should encode deposit transaction correctly', async () => {
			const tx = await adapter.prepareDeposit(
				'USDC',
				1,
				'1000000000', // 1000 USDC
				'0x1234567890123456789012345678901234567890',
			)

			expect(tx.to).toBe(getPoolAddress(1))
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			expect(tx.data).toBeDefined()
			// Function selector for supply(address,uint256,address,uint16)
			expect(tx.data.startsWith('0x617ba037')).toBe(true)
		})

		it('should include correct token address in calldata', async () => {
			const tx = await adapter.prepareDeposit(
				'USDC',
				1,
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			const usdcAddress = getTokenAddress('USDC', 1)?.toLowerCase().slice(2)
			expect(tx.data.toLowerCase()).toContain(usdcAddress)
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
				'1000000000', // 1000 USDC
				'0x1234567890123456789012345678901234567890',
			)

			expect(tx.to).toBe(getPoolAddress(1))
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			expect(tx.data).toBeDefined()
			// Function selector for withdraw(address,uint256,address)
			expect(tx.data.startsWith('0x69328dec')).toBe(true)
		})

		it('should throw for unsupported token', async () => {
			await expect(
				adapter.prepareWithdrawal(
					'INVALID_TOKEN',
					1,
					'1000000000',
					'0x1234567890123456789012345678901234567890',
				),
			).rejects.toThrow('not supported')
		})
	})

	describe('prepareApproval', () => {
		it('should encode ERC20 approve transaction correctly', async () => {
			const spender = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' // AAVE Pool
			const tx = await adapter.prepareApproval(
				'USDC',
				1,
				spender,
				'1000000000',
				'0x1234567890123456789012345678901234567890',
			)

			const usdcAddress = getTokenAddress('USDC', 1)
			expect(tx.to).toBe(usdcAddress)
			expect(tx.chainId).toBe(1)
			expect(tx.value).toBe('0')
			// Function selector for approve(address,uint256)
			expect(tx.data.startsWith('0x095ea7b3')).toBe(true)
		})
	})

	describe('estimateDepositGas', () => {
		it('should return a gas estimate', async () => {
			// This will return default estimate since we can't actually simulate
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

	describe('estimateWithdrawalGas', () => {
		it('should return a gas estimate', async () => {
			const gas = await adapter.estimateWithdrawalGas(
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
