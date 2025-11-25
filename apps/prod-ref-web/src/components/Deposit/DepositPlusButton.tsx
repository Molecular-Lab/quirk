import { PlusIcon } from "lucide-react"

import { Button, ButtonProps } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useAccountMode } from "@/feature/sub-account/context"
import { EvmToken } from "@/types/tokens"

import { useDepositModalStore } from "./DepositModal"

export const DepositPlusButton: React.FC<Omit<ButtonProps, "onClick"> & { token: EvmToken | undefined }> = ({
	token,
	className,
	...props
}) => {
	const { accountMode } = useAccountMode()
	const { setDialogMode } = useDepositModalStore()

	return (
		<Button
			disabled={accountMode !== "sub"}
			size={props.size ?? "sm"}
			className={cn("ml-1.5 size-5 shrink-0 p-0", className)}
			onClick={() => {
				if (!token) return
				setDialogMode({
					dialogMode: "deposit",
					initToken: token,
				})
			}}
		>
			<PlusIcon className="size-3.5 shrink-0" />
		</Button>
	)
}
