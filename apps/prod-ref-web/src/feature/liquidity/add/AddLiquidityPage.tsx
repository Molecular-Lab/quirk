import { useEffect, useMemo, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"

import { RadioOption } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { usePosition } from "@/hooks/liquidity/usePosition"
import { useSwapChainId } from "@/hooks/useChainId"
import { RangeBy } from "@/types/position"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { getWrapped, sortDisplayTokens } from "@/utils/token"

import { AddLiquidityHeader, LiquidityDetail } from "./components"
import { useAddLiquidityState } from "./hooks/useAddLiquidityState"
import { useLiquidityQuote } from "./hooks/useLiquidityQuote"
import { StepEnterDepositAmt } from "./sections/StepEnterDepositAmt"
import { useAddLiquidityStore } from "./store/useAddLiquidityStore"

const dimSectionClassName = cn("pointer-events-none select-none opacity-60")

interface AddLiquidityPageProps {
	tokenId: string
}

export const AddLiquidityPage: React.FC<AddLiquidityPageProps> = ({ tokenId: _tokenId }) => {
	const chainId = useSwapChainId()

	const [tokenId, setTokenId] = useState<BigNumber>(BigNumber.from(_tokenId))
	const { data: position, isLoading: isLoadingPosition } = usePosition(tokenId, chainId)

	const { tokenA, tokenB } = useMemo(() => {
		if (!position) return { tokenA: undefined, tokenB: undefined }
		const [quote, base] = sortDisplayTokens([position.position.token0, position.position.token1])
		return { tokenA: quote, tokenB: base }
	}, [position])

	const {
		setRangeBy,
		setSelectedTier,
		setToken0Amount,
		setToken1Amount,
		setTickLower,
		setTickUpper,
		setPriceCurrent,
		computed: { invalidRange },
	} = useAddLiquidityStore()
	const { tickCurrent, enabledSection, pool, formState } = useAddLiquidityState({
		_position: position,
		tokenA: tokenA,
		tokenB: tokenB,
	})
	useLiquidityQuote(position, pool, tickCurrent)

	// init page
	useEffect(() => {
		// has existing position
		if (position !== undefined) {
			setToken0Amount((prev) => {
				if (prev !== undefined && getWrapped(prev.token).equals(getWrapped(position.position.token0))) {
					return prev
				}
				return new TokenAmount({ token: position.position.token0 }).unwrapped
			})
			setToken1Amount((prev) => {
				if (prev !== undefined && getWrapped(prev.token).equals(getWrapped(position.position.token1))) {
					return prev
				}
				return new TokenAmount({ token: position.position.token1 }).unwrapped
			})
			setTickLower(() => position.position.tickLower)
			setTickUpper(() => position.position.tickUpper)
			setSelectedTier(position.position.fee)
			return
		}

		// init tokenId (to fetch position)
		if (_tokenId) {
			setTokenId(BigNumber.from(_tokenId))
			return
		}
	}, [
		_tokenId,
		pool,
		position,
		setPriceCurrent,
		setSelectedTier,
		setTickLower,
		setTickUpper,
		setToken0Amount,
		setToken1Amount,
		tokenA,
		tokenB,
	])

	const rangeByOptions = useMemo<RadioOption<string>[]>(() => {
		const tokens: [EvmToken | undefined, EvmToken | undefined] = [tokenA, tokenB]
		return tokens.map<RadioOption<string>>((e, i) => {
			const cmp1 = e?.compare(tokenA)
			const cmp2 = e?.compare(tokenB)
			const isSorted: boolean = (cmp2 ?? 0) < (cmp1 ?? 0) ? false : true
			const optionVal = (isSorted && i === 0) || (!isSorted && i !== 0) ? "sorted" : "unsorted"
			return {
				label: e?.symbol,
				value: e !== undefined ? optionVal : i.toString(),
			}
		})
	}, [tokenA, tokenB])

	// default select to left option
	useEffect(() => {
		if (rangeByOptions.length > 0) {
			setRangeBy(rangeByOptions[0]?.value as RangeBy)
		}
	}, [rangeByOptions, setRangeBy])

	return (
		<div className={cn("flex w-full max-w-screen-sm flex-col gap-5")}>
			<AddLiquidityHeader title="Increase liquidity" tokenId={tokenId} />
			<div className={cn("flex w-full flex-col gap-4 lg:gap-7")}>
				<LiquidityDetail position={position} isLoading={isLoadingPosition} tokenA={tokenA} />
				<StepEnterDepositAmt
					position={position}
					tokenA={position?.position.token0}
					dimSectionClassName={dimSectionClassName}
					enabledLiquidityAmount={enabledSection.liquidityAmount}
					enabledButtons={enabledSection.buttons}
					tickCurrent={tickCurrent}
					invalidRange={invalidRange}
					formState={formState}
					pool={pool}
					customTitle="Add more liquidity"
				/>
			</div>
		</div>
	)
}
