import { create } from "zustand"

import { FeeAmount } from "@/constants/dex"
import { RangeBy } from "@/types/position"
import { TickMath } from "@/types/position/tickMath"
import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"

interface AddLiquidityState {
	rangeBy: RangeBy
	showTierOption: boolean
	selectedTier: FeeAmount | undefined
	token0Amount: TokenAmount | undefined
	token1Amount: TokenAmount | undefined
	tickLower: number | undefined
	tickUpper: number | undefined
	priceLower: Price | undefined
	priceUpper: Price | undefined
	priceCurrent: Price | undefined
	/**
	 * last typed token amount input (use for quote value)
	 */
	inputSide: "token0" | "token1"
}

const initState: AddLiquidityState = {
	rangeBy: "sorted",
	showTierOption: false,
	selectedTier: undefined,
	token0Amount: undefined,
	token1Amount: undefined,
	tickLower: undefined,
	tickUpper: undefined,
	priceLower: undefined,
	priceUpper: undefined,
	priceCurrent: undefined,
	inputSide: "token0",
}

interface AddLiquidityStore extends AddLiquidityState {
	setRangeBy: (_: RangeBy) => void
	setShowTierOption: (_: boolean) => void
	setSelectedTier: (_: FeeAmount | undefined) => void
	setTickLower: (f: (prev: number | undefined) => number | undefined) => void
	setTickUpper: (f: (prev: number | undefined) => number | undefined) => void
	setPriceLower: (f: (prev: Price | undefined) => Price | undefined) => void
	setPriceUpper: (f: (prev: Price | undefined) => Price | undefined) => void
	setPriceCurrent: (f: (prev: Price | undefined) => Price | undefined) => void
	clearPrices: () => void
	setToken0Amount: (f: (prev: TokenAmount | undefined) => TokenAmount | undefined) => void
	setToken1Amount: (f: (prev: TokenAmount | undefined) => TokenAmount | undefined) => void
	setInputSide: (side: "token0" | "token1") => void
	clear: () => void

	// computed
	computed: {
		bothTokenSelected: boolean
		invalidRange: boolean
		isFullRange: boolean
	}
}

export const useAddLiquidityStore = create<AddLiquidityStore>((set, get) => ({
	...initState,
	setRangeBy: (rangeBy) => {
		set({ rangeBy })
		const { priceLower, priceUpper } = get()
		set({
			priceLower: priceUpper?.invert(),
			priceUpper: priceLower?.invert(),
		})
	},
	setShowTierOption: (showTierOption) => {
		set({ showTierOption })
	},
	setSelectedTier: (selectedTier) => {
		set({ selectedTier })
	},
	setTickLower: (f) => {
		const fromTick = get().tickLower
		const toTick = f(fromTick)
		set({ tickLower: toTick })
	},
	setTickUpper: (f) => {
		const fromTick = get().tickUpper
		const toTick = f(fromTick)
		set({ tickUpper: toTick })
	},
	clearPrices: () => {
		set({ priceLower: undefined, priceUpper: undefined })
	},
	setPriceLower: (f) => {
		const { priceLower } = get()
		const fromPrice = priceLower
		const toPrice = f(fromPrice)
		set({ priceLower: toPrice })
	},
	setPriceUpper: (f) => {
		const { priceUpper } = get()
		const fromPrice = priceUpper
		const toPrice = f(fromPrice)
		set({ priceUpper: toPrice })
	},
	setPriceCurrent: (f) => {
		set({ priceCurrent: f(get().priceCurrent) })
	},
	setToken0Amount: (f) => {
		set({ token0Amount: f(get().token0Amount) })
	},
	setToken1Amount: (f) => {
		set({ token1Amount: f(get().token1Amount) })
	},
	setInputSide: (inputSide) => {
		set({ inputSide })
	},
	clear: () => {
		set(initState)
	},
	computed: {
		get bothTokenSelected() {
			const { token0Amount, token1Amount } = get()
			return !!token0Amount && !!token1Amount
		},
		get invalidRange() {
			const { tickLower, tickUpper } = get()
			if (!tickLower || !tickUpper) {
				return false
			}
			return tickLower >= tickUpper
		},
		get isFullRange() {
			const { tickLower, tickUpper } = get()
			return tickLower === TickMath.MIN_TICK && tickUpper === TickMath.MAX_TICK
		},
	},
}))
