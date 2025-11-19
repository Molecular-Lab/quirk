import { useEffect, useMemo } from "react"

import { RadioOption } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { isFeeAmount } from "@/constants/dex"
import { useToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { RangeBy } from "@/types/position"
import { Price } from "@/types/price"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { getChainEvmToken, getUnwrapped, getWrapped } from "@/utils/token"

import { CreateLiquidityHeader } from "./components"
import { useAddLiquidityState } from "./hooks/useAddLiquidityState"
import { useLiquidityQuote } from "./hooks/useLiquidityQuote"
import { StepEnterDepositAmt } from "./sections/StepEnterDepositAmt"
import { StepSelectPriceRange } from "./sections/StepSelectPriceRange"
import { TokenPairAndFeeSection } from "./sections/TokenPairAndFeeSection"
import { useAddLiquidityStore } from "./store/useAddLiquidityStore"

const dimSectionClassName = cn("pointer-events-none select-none opacity-60")

export const CreatePositionPage: React.FC<{
	currencyIdA?: string
	currencyIdB?: string
	feeAmount?: string
}> = ({ currencyIdA, currencyIdB, feeAmount }) => {
	const chainId = useSwapChainId()

	const { data: tokenA, isLoading: loadingTokenA } = useToken(chainId, currencyIdA)
	const { data: tokenB, isLoading: loadingTokenB } = useToken(chainId, currencyIdB)
	const { native } = getChainEvmToken(chainId)
	const hasNative = useMemo<boolean>(() => {
		const aEth = tokenA?.equals(native) ?? false
		const bEth = tokenB?.equals(native) ?? false
		return aEth || bEth
	}, [native, tokenA, tokenB])

	const {
		setRangeBy,
		selectedTier,
		setSelectedTier,
		setToken0Amount,
		setToken1Amount,
		setTickLower,
		setTickUpper,
		setPriceCurrent,
		computed: { bothTokenSelected, invalidRange },
	} = useAddLiquidityStore()
	const {
		tickCurrent,
		enabledSection,
		handleSetTokenA,
		handleSetTokenB,
		handleSetSelectedTier,
		pool,
		onFullRangeClick,
		formState,
	} = useAddLiquidityState({
		_position: undefined,
		tokenA: tokenA,
		tokenB: tokenB,
	})
	useLiquidityQuote(undefined, pool, tickCurrent)

	// sync fee amount to selected tier
	useEffect(() => {
		if (feeAmount) {
			const feeAmt = Number(feeAmount)
			if (isFeeAmount(feeAmt)) {
				setSelectedTier(feeAmt)
			}
		}
	}, [feeAmount, setSelectedTier])

	// init page
	useEffect(() => {
		// pool found
		if (pool) {
			setToken0Amount((prev) => {
				if (prev !== undefined && getWrapped(prev.token).equals(pool.token0)) {
					return prev
				}
				return TokenAmount.fromString(hasNative ? getUnwrapped(pool.token0) : pool.token0)
			})
			setToken1Amount((prev) => {
				if (prev !== undefined && getWrapped(prev.token).equals(pool.token1)) {
					return prev
				}
				return TokenAmount.fromString(hasNative ? getUnwrapped(pool.token1) : pool.token1)
			})
			setPriceCurrent(() => pool.token0Price)
			return
		}

		const foundTokenA = tokenA !== undefined && tokenA.address === currencyIdA
		const foundTokenB = tokenB !== undefined && tokenB.address === currencyIdB

		// both tokens found
		if (foundTokenA && foundTokenB) {
			// sort token and set
			const [tA, tB] = getWrapped(tokenA).compare(getWrapped(tokenB)) > 0 ? [tokenB, tokenA] : [tokenA, tokenB]
			setToken0Amount(() => new TokenAmount({ token: tA }))
			setToken1Amount(() => new TokenAmount({ token: tB }))
			// set fee amount if any
			const feeAmt = Number(feeAmount)
			if (isFeeAmount(feeAmt)) {
				setSelectedTier(feeAmt)
			}
			return
		}
		// single token found
		if (foundTokenA) {
			setToken0Amount(() => {
				return new TokenAmount({ token: tokenA })
			})
			setToken1Amount(() => undefined)
			setSelectedTier(undefined)
			return
		}
		if (foundTokenB) {
			setToken0Amount(() => {
				return new TokenAmount({ token: tokenB })
			})
			setToken1Amount(() => undefined)
			setSelectedTier(undefined)
			return
		}
		// clear token state if not found
		setToken0Amount(() => undefined)
		setToken1Amount(() => undefined)
		setSelectedTier(undefined)
	}, [
		currencyIdA,
		currencyIdB,
		feeAmount,
		hasNative,
		pool,
		setPriceCurrent,
		setSelectedTier,
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

	// reset tick when tier changes
	useEffect(() => {
		if (selectedTier) {
			setTickLower(() => undefined)
			setTickUpper(() => undefined)
			if (!pool)
				setPriceCurrent((p) => {
					if (p === undefined) {
						return undefined
					}
					return new Price({
						quote: p.quoteCurrency,
						base: p.baseCurrency,
						value: undefined,
					})
				})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTier, tokenA, tokenB])

	return (
		<div className={cn("flex w-full flex-col gap-5")}>
			<CreateLiquidityHeader title="New position">
				<TokenPairAndFeeSection
					tokenA={tokenA}
					tokenB={tokenB}
					isTokenLoading={loadingTokenA || loadingTokenB}
					handleSetTokenA={handleSetTokenA}
					handleSetTokenB={handleSetTokenB}
					handleSetSelectedTier={handleSetSelectedTier}
					enabledFeeSelector={enabledSection.feeSelector}
				/>
			</CreateLiquidityHeader>

			<div className={cn("flex w-full flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-7")}>
				<StepSelectPriceRange
					pool={pool}
					tokenA={tokenA}
					tokenB={tokenB}
					hasNative={hasNative}
					bothTokenSelected={bothTokenSelected}
					tickCurrent={tickCurrent}
					enabledPriceChart={enabledSection.priceChart}
					enabledPriceRange={enabledSection.priceRange}
					dimSectionClassName={dimSectionClassName}
					onFullRangeClick={onFullRangeClick}
					rangeByOptions={rangeByOptions}
					isLoading={loadingTokenA || loadingTokenB}
				/>

				<StepEnterDepositAmt
					position={undefined}
					tokenA={tokenA}
					dimSectionClassName={dimSectionClassName}
					enabledLiquidityAmount={enabledSection.liquidityAmount}
					enabledButtons={enabledSection.buttons}
					tickCurrent={tickCurrent}
					invalidRange={invalidRange}
					formState={formState}
					pool={pool}
				/>
			</div>
		</div>
	)
}
