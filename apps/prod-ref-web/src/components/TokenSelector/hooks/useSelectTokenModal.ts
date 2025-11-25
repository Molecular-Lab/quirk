import { Address } from "viem"
import { create } from "zustand"

import { EvmToken } from "@/types/tokens"

interface SelectTokenModalData {
	isOpen: boolean
	onSelect: (token: EvmToken) => void
	balanceWallet?: Address
}

interface SelectTokenModalStore extends SelectTokenModalData {
	open: ({
		onSelect,
		balanceWallet,
	}: {
		onSelect: SelectTokenModalData["onSelect"]
		balanceWallet?: SelectTokenModalData["balanceWallet"]
	}) => void
	close: () => void
}

export const useSelectTokenModal = create<SelectTokenModalStore>((set) => ({
	isOpen: false,
	onSelect: () => {},
	balanceWallet: undefined,
	open: ({ onSelect, balanceWallet }) => {
		set({
			isOpen: true,
			onSelect: onSelect,
			balanceWallet: balanceWallet,
		})
	},
	close: () => {
		set({
			isOpen: false,
			onSelect: () => {},
			balanceWallet: undefined,
		})
	},
}))
