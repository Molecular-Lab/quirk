import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TxSettings {
	deadline: string // in minutes
	slippage: string // in percentage
	autoSlippage: boolean
}

interface TxSettingsStore {
	// don't directly use this to calculate slippage and deadline
	internalState: TxSettings
	setState: (value: Partial<TxSettings>) => void

	// computed, use this
	computed: {
		/**
		 * number of slippage percent [0-100]
		 */
		slippage: number
		/**
		 * deadline in seconds
		 */
		deadline: number
		tooLowSlippage: boolean
		tooHighSlippage: boolean
		slippageWarning: boolean
	}
}

const defaultInternalAdvanced = {
	deadline: "",
	slippage: "",
	autoSlippage: true,
} as const

export const MIN_SUGGEST_SLIPPAGE = 0.05 // 0.05%
export const MAX_SUGGEST_SLIPPAGE = 1 // 1%
export const DEFAULT_SLIPPAGE = 0.5 // 0.5%
export const DEFAULT_DEADLINE = 10 // 10 mins

export const useTxSetting = create<TxSettingsStore>()(
	persist(
		(set, get) => ({
			internalState: defaultInternalAdvanced,
			setState: (value) => {
				set({ internalState: { ...get().internalState, ...value } })
			},
			computed: {
				get slippage() {
					return get().internalState.autoSlippage
						? DEFAULT_SLIPPAGE
						: Number(get().internalState.slippage || DEFAULT_SLIPPAGE.toString())
				},
				get deadline() {
					return (Number(get().internalState.deadline || DEFAULT_DEADLINE.toString()) || DEFAULT_DEADLINE) * 60 // parse to seconds
				},
				get tooLowSlippage() {
					return this.slippage < MIN_SUGGEST_SLIPPAGE
				},
				get tooHighSlippage() {
					return this.slippage > MAX_SUGGEST_SLIPPAGE
				},
				get slippageWarning() {
					return this.tooLowSlippage || this.tooHighSlippage
				},
			},
		}),
		{
			name: "transaction-settings",
			partialize: ({ internalState }) => ({ internalState }),
		},
	),
)
