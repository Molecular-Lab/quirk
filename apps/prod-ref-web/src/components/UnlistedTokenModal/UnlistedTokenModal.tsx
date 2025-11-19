import { useCallback, useMemo, useState } from "react"

import { useLocalStorage } from "localstore"
import { AlertTriangle } from "lucide-react"

import {
	Button,
	Checkbox,
	Label,
	Modal,
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@rabbitswap/ui/basic"

import { useUnlistedTokenModal } from "@/components/UnlistedTokenModal/store"
import { useAllTokens } from "@/hooks/token/useAllTokens"
import { useSwapChainId } from "@/hooks/useChainId"

export const UnlistedTokenModal: React.FC = () => {
	const chainId = useSwapChainId()
	const { data: allTokens } = useAllTokens(chainId)
	const { isOpen, token, onConfirm, closeModal } = useUnlistedTokenModal()

	const [hideUnlistedTokenAlert, setHideUnlistedTokenAlert] = useLocalStorage("hide-unlisted-token-alert", false)
	const [checked, setChecked] = useState(hideUnlistedTokenAlert)

	const handleConfirm = useCallback(() => {
		setHideUnlistedTokenAlert(checked)
		onConfirm?.()
	}, [checked, onConfirm, setHideUnlistedTokenAlert])

	const isListed = useMemo<boolean>(() => {
		return (allTokens ?? []).find((t) => t.equals(token)) !== undefined
	}, [allTokens, token])

	if (hideUnlistedTokenAlert || isListed) {
		onConfirm?.()
		return null
	}

	return (
		<Modal
			open={isOpen}
			onOpenChange={(o) => {
				if (!o) closeModal()
			}}
		>
			<ModalContent>
				<AlertTriangle className="mt-6 size-20 w-full text-center text-warning-darken" />
				<ModalHeader className="my-3">
					<ModalTitle className="text-center">Always do your own research! </ModalTitle>
					<ModalDescription className="text-center">
						{token?.symbol} isn&apos;t an official listed token on RabbitSwap.
						<br /> This token is suspicious and may cause the loss of your funds!
					</ModalDescription>
				</ModalHeader>
				<Label className="flex items-center justify-center gap-2">
					<Checkbox
						checked={checked}
						onCheckedChange={(v) => {
							if (typeof v === "boolean") setChecked(v)
						}}
					/>
					Do not show again on this device
				</Label>
				<Button className="mt-4 h-12 md:mt-0" onClick={handleConfirm}>
					Confirm
				</Button>
			</ModalContent>
		</Modal>
	)
}
