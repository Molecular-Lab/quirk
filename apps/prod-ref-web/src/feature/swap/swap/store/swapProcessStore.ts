import { create } from "zustand"

import { RouteName } from "@/feature/swap/swap/form/components/SwapRouterBox/type"
import { TokenAmount } from "@/types/tokenAmount"
import { Transaction } from "@/types/transaction"

export type SwapProcessType = "single" | "steps"

type Process = "SIGNING" | "SUBMITTED" | "SUCCESS"
export type SwapProcess = `${"SWAP" | "APPROVE"}_${Process}` | "REVIEWING"

interface SwapProcessData {
	/**
	 * Type of swap process
	 * - single: only swap
	 * - steps: approve then swap, showing the steps component
	 */
	type: SwapProcessType | null
	process: SwapProcess
	swapTx: Transaction | null
	amounts?: [TokenAmount, TokenAmount]
	routeName: RouteName | undefined
}

interface SwapProcessStore extends SwapProcessData {
	setType: (type: SwapProcessType) => void
	setProcess: (process: SwapProcess) => void
	setSwapTx: (tx: Transaction) => void
	setAmounts: (amounts: [TokenAmount, TokenAmount]) => void
	setRouteName: (routeName: RouteName) => void
	reset: () => void
}

const defaultState: SwapProcessData = {
	type: null,
	process: "REVIEWING",
	swapTx: null,
	amounts: undefined,
	routeName: undefined,
}

export const useSwapProcessStore = create<SwapProcessStore>((set) => ({
	...defaultState,
	setType: (type) => {
		set({ type })
	},
	setProcess: (process) => {
		set({ process })
	},
	setSwapTx: (swapTx) => {
		set({ swapTx })
	},
	setAmounts: (amounts) => {
		set({ amounts })
	},
	setRouteName: (routeName) => {
		set({ routeName })
	},
	reset: () => {
		set({ ...defaultState })
	},
}))
