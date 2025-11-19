import { create } from "zustand"

import { EvmToken } from "@/types/tokens"

interface SelectTokenPairModalData {
	isOpen: boolean
	optionItems: [EvmToken, EvmToken][]
	onSelect: (tokenPair: [EvmToken, EvmToken]) => void
}

interface SelectTokenPairModalStore extends SelectTokenPairModalData {
	open: ({
		onSelect,
		optionItems,
	}: {
		onSelect: SelectTokenPairModalData["onSelect"]
		optionItems: SelectTokenPairModalData["optionItems"]
	}) => void
	close: () => void
}

export const useSelectTokenPairModal = create<SelectTokenPairModalStore>((set) => ({
	isOpen: false,
	optionItems: [],
	onSelect: () => {},
	open: ({ onSelect, optionItems }) => {
		set({
			isOpen: true,
			onSelect: onSelect,
			optionItems: optionItems,
		})
	},
	close: () => {
		set({
			isOpen: false,
			onSelect: () => {},
			optionItems: [],
		})
	},
}))
