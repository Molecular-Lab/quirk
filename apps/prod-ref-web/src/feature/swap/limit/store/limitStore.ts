import dayjs, { Dayjs } from "dayjs"
import { create } from "zustand"

import { C98_VICTION, RABBIT_VICTION } from "@/constants/token"
import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"

export type ExpiresIn = "1d" | "1w" | "1m" | "1y"

interface LimitData {
	side: "Buy" | "Sell"
	type: "EXACT_LEFT" | "EXACT_RIGHT"
	amountLeft: TokenAmount | undefined
	amountRight: TokenAmount | undefined
	priceCondition: Price | undefined
	expiresIn: ExpiresIn
	expiresAt: Dayjs
	typing: { amountLeft: boolean; amountRight: boolean }
}

interface LimitStore extends LimitData {
	setSide: (side: "Buy" | "Sell") => void
	setType: (type: "EXACT_LEFT" | "EXACT_RIGHT") => void
	setAmountLeft: (amount: TokenAmount | undefined) => void
	setAmountRight: (f: (amount: TokenAmount | undefined) => TokenAmount | undefined) => void
	setPriceCondition: (f: (priceCondition: Price | undefined) => Price | undefined) => void
	setExpiresIn: (expiresIn: ExpiresIn) => void
	triggerExpiresAt: () => void
	reset: () => void
	setTyping: (key: "amountLeft" | "amountRight") => (value: boolean) => void

	// computed
	computed: {
		typing: boolean
		amountIn: TokenAmount | undefined
		amountOut: TokenAmount | undefined
	}
}

const defaultState: LimitData = {
	side: "Buy",
	type: "EXACT_LEFT",
	amountLeft: TokenAmount.fromString(RABBIT_VICTION),
	amountRight: TokenAmount.fromString(C98_VICTION),
	priceCondition: undefined,
	expiresIn: "1y",
	expiresAt: dayjs(),
	typing: { amountLeft: false, amountRight: false },
}

export const useLimitStore = create<LimitStore>((set, get) => ({
	...defaultState,
	setSide: (side) => {
		set({ side })
	},
	setType: (type) => {
		set({ type })
	},
	setAmountLeft: (amount) => {
		set({ amountLeft: amount })
	},
	setAmountRight: (f) => {
		const amount = f(get().amountRight)
		set({ amountRight: amount })
	},
	setPriceCondition: (f) => {
		set({ priceCondition: f(get().priceCondition) })
	},
	setExpiresIn: (expiresIn) => {
		set({ expiresIn })
	},
	triggerExpiresAt: () => {
		const expiresAt = getExpiredAt(get().expiresIn)
		set({ expiresAt })
	},
	reset: () => {
		set((state) => ({
			amountLeft: state.amountLeft?.newAmountString(),
			amountRight: state.amountRight?.newAmountString(),
			expiresIn: "1y",
		}))
	},
	setTyping: (key) => (value) => {
		set((state) => ({ typing: { ...state.typing, [key]: value } }))
	},
	computed: {
		get typing() {
			const t = get().typing
			return t.amountLeft || t.amountRight
		},
		get amountIn() {
			const { amountLeft, amountRight, side } = get()
			return side === "Sell" ? amountLeft : amountRight
		},
		get amountOut() {
			const { amountLeft, amountRight, side } = get()
			return side === "Sell" ? amountRight : amountLeft
		},
	},
}))

function getExpiredAt(expiresIn: ExpiresIn) {
	const now = dayjs()
	switch (expiresIn) {
		case "1d": {
			return now.add(1, "day")
		}
		case "1w": {
			return now.add(1, "week")
		}
		case "1m": {
			return now.add(1, "month")
		}
		case "1y": {
			return now.add(1, "year")
		}
		default: {
			return now
		}
	}
}
