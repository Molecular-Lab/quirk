import { useState } from "react"

import { ArrowLeft, Copy, QrCode } from "lucide-react"

import { Button, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { useCopyToClipboard } from "@rabbitswap/ui/hooks"
import { CheckCircle } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { WalletAddress } from "@/components/Wallet/WalletAddress"
import { WalletQrCode } from "@/components/Wallet/WalletQrCode"
import { useAccount } from "@/hooks/useAccount"

type ReceivePageState = "receive" | "qrcode" | "close"

interface ReceiveBoxProps {}
export const ReceiveBox: React.FC<ReceiveBoxProps> = () => {
	const { mainAddress: address } = useAccount()
	const { copied, handleCopy } = useCopyToClipboard(address, { timeout: 500 })

	const [openDialog, setOpenDialog] = useState<ReceivePageState>("close")
	const handleOpenDialog = (key: ReceivePageState) => {
		setOpenDialog(key)
	}

	return (
		<>
			<Button
				buttonColor="gray"
				onClick={() => {
					handleOpenDialog("receive")
				}}
				className={cn("size-full grow gap-3", "bg-gray-50 hover:bg-gray-100/80")}
			>
				<QrCode className="size-4" />
				<div className="text-base">Receive</div>
			</Button>

			{(() => {
				switch (openDialog) {
					case "receive": {
						return (
							<Modal
								open
								onOpenChange={(open) => {
									if (open) {
										handleOpenDialog("receive")
									} else {
										handleOpenDialog("close")
									}
								}}
							>
								<ModalContent className="mb-12 px-6 lg:pb-6">
									<ModalHeader>
										<ModalTitle className="text-center">Receive Crypto</ModalTitle>
										<ModalDescription className="mb-3 text-center text-sm text-gray-500">
											Fund your wallet by transferring crypto from another wallet or account
										</ModalDescription>
									</ModalHeader>
									<div className="flex flex-col gap-2">
										<div className="flex justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800">
											<WalletAddress hideCopy address={address} />
											<div className="flex items-center gap-2">
												<Button
													buttonColor="gray"
													className="bg-gray-50 p-1.5 hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-900"
													onClick={handleCopy}
												>
													{copied ? (
														<CheckCircle className="size-4 text-success hover:text-success-hover" />
													) : (
														<Copy className="size-4 text-gray-400 group-hover:text-gray-500" />
													)}
												</Button>
												<Button
													buttonColor="gray"
													className="bg-gray-50 p-1.5 hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-900"
													onClick={() => {
														handleOpenDialog("qrcode")
													}}
												>
													<QrCode className="size-4 text-gray-400 group-hover:text-gray-500" />
												</Button>
											</div>
										</div>
									</div>
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
										handleOpenDialog("qrcode")
									} else {
										handleOpenDialog("close")
									}
								}}
							>
								<ModalContent className="mb-16 max-h-[90vh] px-0 pb-6">
									<ModalHeader>
										<ModalTitle className="flex items-center justify-between px-6">
											<ArrowLeft
												className="size-6 cursor-pointer text-gray-500 hover:text-gray-400"
												onClick={() => {
													handleOpenDialog("receive")
												}}
											/>
										</ModalTitle>
										<ModalDescription />
									</ModalHeader>
									<WalletQrCode address={address} />
								</ModalContent>
							</Modal>
						)
					}
					default: {
						return null
					}
				}
			})()}
		</>
	)
}
