import { describe, it, expect, vi } from 'vitest'
import { BatchExecutor } from './batch-executor'
import type { ProtocolAllocation } from './batch-executor'

describe('BatchExecutor', () => {
	describe('allocation validation', () => {
		it('should throw if allocations do not sum to 100%', async () => {
			const executor = new BatchExecutor()

			const mockWalletClient = {
				account: { address: '0x1234567890123456789012345678901234567890' },
				sendTransaction: vi.fn(),
			} as any

			await expect(
				executor.executeBatchDeposit({
					token: 'USDC',
					chainId: 1,
					totalAmount: '1000000000',
					allocations: [
						{ protocol: 'aave', percentage: 50 },
						{ protocol: 'compound', percentage: 30 },
						// Missing 20% - only 80% total
					],
					walletClient: mockWalletClient,
					executionMode: 'sequential',
				}),
			).rejects.toThrow('Allocations must sum to 100%')
		})

		it('should accept allocations that sum to exactly 100%', () => {
			const allocations: ProtocolAllocation[] = [
				{ protocol: 'aave', percentage: 50 },
				{ protocol: 'compound', percentage: 30 },
				{ protocol: 'morpho', percentage: 20 },
			]

			const total = allocations.reduce((sum, a) => sum + a.percentage, 0)
			expect(total).toBe(100)
		})
	})

	describe('amount calculation', () => {
		it('should correctly calculate amounts from percentages', () => {
			const totalAmount = BigInt('1000000000') // 1000 USDC

			const allocations = [
				{ protocol: 'aave' as const, percentage: 50 },
				{ protocol: 'compound' as const, percentage: 30 },
				{ protocol: 'morpho' as const, percentage: 20 },
			]

			const amounts = allocations.map((a) => {
				return ((totalAmount * BigInt(Math.round(a.percentage * 100))) / 10000n).toString()
			})

			// 50% of 1000 USDC = 500 USDC
			expect(amounts[0]).toBe('500000000')
			// 30% of 1000 USDC = 300 USDC
			expect(amounts[1]).toBe('300000000')
			// 20% of 1000 USDC = 200 USDC
			expect(amounts[2]).toBe('200000000')

			// Total should equal original
			const totalCalculated = amounts.reduce((sum, a) => sum + BigInt(a), 0n)
			expect(totalCalculated).toBe(totalAmount)
		})

		it('should handle uneven percentages', () => {
			const totalAmount = BigInt('1000000000')

			const allocations = [
				{ protocol: 'aave' as const, percentage: 33.33 },
				{ protocol: 'compound' as const, percentage: 33.33 },
				{ protocol: 'morpho' as const, percentage: 33.34 },
			]

			const amounts = allocations.map((a) => {
				return ((totalAmount * BigInt(Math.round(a.percentage * 100))) / 10000n).toString()
			})

			// Should be approximately 333.3 USDC each
			expect(BigInt(amounts[0])).toBeGreaterThan(333000000n)
			expect(BigInt(amounts[0])).toBeLessThan(334000000n)
		})
	})

	describe('gas estimation', () => {
		it('should estimate gas for batch operations', async () => {
			const executor = new BatchExecutor()

			const result = await executor.estimateBatchGas(
				{
					token: 'USDC',
					chainId: 1,
					totalAmount: '1000000000',
					allocations: [
						{ protocol: 'aave', percentage: 50 },
						{ protocol: 'compound', percentage: 30 },
						{ protocol: 'morpho', percentage: 20 },
					],
				},
				'0x1234567890123456789012345678901234567890',
			)

			expect(result.totalGas).toBeGreaterThan(0n)
			expect(result.perProtocol.size).toBe(3)
			expect(result.perProtocol.has('aave')).toBe(true)
			expect(result.perProtocol.has('compound')).toBe(true)
			expect(result.perProtocol.has('morpho')).toBe(true)
		})
	})

	describe('result aggregation', () => {
		it('should correctly identify failed protocols', () => {
			const results = [
				{ protocol: 'aave' as const, success: true, amount: '500000000' },
				{ protocol: 'compound' as const, success: false, error: 'Failed', amount: '300000000' },
				{ protocol: 'morpho' as const, success: true, amount: '200000000' },
			]

			const failedProtocols = results.filter((r) => !r.success).map((r) => r.protocol)
			expect(failedProtocols).toEqual(['compound'])
		})

		it('should calculate total processed correctly', () => {
			const results = [
				{ protocol: 'aave' as const, success: true, amount: '500000000' },
				{ protocol: 'compound' as const, success: false, error: 'Failed', amount: '300000000' },
				{ protocol: 'morpho' as const, success: true, amount: '200000000' },
			]

			const totalProcessed = results
				.filter((r) => r.success)
				.reduce((sum, r) => sum + BigInt(r.amount), 0n)

			// Only successful ones: 500 + 200 = 700 USDC
			expect(totalProcessed).toBe(700000000n)
		})
	})
})
