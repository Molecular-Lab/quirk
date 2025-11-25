import { create } from "zustand"

interface DepositEthWarningModalStore {
	isOpen: boolean
	setIsOpen: (_: boolean) => void
}

export const useDepositEthWarningModalStore = create<DepositEthWarningModalStore>((set) => ({
	isOpen: false,
	setIsOpen: (isOpen) => {
		set({ isOpen })
	},
}))
