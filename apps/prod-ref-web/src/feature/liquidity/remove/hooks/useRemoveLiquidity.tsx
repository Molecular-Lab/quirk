import { BigNumber } from "@ethersproject/bignumber"
import { type Hex, getAddress, zeroAddress } from "viem"

import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { liquidityEncoder } from "@/feature/liquidity/liquidityEncoder"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { usePositionAndFee } from "@/hooks/liquidity/usePositionAndFee"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { identifyNativeAmount } from "@/utils/token"
import { isUserRejectedError, parseMinimumOutput } from "@/utils/transaction"

interface RemoveLiquidityHookParams {
	tokenId: BigNumber
	chainId: number | undefined
	receiveWETH: boolean
}

interface RemoveParam {
	/**
	 * percentage in range 0-100
	 */
	removePercentageIn100: number
}

interface RemoveResult {
	tx: Transaction<[TokenAmount, TokenAmount]>
	tokenId: BigNumber
}

export const useRemoveLiquidity = ({ tokenId, chainId, receiveWETH }: RemoveLiquidityHookParams) => {
	const toast = useToaster()
	const txToast = useTxToast()
	const { address } = useAccount()
	const { position, fee, isLoading } = usePositionAndFee(tokenId, chainId, !receiveWETH)
	const {
		computed: { slippage, deadline },
	} = useTxSetting()
	const { publicClient, walletClient } = useViemClient()

	const refetch = useRefetch()

	const mutation = useChainTxMutation({
		mutationFn: async ({ removePercentageIn100 }: RemoveParam): Promise<RemoveResult> => {
			if (!walletClient || !chainId || !address) {
				throw new Error("[RemoveLiquidity] Wallet not connected")
			}
			const nftPositionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
			if (!nftPositionManagerAddress) {
				throw new Error(`[RemoveLiquidity] Chain ${chainId} is not supported`)
			}

			if (isLoading) throw new Error("[RemoveLiquidity] Fee is not fetched")
			if (!position) throw new Error("[RemoveLiquidity] Position is not fetched")
			if (!fee[0] || !fee[1]) throw new Error("[RemoveLiquidity] Fee is not fetched")

			const amount0 = position.amount0.multiply(removePercentageIn100 / 100)
			const amount1 = position.amount1.multiply(removePercentageIn100 / 100)
			const amount0Min = parseMinimumOutput(amount0, slippage)
			const amount1Min = parseMinimumOutput(amount1, slippage)

			// if some token is native, we need to unwrap and sweep token
			const removeAmount = identifyNativeAmount(amount0Min, amount1Min)
			const feeAmount = identifyNativeAmount(fee[0], fee[1])
			const needUnwrap = removeAmount.haveNative && feeAmount.haveNative

			const multicall: Hex[] = []

			// remove liquidity
			multicall.push(
				liquidityEncoder.encodeDecreaseLiquidity({
					tokenId: tokenId.toBigInt(),
					liquidity: (position.position.liquidity * BigInt(removePercentageIn100)) / 100n,
					amount0Min: amount0Min.bigint,
					amount1Min: amount1Min.bigint,
					deadline: deadline,
				}),
			)

			// collect fee
			// if need unwrap, collect to zero address first
			multicall.push(liquidityEncoder.encodeCollect(tokenId.toBigInt(), needUnwrap ? zeroAddress : address))

			if (needUnwrap) {
				// unwrap and sweep token, using amount min + fee
				multicall.push(liquidityEncoder.encodeUnwrap(removeAmount.native.bigint + feeAmount.native.bigint, address))
				multicall.push(
					liquidityEncoder.encodeSweepToken(
						getAddress(removeAmount.other.token.address),
						removeAmount.other.bigint + feeAmount.other.bigint,
						address,
					),
				)
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
					data: [amount0, amount1],
				}),
				tokenId: tokenId,
			}
		},
		onSuccess: ({ tx }) => {
			const amounts = tx.data
			txToast.success({
				title: "Removed Liquidity",
				description: `${amounts[0].toFormat({ decimalPlaces: 3, withUnit: true })} and ${amounts[1].toFormat({ decimalPlaces: 3, withUnit: true })}`,
				token: [amounts[0].token, amounts[1].token],
				tx: tx,
			})

			refetch([
				QueryKeys.position.positionDetail(tx.chainId, tokenId),
				QueryKeys.position.positionDetails(tx.address, tx.chainId),
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
				title: "Remove Liquidity Error",
				description: error.message,
			})
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Remove Liquidity Error",
				description: error.message,
				tx: resp.tx,
			})
		},
	})

	return mutation
}
