import { VICTION_CONTRACT } from "@/constants/dex"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { useAllowance } from "@/hooks/token/useAllowance"

export const useLimitOrderAllowance = () => {
	const spender = VICTION_CONTRACT.limitOrder

	const {
		computed: { amountIn },
	} = useLimitStore()

	return useAllowance({
		amount: amountIn,
		spender: spender,
	})
}
