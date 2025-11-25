import { ArrowLeft } from "lucide-react"

import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"

import { WalletQrCode } from "@/components/Wallet/WalletQrCode"
import { useAccount } from "@/hooks/useAccount"

import { DepositContent } from "./DepositContent"
import { useDepositModalStore } from "./store"

export const DepositModal: React.FC = () => {
	const { subAddress } = useAccount()
	const { dialogMode: openDialog, initToken, setDialogMode: setOpenDialog } = useDepositModalStore()

	switch (openDialog) {
		case "deposit": {
			return (
				<Modal
					open
					onOpenChange={(open) => {
						if (open) {
							setOpenDialog({ dialogMode: "deposit" })
						} else {
							setOpenDialog({ dialogMode: "close" })
						}
					}}
				>
					<ModalContent className="mb-12 px-6 pb-0 md:mb-0 md:!min-h-[200px] md:w-[500px] lg:mb-0 lg:pb-6">
						<DepositContent
							token={initToken}
							onClose={() => {
								setOpenDialog({ dialogMode: "close" })
							}}
						/>
					</ModalContent>
				</Modal>
			)
		}
		case "qrcode": {
			return (
				<Modal
					open
					onOpenChange={(open) => {
						if (open) {
							setOpenDialog({ dialogMode: "qrcode" })
						} else {
							setOpenDialog({ dialogMode: "close" })
						}
					}}
				>
					<ModalContent className="mb-16 max-h-[90vh] px-0 pb-6">
						<ModalHeader>
							<ModalTitle className="flex items-center justify-between px-6">
								<ArrowLeft
									className="size-6 cursor-pointer text-gray-500 hover:text-gray-400"
									onClick={() => {
										setOpenDialog({ dialogMode: "close" })
									}}
								/>
							</ModalTitle>
							<ModalDescription />
						</ModalHeader>
						<WalletQrCode address={subAddress} />
					</ModalContent>
				</Modal>
			)
		}
		default: {
			return null
		}
	}
}
