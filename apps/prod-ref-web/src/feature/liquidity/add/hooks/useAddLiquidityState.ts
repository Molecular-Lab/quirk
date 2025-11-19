import { useCallback, useEffect, useMemo } from "react"

import { FeeAmount, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { tokenAmountPairSorter } from "@/feature/liquidity/tokenPairSorter"
import { usePool } from "@/hooks/liquidity/usePool"
import { useAllowance } from "@/hooks/token/useAllowance"
import { useInsufficientBalance } from "@/hooks/token/useInsufficientBalance"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { useNavigate } from "@/router"
import { Pool } from "@/types/pool"
import { Position } from "@/types/position"
import { priceToClosestTick, tickToPrice } from "@/types/position/price"
import { TickMath } from "@/types/position/tickMath"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

import { useAddLiquidityStore } from "../store/useAddLiquidityStore"

export type AddLiquidityFormState =
	| "connect-wallet"
	| "loading"
	| "approve-token0"
	| "approve-token1"
	| "preview"
	| "insufficient-token0"
	| "insufficient-token1"
	| "switch-chain"

interface AddLiquidityState {
	// value
	tickCurrent: number | undefined

	// state
	formState: AddLiquidityFormState
	pool: Pool | null | undefined

	// display
	priceLowerDisplay: string | undefined
	priceUpperDisplay: string | undefined
	enabledSection: {
		feeSelector: boolean
		priceRange: boolean
		priceChart: boolean
		liquidityAmount: boolean
		buttons: boolean
	}

	// handlers
	handleSetTokenA: (token: EvmToken) => void
	handleSetTokenB: (token: EvmToken) => void
	handleSetSelectedTier: (feeAmount: FeeAmount | undefined) => void
	onFullRangeClick: () => void
	clearPriceDisplay: () => void
	onClearAllClick: () => void
}

interface AddLiquidityStateParam {
	_position?: Position | undefined
	tokenA?: EvmToken
	tokenB?: EvmToken
}

export const useAddLiquidityState = (param?: AddLiquidityStateParam): AddLiquidityState => {
	const _position = param?._position
	const tokenA = param?.tokenA
	const tokenB = param?.tokenB

	const { address, chainId: accountChainId } = useAccount()
	const chainId = useSwapChainId()
	const navigate = useNavigate()

	const {
		rangeBy,
		token0Amount,
		token1Amount,
		selectedTier,
		tickLower,
		setTickLower,
		tickUpper,
		setTickUpper,
		priceCurrent,
		clearPrices,
		setPriceLower,
		setPriceUpper,
		clear,
		computed: { bothTokenSelected, invalidRange, isFullRange },
	} = useAddLiquidityStore()

	const { isAllowed: isAllowedToken0 } = useAllowance({
		spender: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
		amount: token0Amount,
	})

	const { isAllowed: isAllowedToken1 } = useAllowance({
		spender: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
		amount: token1Amount,
	})

	const [quoteAmount, baseAmount] = useMemo(() => {
		const s = tokenAmountPairSorter(token0Amount, token1Amount)
		if (rangeBy === "sorted") {
			return s
		}
		return [s[1], s[0]]
	}, [rangeBy, token0Amount, token1Amount])

	// recalc price, sync ticks to prices
	useEffect(() => {
		if (!quoteAmount?.token || !baseAmount?.token) {
			clearPrices()
			return
		}

		const quote = quoteAmount.token
		const base = baseAmount.token

		const [priceLowerTick, priceUpperTick] = rangeBy === "sorted" ? [tickUpper, tickLower] : [tickLower, tickUpper]

		const newPriceLower = priceLowerTick
			? tickToPrice(base, quote, priceLowerTick)
			: new Price({ quote: quote, base: base, value: undefined })
		const newPriceUpper = priceUpperTick
			? tickToPrice(base, quote, priceUpperTick)
			: new Price({ quote: quote, base: base, value: undefined })

		setPriceLower((prev) => {
			// token change
			if (prev && (!prev.quoteCurrency.equals(quote) || !prev.baseCurrency.equals(base))) {
				// if quote and base is swapped, invert
				if (prev.quoteCurrency.equals(base) && prev.baseCurrency.equals(quote)) {
					return prev.invert()
				}
			}

			return newPriceLower
		})
		setPriceUpper((prev) => {
			// token change
			if (prev && (!prev.quoteCurrency.equals(quote) || !prev.baseCurrency.equals(base))) {
				// if quote and base is swapped, invert
				if (prev.quoteCurrency.equals(base) && prev.baseCurrency.equals(quote)) {
					return prev.invert()
				}
			}

			return newPriceUpper
		})
	}, [baseAmount?.token, clearPrices, quoteAmount?.token, rangeBy, setPriceLower, setPriceUpper, tickUpper, tickLower])

	const [priceLowerDisplay, priceUpperDisplay] = useMemo<[string, string] | [undefined, undefined]>(() => {
		return isFullRange ? ["0", "∞"] : [undefined, undefined]
	}, [isFullRange])

	const onFullRangeClick = useCallback(() => {
		setTickLower(() => TickMath.MIN_TICK)
		setTickUpper(() => TickMath.MAX_TICK)
	}, [setTickLower, setTickUpper])

	const clearPriceDisplay = useCallback(() => {
		setTickLower(() => undefined)
		setTickUpper(() => undefined)
	}, [setTickLower, setTickUpper])

	const onClearAllClick = useCallback(() => {
		clear()
		void navigate("/add")
	}, [clear, navigate])

	const tickCurrent = useMemo<number | undefined>(() => {
		if (_position) {
			return _position.pool.tickCurrent
		}
		const wrappedPrice = priceCurrent?.wrapped
		const hasCurrentPrice = wrappedPrice?.value !== undefined && !wrappedPrice.value.eq(0)
		const _tickCurrent = hasCurrentPrice
			? priceToClosestTick(rangeBy === "sorted" ? wrappedPrice : wrappedPrice.invert())
			: undefined
		return _tickCurrent
	}, [_position, priceCurrent, rangeBy])

	const { value: insuffToken0, isLoading: isLoadingInsuff0 } = useInsufficientBalance({ amount: token0Amount })
	const { value: insuffToken1, isLoading: isLoadingInsuff1 } = useInsufficientBalance({ amount: token1Amount })

	const formState = useMemo<AddLiquidityState["formState"]>(() => {
		if (!address) {
			return "connect-wallet"
		}
		if (!bothTokenSelected) {
			return "preview"
		}
		if (isAllowedToken0 === undefined || isAllowedToken1 === undefined) {
			return "loading"
		}
		if (isLoadingInsuff0 || isLoadingInsuff1) {
			return "loading"
		}
		if (insuffToken0) {
			return "insufficient-token0"
		}
		if (insuffToken1) {
			return "insufficient-token1"
		}
		if (accountChainId !== chainId) {
			return "switch-chain"
		}
		if (!isAllowedToken0) {
			return "approve-token0"
		}
		if (!isAllowedToken1) {
			return "approve-token1"
		}
		return "preview"
	}, [
		accountChainId,
		address,
		isAllowedToken0,
		isAllowedToken1,
		bothTokenSelected,
		chainId,
		insuffToken0,
		insuffToken1,
		isLoadingInsuff0,
		isLoadingInsuff1,
	])

	const handleRedirect = useCallback(
		(_token0: string | undefined, _token1: string | undefined, feeAmt: FeeAmount | undefined) => {
			if (_token0 !== undefined) {
				if (_token1 !== undefined) {
					if (feeAmt !== undefined) {
						void navigate("/add/:currencyIdA/:currencyIdB/:feeAmount", {
							params: {
								currencyIdA: _token0,
								currencyIdB: _token1,
								feeAmount: feeAmt.toString(),
							},
						})
					} else {
						void navigate("/add/:currencyIdA/:currencyIdB", {
							params: {
								currencyIdA: _token0,
								currencyIdB: _token1,
							},
						})
					}
				} else {
					void navigate("/add/:currencyIdA", {
						params: {
							currencyIdA: _token0,
						},
					})
				}
			} else {
				void navigate("/add")
			}
		},
		[navigate],
	)

	const handleSetTokenA = useCallback(
		(token: EvmToken) => {
			// same as prev state
			if (token.equals(tokenA)) {
				return
			}
			// change left token to be the same as right token, replace left token and clear right token
			if (tokenB !== undefined && (token.equals(tokenB) || getWrapped(token).equals(getWrapped(tokenB)))) {
				handleRedirect(token.address, undefined, selectedTier)
				return
			}
			handleRedirect(token.address, tokenB?.address, selectedTier)
		},
		[handleRedirect, selectedTier, tokenA, tokenB],
	)

	const handleSetTokenB = useCallback(
		(token: EvmToken) => {
			// same as prev state
			if (token.equals(tokenB)) {
				return
			}
			// change right token to be the same as left token, remove right token
			if (tokenA !== undefined && (token.equals(tokenA) || getWrapped(token).equals(getWrapped(tokenA)))) {
				handleRedirect(tokenA.address, undefined, selectedTier)
				return
			}
			handleRedirect(tokenA?.address, token.address, selectedTier)
		},
		[handleRedirect, selectedTier, tokenA, tokenB],
	)

	const handleSetSelectedTier = useCallback(
		(v: FeeAmount | undefined) => {
			handleRedirect(tokenA?.address, tokenB?.address, v)
		},
		[handleRedirect, tokenA?.address, tokenB?.address],
	)

	const { data: _pool } = usePool([tokenA, tokenB], selectedTier, chainId)

	const pool = useMemo<Pool | null | undefined>(() => {
		return _position?.pool ?? _pool
	}, [_pool, _position])

	const enabledSection = useMemo(() => {
		return {
			feeSelector: bothTokenSelected,
			priceRange: bothTokenSelected && selectedTier !== undefined,
			priceChart: bothTokenSelected && selectedTier !== undefined,
			liquidityAmount: bothTokenSelected && selectedTier !== undefined && tickCurrent !== undefined && !invalidRange,
			buttons: bothTokenSelected,
		}
	}, [bothTokenSelected, invalidRange, selectedTier, tickCurrent])

	return {
		priceLowerDisplay,
		priceUpperDisplay,
		enabledSection,
		onFullRangeClick,
		onClearAllClick,
		clearPriceDisplay,
		formState,
		tickCurrent,
		handleSetTokenA,
		handleSetTokenB,
		handleSetSelectedTier,
		pool,
	}
}
