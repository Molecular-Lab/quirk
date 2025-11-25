import { useCallback } from "react"

import { create } from "zustand"

import { EvmToken } from "@/types/tokens"

interface UnlistedTokenModalStore {
	isOpen: boolean
	token: EvmToken | undefined
	onConfirm: (() => void) | undefined
	open: (option: { token: EvmToken; onConfirm: () => void }) => void
	close: () => void
}

export const useUnlistedTokenModalStore = create<UnlistedTokenModalStore>((set) => ({
	isOpen: false,
	token: undefined,
	onConfirm: undefined,
	open: ({ token, onConfirm }) => {
		set({
			isOpen: true,
			token: token,
			onConfirm: onConfirm,
		})
	},
	close: () => {
		set({
			isOpen: false,
			token: undefined,
			onConfirm: undefined,
		})
	},
}))

export const useUnlistedTokenModal = (hookOption?: { onConfirm?: () => void }) => {
	const { open, close: closeModal, ...store } = useUnlistedTokenModalStore()

	const openModal = useCallback(
		(option: { token: EvmToken }): Promise<boolean> => {
			return new Promise<boolean>((resolved) => {
				open({
					token: option.token,
					onConfirm: () => {
						hookOption?.onConfirm?.()
						closeModal()
						resolved(true)
					},
				})
			})
		},
		[closeModal, hookOption, open],
	)

	return {
		...store,
		closeModal,
		openModal,
	}
}
