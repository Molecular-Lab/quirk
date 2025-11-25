import { useMemo } from "react"

import { useLocalStorage } from "localstore"

import { Button, ButtonProps } from "@rabbitswap/ui/basic"

import { useAcknowledgementModalStore } from "@/feature/sub-account/components/AcknowledgementModal/store"
import { useAccountMode } from "@/feature/sub-account/context"
import { useParticleLoginMutation } from "@/feature/sub-account/hooks/useParticleLoginMutation"
import { useAccount } from "@/hooks/useAccount"

type ConnectSubAccountButtonProps = Omit<ButtonProps, "onClick" | "loading">

export const ConnectSubAccountButton: React.FC<ConnectSubAccountButtonProps> = ({
	className,
	children = "Connect Trading Account",
	...props
}) => {
	const { setAccountMode } = useAccountMode()
	const { mainAddress, subAddress } = useAccount()
	const { mutateAsync: login, isPending: isLogingIn } = useParticleLoginMutation({
		onSuccess: () => {
			setOpen(false)
			setAccountMode("sub")
		},
	})

	const [subAccMap] = useLocalStorage("sub-account", {})

	const isAcknowledged = useMemo<boolean>(() => {
		if (!mainAddress) return false
		return subAccMap[mainAddress.toLowerCase()]?.ack ?? false
	}, [mainAddress, subAccMap])

	const { setOpen } = useAcknowledgementModalStore()

	return (
		<Button
			className={className}
			disabled={!mainAddress || !!subAddress || props.disabled}
			onClick={() => {
				if (!isAcknowledged) {
					setOpen(true)
					return
				} else {
					void login()
				}
			}}
			loading={isLogingIn}
			{...props}
		>
			{children}
		</Button>
	)
}
