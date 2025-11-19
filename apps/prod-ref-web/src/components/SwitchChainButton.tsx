import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { VIEM_CHAINS } from "@/constants/chain"
import { useSwitchChain } from "@/hooks/wallet/useSwitchChain"

interface SwitchChainButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
	toChainId: number
}

export const SwitchChainButton: React.FC<SwitchChainButtonProps> = ({ toChainId: chainId, className, ...props }) => {
	const { switchChain } = useSwitchChain()

	return (
		<Button
			onClick={() => {
				switchChain(chainId)
			}}
			className={cn(className)}
			{...props}
		>
			Connect to {VIEM_CHAINS[chainId]?.name} Chain
		</Button>
	)
}
