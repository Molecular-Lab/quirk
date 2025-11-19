import { useState } from "react"

import { ArrowUpFromLine } from "lucide-react"

import { Button, Modal, ModalContent } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { WithdrawContent } from "@/components/Withdraw/WithdrawBox/WithdrawContent"

type WithdrawPageState = "withdraw" | "close"

interface WithdrawBoxProps {}
export const WithdrawBox: React.FC<WithdrawBoxProps> = () => {
	const [openDialog, setOpenDialog] = useState<WithdrawPageState>("close")
	const handleOpenDialog = (key: WithdrawPageState) => {
		setOpenDialog(key)
	}

	return (
		<>
			<Button
				buttonColor="gray"
				onClick={() => {
					handleOpenDialog("withdraw")
				}}
				className={cn("size-full grow", "bg-gray-50 hover:bg-gray-100/80")}
			>
				<ArrowUpFromLine className="size-4" />
				<div className="text-base">Withdraw</div>
			</Button>

			{(() => {
				switch (openDialog) {
					case "withdraw": {
						return (
							<Modal
								open
								onOpenChange={(open) => {
									if (open) {
										handleOpenDialog("withdraw")
									} else {
										handleOpenDialog("close")
									}
								}}
							>
								<ModalContent className="mb-12 px-6 pb-0 md:mb-0 md:!min-h-[200px] md:w-[500px] lg:mb-0 lg:pb-6">
									<WithdrawContent
										onClose={() => {
											handleOpenDialog("close")
										}}
									/>
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
