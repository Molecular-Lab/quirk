import { initServer } from "@ts-rest/fastify"

import { systemContract } from "@rabbitswap/api-core/contracts/system"

import { VICTION_CONTRACT } from "@/constants/quote"
import { LimitOrderLastRecordedBlockRepository } from "@/repository/limit-order-last-recorded-block.repository"

export function createSystemRouter(
	s: ReturnType<typeof initServer>,
	{
		chainId,
		lastRecordedBlockRepository,
	}: {
		chainId: number
		lastRecordedBlockRepository: LimitOrderLastRecordedBlockRepository
	},
) {
	return s.router(systemContract, {
		info: async () => {
			const lastRecordedBlock = await lastRecordedBlockRepository.findByChainId(chainId)

			return new Promise((resolve) => {
				resolve({
					status: 200,
					body: {
						name: "RabbitSwap API",
						contractAddress: {
							factory: VICTION_CONTRACT.v3Factory,
							quoter: VICTION_CONTRACT.quoter,
							router: VICTION_CONTRACT.swapRouter,
						},
						limitOrder: {
							latestBlockNumber: lastRecordedBlock?.blockNumber ?? 0,
							latestBlockTimestamp: lastRecordedBlock ? lastRecordedBlock.blockTimestamp.getTime() / 1000 : 0,
						},
					},
				})
			})
		},
	})
}
