import { BigNumber } from "@ethersproject/bignumber"
import mixpanel from "mixpanel-browser"
import { type Hex } from "viem"

import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { getMixpanelErrorProperties, getMixpanelEventKey } from "@/feature/analytics/mixpanel"
import { liquidityEncoder } from "@/feature/liquidity/liquidityEncoder"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { Transaction } from "@/types/transaction"
import { identifyNativeAmount } from "@/utils/token"
import { isUserRejectedError } from "@/utils/transaction"

import { IncreaseLiquidityParams, IncreaseLiquidityResult } from "./type"

/**
 * increase liquidity of the specified position
 */
export const useIncreaseLiquidityMutation = (tokenId: BigNumber | undefined) => {
	const toast = useToaster()
	const txToast = useTxToast()
	const { address, chainId } = useAccount()
	const { walletClient, publicClient } = useViemClient()
	const refetch = useRefetch()
	const {
		computed: { slippage, deadline },
	} = useTxSetting()

	const mutation = useChainTxMutation({
		mutationFn: async ({ amount0, amount1 }: IncreaseLiquidityParams): Promise<IncreaseLiquidityResult> => {
			if (!walletClient || !chainId || !address) {
				throw new Error("[IncreaseLiquidity] Wallet not connected")
			}
			if (!tokenId) {
				throw new Error("[IncreaseLiquidity] TokenId is not provided")
			}
			const nftPositionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
			if (!nftPositionManagerAddress) {
				throw new Error(`[IncreaseLiquidity] Chain ${chainId} is not supported`)
			}

			// if we input ETH, we need to call refund
			const { native, haveNative: needRefund } = identifyNativeAmount(amount0, amount1)
			const multicall: Hex[] = []
			let value = 0n

			multicall.push(
				liquidityEncoder.encodeIncreaseLiquidity({
					tokenId: tokenId.toBigInt(),
					amount0: amount0,
					amount1: amount1,
					slippage: slippage,
					deadline: deadline,
				}),
			)

			if (needRefund) {
				multicall.push(liquidityEncoder.encodeRefundETH())
				value = native.bigint
			}

			const calldata = liquidityEncoder.encodeMulticall(multicall)

			const params = {
				chain: VIEM_CHAINS[chainId],
				data: calldata,
				value: value,
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
		onSuccess: ({ tx, tokenId }) => {
			const amounts = tx.data
			txToast.success({
				title: "Added Liquidity",
				description: `${amounts[0].toFormat({ decimalPlaces: 3, withUnit: true })} and ${amounts[1].toFormat({ decimalPlaces: 3, withUnit: true })}`,
				token: [amounts[0].token, amounts[1].token],
				tx: tx,
			})
			refetch([
				QueryKeys.position.positionDetail(tx.chainId, tokenId),
				QueryKeys.tokenBalance.token(tx.address, amounts[0].token.currencyId),
				QueryKeys.tokenBalance.token(tx.address, amounts[1].token.currencyId),
			])
		},
		onError: (error, params) => {
			if (isUserRejectedError(error)) {
				toast.showPreset.info({
					title: "User rejected",
					description: "User rejected the request.",
				})
				return
			}
			mixpanel.track(getMixpanelEventKey("increase_liquidity_error"), {
				address: address,
				params: {
					token0: params.amount0.toFormat({ withUnit: true }),
					token1: params.amount1.toFormat({ withUnit: true }),
					tokenId: tokenId,
					deadline: deadline,
					slippage: slippage,
				},
				...getMixpanelErrorProperties(error),
			})
			toast.showPreset.error({
				title: "Add Liquidity Error",
				description: error.message,
			})
		},
		onTxError: (error, { params, resp }) => {
			mixpanel.track(getMixpanelEventKey("increase_liquidity_error"), {
				address: address,
				params: {
					token0: params.amount0.toFormat({ withUnit: true }),
					token1: params.amount1.toFormat({ withUnit: true }),
					tokenId: tokenId,
					deadline: deadline,
					slippage: slippage,
				},
				...getMixpanelErrorProperties(error),
				txId: resp.tx.txId,
			})
			txToast.error({
				title: "Add Liquidity Error",
				description: error.message,
				tx: resp.tx,
			})
		},
	})

	return mutation
}
