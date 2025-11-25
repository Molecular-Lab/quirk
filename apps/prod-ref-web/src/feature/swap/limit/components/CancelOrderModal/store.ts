import { create } from "zustand"

import { LimitOrderItem } from "@/feature/swap/limit/types"

interface CancelOrderModalStore {
	open: boolean
	order: LimitOrderItem | undefined
	onOpen: (_: { order: LimitOrderItem | undefined }) => void
	onClose: () => void
}

export const useCancelOrderModalStore = create<CancelOrderModalStore>((set) => ({
	open: false,
	order: undefined,
	onOpen: ({ order }) => {
		set({ open: true, order: order })
	},
	onClose: () => {
		set({ open: false, order: undefined })
	},
}))
