import { Button, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useDepositModalStore } from "@/components/Deposit"
import { useDepositEthWarningModalStore } from "@/feature/sub-account/components/DepositEthWarningModal/store"
import { useSwapChainId } from "@/hooks/useChainId"
import { getChainEvmToken } from "@/utils/token"

export const DepositEthWarningModal: React.FC = () => {
	const { isOpen, setIsOpen } = useDepositEthWarningModalStore()
	const chainId = useSwapChainId()
	const { native } = getChainEvmToken(chainId)

	const { setDialogMode } = useDepositModalStore()

	return (
		<Modal open={isOpen} onOpenChange={setIsOpen}>
			<ModalContent>
				<img
					src="/images/rabbit-aww.png"
					alt={`Deposit ${native.symbol}`}
					className={cn("mx-auto max-w-[320px] object-contain", "mt-6 lg:mt-10")}
				/>
				<ModalHeader className="my-6">
					<ModalTitle className="text-center">Deposit {native.symbol}</ModalTitle>
					<ModalDescription className="text-center">
						Please deposit some {native.symbol} before execute any transactions.
					</ModalDescription>
				</ModalHeader>
				<Button
					className="h-12"
					onClick={() => {
						setDialogMode({ dialogMode: "deposit", initToken: native })
						setIsOpen(false)
					}}
				>
					Deposit {native.symbol}
				</Button>
			</ModalContent>
		</Modal>
	)
}
