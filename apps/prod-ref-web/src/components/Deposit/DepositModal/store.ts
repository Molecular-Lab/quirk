import { create } from "zustand"

import { EvmToken } from "@/types/tokens"

export type DepositPageState = "deposit" | "qrcode" | "close"

interface DepositModalStore {
	dialogMode: DepositPageState
	initToken: EvmToken | undefined
	setDialogMode: (_: { dialogMode: DepositPageState; initToken?: EvmToken | undefined }) => void
}

export const useDepositModalStore = create<DepositModalStore>((set) => ({
	dialogMode: "close",
	initToken: undefined,
	setDialogMode: ({ dialogMode, initToken }) => {
		set({ dialogMode, initToken })
	},
}))
