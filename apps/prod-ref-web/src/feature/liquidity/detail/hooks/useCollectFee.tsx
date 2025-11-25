import { useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { type Hex, getAddress, zeroAddress } from "viem"

import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { liquidityEncoder } from "@/feature/liquidity/liquidityEncoder"
import { usePositionAndFee } from "@/hooks/liquidity/usePositionAndFee"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { identifyNativeAmount } from "@/utils/token"
import { isUserRejectedError } from "@/utils/transaction"

interface CollectFeeResult {
	tx: Transaction<[TokenAmount, TokenAmount]>
	tokenId: BigNumber
}

export const useCollectFee = (tokenId: BigNumber, receiveWETH: boolean) => {
	const toast = useToaster()
	const txToast = useTxToast()
	const { address, chainId } = useAccount()
	const { walletClient, publicClient } = useViemClient()
	const refetch = useRefetch()
	const [collectFeeTx, setCollectFeeTx] = useState<Transaction>()

	const { fee, isLoading } = usePositionAndFee(tokenId, chainId, !receiveWETH)

	const mutation = useChainTxMutation({
		mutationFn: async (): Promise<CollectFeeResult> => {
			if (!walletClient || !chainId || !address) {
				throw new Error("[CollectFee] Wallet not connected")
			}
			const nftPositionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
			if (!nftPositionManagerAddress) {
				throw new Error(`[CollectFee] Chain ${chainId} is not supported`)
			}

			if (isLoading) {
				throw new Error("[CollectFee] Fee is not fetched")
			}

			if (fee[0] === undefined || fee[1] === undefined) {
				throw new Error("[CollectFee] Fee is not fetched")
			}

			// if some token is native, we need to unwrap and sweep token
			const { native, other, haveNative: needUnwrap } = identifyNativeAmount(fee[0], fee[1])
			const multicall: Hex[] = []

			// collect fee
			// if need unwrap, collect to zero address first
			multicall.push(liquidityEncoder.encodeCollect(tokenId.toBigInt(), needUnwrap ? zeroAddress : address))

			if (needUnwrap) {
				multicall.push(liquidityEncoder.encodeUnwrap(native.bigint, address))
				multicall.push(liquidityEncoder.encodeSweepToken(getAddress(other.token.address), other.bigint, address))
			}

			const calldata = liquidityEncoder.encodeMulticall(multicall)

			const params = {
				chain: VIEM_CHAINS[chainId],
				data: calldata,
				to: nftPositionManagerAddress,
				account: address,
			}

			const gas = await publicClient.estimateGas(params)

			const hash = await walletClient.sendTransaction({
				gas,
				...params,
			})

			return {
				tx: new Transaction({
					hash: hash,
					chainId: chainId,
					address: address,
					data: [fee[0], fee[1]],
				}),
				tokenId: tokenId,
			}
		},
		onSubmitted: ({ tx }) => {
			setCollectFeeTx(tx)
		},
		onSuccess: ({ tx, tokenId }) => {
			const amounts = tx.data
			setCollectFeeTx(tx)
			txToast.success({
				title: "Collected Fees",
				description: `${amounts[0].toFormat({ decimalPlaces: 3, withUnit: true })} and ${amounts[1].toFormat({ decimalPlaces: 3, withUnit: true })}`,
				token: [amounts[0].token, amounts[1].token],
				tx: tx,
			})

			refetch([
				QueryKeys.position.positionFee(tx.chainId, tokenId),
				QueryKeys.tokenBalance.token(tx.address, amounts[0].token.currencyId),
				QueryKeys.tokenBalance.token(tx.address, amounts[1].token.currencyId),
			])
		},
		onError: (error) => {
			if (isUserRejectedError(error)) {
				toast.showPreset.info({
					title: "User rejected",
					description: "User rejected the request.",
				})
				return
			}
			toast.showPreset.error({
				title: "Collect Fees Error",
				description: error.message,
			})
		},
		onTxError: (error, { resp }) => {
			setCollectFeeTx(resp.tx)
			txToast.error({
				title: "Collect Fees Error",
				description: error.message,
				tx: resp.tx,
			})
		},
	})

	return {
		mutation: mutation,
		collectFeeTx: collectFeeTx,
		setCollectFeeTx: setCollectFeeTx,
	}
}
