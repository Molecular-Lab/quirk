import { useCallback } from "react"

import { useLocalStorage } from "localstore"

import { Button, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useAcknowledgementModalStore } from "@/feature/sub-account/components/AcknowledgementModal/store"
import { useParticleLoginMutation } from "@/feature/sub-account/hooks/useParticleLoginMutation"
import { useAccount } from "@/hooks/useAccount"

export const AcknowledgementModal: React.FC = () => {
	const { open, setOpen } = useAcknowledgementModalStore()
	const { mainAddress, subAddress } = useAccount()
	const { mutateAsync: login, isPending: isLogingIn } = useParticleLoginMutation()

	const [_, setSubAccMap] = useLocalStorage("sub-account", {})

	const setIsAcknowledged = useCallback(
		(ack: boolean) => {
			setSubAccMap((prev) => {
				if (!mainAddress) return prev
				return {
					...prev,
					[mainAddress.toLowerCase()]: {
						ack: ack,
						address: subAddress ?? "",
					},
				}
			})
		},
		[mainAddress, setSubAccMap, subAddress],
	)

	return (
		<Modal open={open} onOpenChange={setOpen}>
			<ModalContent>
				<img
					src="/images/rabbit-aww.png"
					alt="Enable Trading Account"
					className={cn("mx-auto max-w-[320px] object-contain", "mt-6 lg:mt-10")}
				/>
				<ModalHeader className="my-6">
					<ModalTitle className="text-center">Enable Trading account</ModalTitle>
					<ModalDescription className="text-center">
						You can enable a Trading Account once per main wallet. Trading account can perform swaps and place limit
						orders.
					</ModalDescription>
				</ModalHeader>
				<Button
					className="h-12"
					disabled={!mainAddress || !!subAddress}
					onClick={async () => {
						setIsAcknowledged(true)
						await login()
						setOpen(false)
					}}
					loading={isLogingIn}
				>
					Confirm
				</Button>
			</ModalContent>
		</Modal>
	)
}
