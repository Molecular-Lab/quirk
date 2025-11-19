import { type Address, type Hex, encodeFunctionData } from "viem"

import { positionManagerAbi } from "@rabbitswap/core/constants"

import { FeeAmount } from "@/constants/dex"
import { MAX_UINT128 } from "@/constants/ethersBigNum"
import { TokenAmount } from "@/types/tokens"
import { parseDeadline, parseMinimumOutput } from "@/utils/transaction"

export const liquidityEncoder = {
	encodeInitPool: (params: { token0: Address; token1: Address; fee: FeeAmount; sqrtPriceX96: bigint }) => {
		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "createAndInitializePoolIfNecessary",
			args: [params.token0, params.token1, params.fee, params.sqrtPriceX96],
		})
	},

	encodeMint: (params: {
		amount0: TokenAmount
		amount1: TokenAmount
		slippage: number
		deadline: number
		fee: FeeAmount
		tick: [number, number]
		recipient: Address
	}) => {
		const amount0Min = parseMinimumOutput(params.amount0, params.slippage)
		const amount1Min = parseMinimumOutput(params.amount1, params.slippage)

		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "mint",
			args: [
				{
					token0: params.amount0.token.address as Address,
					token1: params.amount1.token.address as Address,
					amount0Desired: params.amount0.bigint,
					amount1Desired: params.amount1.bigint,
					amount0Min: amount0Min.bigint,
					amount1Min: amount1Min.bigint,
					fee: params.fee,
					tickLower: params.tick[0],
					tickUpper: params.tick[1],
					deadline: parseDeadline(params.deadline),
					recipient: params.recipient,
				},
			],
		})
	},

	encodeIncreaseLiquidity: (params: {
		tokenId: bigint
		amount0: TokenAmount
		amount1: TokenAmount
		slippage: number
		deadline: number
	}) => {
		const amount0Min = parseMinimumOutput(params.amount0, params.slippage)
		const amount1Min = parseMinimumOutput(params.amount1, params.slippage)

		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "increaseLiquidity",
			args: [
				{
					tokenId: params.tokenId,
					amount0Desired: params.amount0.bigint,
					amount1Desired: params.amount1.bigint,
					amount0Min: amount0Min.bigint,
					amount1Min: amount1Min.bigint,
					deadline: parseDeadline(params.deadline),
				},
			],
		})
	},

	encodeDecreaseLiquidity: (params: {
		tokenId: bigint
		liquidity: bigint
		amount0Min: bigint
		amount1Min: bigint
		deadline: number
	}) => {
		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "decreaseLiquidity",
			args: [
				{
					...params,
					deadline: parseDeadline(params.deadline),
				},
			],
		})
	},

	encodeCollect: (tokenId: bigint, recipient: Address) => {
		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "collect",
			args: [
				{
					tokenId: tokenId,
					recipient: recipient,
					amount0Max: MAX_UINT128.toBigInt(),
					amount1Max: MAX_UINT128.toBigInt(),
				},
			],
		})
	},

	encodeUnwrap: (minimumAmountOut: bigint, recipient: Address) => {
		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "unwrapWETH9",
			args: [minimumAmountOut, recipient],
		})
	},

	encodeSweepToken: (token: Address, minimumAmountOut: bigint, recipient: Address) => {
		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "sweepToken",
			args: [token, minimumAmountOut, recipient],
		})
	},

	encodeRefundETH: () => {
		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "refundETH",
			args: [],
		})
	},

	encodeMulticall: (callDatas: Hex[]) => {
		// if there is only one call, return it directly
		if (callDatas.length === 1) return callDatas[0]

		return encodeFunctionData({
			abi: positionManagerAbi,
			functionName: "multicall",
			args: [callDatas],
		})
	},
}
