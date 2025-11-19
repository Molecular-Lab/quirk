import { ArrowDownToLine } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useDepositModalStore } from "./DepositModal/store"

interface DepositBoxProps {}

export const DepositBox: React.FC<DepositBoxProps> = () => {
	const { setDialogMode } = useDepositModalStore()

	return (
		<Button
			buttonColor="primary"
			onClick={() => {
				setDialogMode({ dialogMode: "deposit" })
			}}
			className={cn("size-full grow")}
		>
			<ArrowDownToLine className="size-4" />
			<div className="text-base">Deposit</div>
		</Button>
	)
}
