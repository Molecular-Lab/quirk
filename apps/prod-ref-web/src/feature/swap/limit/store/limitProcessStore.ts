import { create } from "zustand"

import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"

export type LimitProcessType = "single" | "steps"

type Process = "SIGNING" | "SUBMITTED" | "SUCCESS" | "FAILED"
export type LimitProcess = `${"ORDER" | "APPROVE"}_${Process}` | "REVIEWING"

interface LimitProcessData {
	/**
	 * Type of swap process
	 * - single: only limit order
	 * - steps: approve then create order, showing the steps component
	 */
	type: LimitProcessType | null
	process: LimitProcess
	createOrderTx: Transaction | undefined
	amounts?: [TokenAmount, TokenAmount]
}

interface LimitProcessStore extends LimitProcessData {
	setType: (type: LimitProcessType) => void
	setProcess: (process: LimitProcess) => void
	setCreateOrderTx: (tx: Transaction) => void
	reset: () => void
	setAmounts: (amounts: [TokenAmount, TokenAmount]) => void
}

const defaultState: LimitProcessData = {
	type: null,
	process: "REVIEWING",
	createOrderTx: undefined,
	amounts: undefined,
} as const

export const useLimitProcessStore = create<LimitProcessStore>((set) => ({
	...defaultState,
	setType: (type) => {
		set({ type })
	},
	setProcess: (process) => {
		set({ process })
	},
	setCreateOrderTx: (createOrderTx) => {
		set({ createOrderTx })
	},
	reset: () => {
		set({ ...defaultState })
	},
	setAmounts: (amounts) => {
		set({ amounts })
	},
}))
