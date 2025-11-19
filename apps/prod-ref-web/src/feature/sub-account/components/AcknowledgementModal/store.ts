import { create } from "zustand"

interface AcknowledgementModalStore {
	open: boolean
	setOpen: (open: boolean) => void
}

export const useAcknowledgementModalStore = create<AcknowledgementModalStore>((set) => ({
	open: false,
	setOpen: (open) => {
		set({ open })
	},
}))
