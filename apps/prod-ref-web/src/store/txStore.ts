import { type Address, isAddressEqual } from "viem"
import { create } from "zustand"

import { Transaction } from "@/types/transaction"

interface TxState {
	transactions: Record<string, Transaction>
	setTransaction: (tx: Transaction) => void
	getTx: (txId: string) => Transaction | undefined
	getPendingTxCount: (address?: Address) => number
	reset: () => void
}

export const useTxStore = create<TxState>((set, get) => ({
	transactions: {},
	setTransaction: (tx) => {
		set((state) => ({
			transactions: {
				...state.transactions,
				[tx.txId]: tx,
			},
		}))
	},
	getTx: (txId) => get().transactions[txId],
	reset: () => {
		set({ transactions: {} })
	},
	getPendingTxCount: (address?: Address) => {
		const pendingTx = Object.values(get().transactions).filter((tx) => tx.status === "pending")
		return (address ? pendingTx.filter((tx) => isAddressEqual(tx.address, address)) : pendingTx).length
	},
}))
