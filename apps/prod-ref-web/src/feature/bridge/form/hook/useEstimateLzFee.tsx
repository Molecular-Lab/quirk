import { solana } from "@particle-network/auth-core"
import { useQuery } from "@tanstack/react-query"
import { type Address, getAddress, isAddress, pad, zeroAddress } from "viem"

import { proxyOFTV2Abi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { MappingLzChainId } from "@/constants/bridge"
import { useRecipient } from "@/feature/bridge/form/hook/useRecipient"
import { getAdapterParams } from "@/feature/bridge/form/hook/utils"
import { useBridgeStore } from "@/feature/bridge/form/store/bridgeStore"
import { TokenAmount } from "@/types/tokens"
import { getPublicClient } from "@/utils/publicClient"
import { getChainEvmToken } from "@/utils/token"

interface LzFeeReturns {
	nativeFee: TokenAmount
	zroFee: TokenAmount
}

export const useEstimateLzFee = () => {
	const {
		destToken,
		sourceToken,
		computed: { oftAddress },
	} = useBridgeStore()
	const { recipient } = useRecipient()

	const query = useQuery<LzFeeReturns | null>({
		queryKey: QueryKeys.lzFee(sourceToken, destToken, recipient),
		queryFn: async () => {
			// find if token is allowed to bridge
			if (!oftAddress) {
				return null
			}
			if (sourceToken.token.chainId === solana.id || destToken.token.chainId === solana.id) {
				// Rabbit currently does not support Solana
				return null
			}

			const destLzChainId = MappingLzChainId[destToken.token.chainId]
			if (!destLzChainId) {
				return null
			}

			const _recipient: Address = recipient !== undefined && isAddress(recipient) ? recipient : zeroAddress
			const adapterParams = getAdapterParams(destToken.token.chainId, _recipient)
			if (!adapterParams) {
				return null
			}

			const publicClient = getPublicClient(sourceToken.token.chainId)

			const useZro = false

			const [nativeFee, zroFee] = await publicClient.readContract({
				abi: proxyOFTV2Abi,
				address: getAddress(oftAddress),
				functionName: "estimateSendFee",
				args: [destLzChainId, pad(_recipient, { size: 32 }), sourceToken.amount ?? 0n, useZro, adapterParams],
			})

			const { native } = getChainEvmToken(sourceToken.token.chainId)

			return {
				nativeFee: TokenAmount.fromWei(native, nativeFee),
				zroFee: TokenAmount.fromWei(native, zroFee),
			}
		},
		enabled: !!sourceToken.amount && !!destToken.amount,
		refetchInterval: 10000, // 10 seconds
	})

	return query
}
