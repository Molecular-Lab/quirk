import { create } from "zustand"

import { QuoteType } from "@rabbitswap/api-core/entity"

import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { TokenAmount } from "@/types/tokens"
import { getChainEvmToken } from "@/utils/token"
import { parseMaximumInput, parseMinimumOutput } from "@/utils/transaction"

import { RouteName } from "../form/components/SwapRouterBox/type"

interface SwapData {
	routeName: RouteName
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
	type: QuoteType
	typing: { amountIn: boolean; amountOut: boolean }
}

interface SwapStore extends SwapData {
	setRouteName: (routeName: RouteName) => void
	setAmountIn: (amount: TokenAmount | undefined) => void
	setAmountOut: (amount: TokenAmount | undefined) => void
	reset: () => void
	setType: (type: QuoteType) => void
	switchSides: () => void
	setTyping: (key: "amountIn" | "amountOut") => (value: boolean) => void

	// computed
	computed: {
		maxAmountIn: TokenAmount | undefined
		minAmountOut: TokenAmount | undefined
		swapFn: "wrap" | "unwrap" | "swap"
		typing: boolean
	}
}

const defaultState: SwapData = {
	routeName: "rabbitswap",
	amountIn: undefined,
	amountOut: undefined,
	type: "EXACT_INPUT",
	typing: { amountIn: false, amountOut: false },
}

export const useSwapStore = create<SwapStore>((set, get) => ({
	...defaultState,
	setRouteName: (routeName) => {
		set({ routeName })
	},
	setAmountIn: (amount) => {
		if (amount?.token.equals(get().amountOut?.token)) get().switchSides()
		else set({ amountIn: amount })
	},
	setAmountOut: (amount) => {
		if (amount?.token.equals(get().amountIn?.token)) get().switchSides()
		else set({ amountOut: amount })
	},
	setType: (type) => {
		set({ type })
	},
	reset: () => {
		set((state) => ({
			amountIn: state.amountIn?.newAmountString(),
			amountOut: state.amountOut?.newAmountString(),
			type: "EXACT_INPUT",
		}))
	},
	switchSides: () => {
		set((state) => ({
			amountIn: state.amountOut,
			amountOut: state.amountIn,
			type: state.type === "EXACT_INPUT" ? "EXACT_OUTPUT" : "EXACT_INPUT",
		}))
	},
	setTyping: (key) => (value) => {
		set((state) => ({ typing: { ...state.typing, [key]: value } }))
	},
	computed: {
		get maxAmountIn() {
			if (get().type === "EXACT_INPUT") return get().amountIn
			return parseMaximumInput(get().amountIn, useTxSetting.getState().computed.slippage)
		},
		get minAmountOut() {
			if (get().type === "EXACT_OUTPUT") return get().amountOut
			return parseMinimumOutput(get().amountOut, useTxSetting.getState().computed.slippage)
		},
		get swapFn() {
			const chainId = get().amountIn?.token.chainId ?? get().amountOut?.token.chainId
			if (!chainId) return "swap"
			const { native, wrapped } = getChainEvmToken(chainId)
			if (get().amountIn?.token.equals(native) && get().amountOut?.token.equals(wrapped)) return "wrap"
			if (get().amountIn?.token.equals(wrapped) && get().amountOut?.token.equals(native)) return "unwrap"
			return "swap"
		},
		get typing() {
			const t = get().typing
			return t.amountIn || t.amountOut
		},
	},
}))
