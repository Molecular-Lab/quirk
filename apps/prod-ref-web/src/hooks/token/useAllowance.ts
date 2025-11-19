import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"
import { type Address, erc20Abi, getAddress } from "viem"

import { QueryKeys } from "@/config/queryKey"
import { useAccount } from "@/hooks/useAccount"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokens"

export interface AllowanceParams {
	account?: Address
	amount?: TokenAmount
	spender: Address | undefined
}

/**
 * to check if token needs approval
 */
export const useAllowance = (props: AllowanceParams) => {
	const account = useAccount()

	const { amount, spender } = props
	const { publicClient } = useViemClient({
		chainId: amount?.token.chainId,
	})
	const token = amount?.token
	const address = props.account ?? account.address

	const allowance = useQuery<bigint | null>({
		queryKey: QueryKeys.allowance(address, token?.currencyId, spender),
		queryFn: async () => {
			if (address === undefined || token === undefined || spender === undefined) {
				return null
			}
			return await publicClient.readContract({
				abi: erc20Abi,
				address: getAddress(token.address),
				functionName: "allowance",
				args: [address, spender],
			})
		},
		enabled: !!address && !!token && !token.isNative && !!spender,
	})

	const isAllowed = useMemo(() => {
		if (token?.isNative) return true
		if (allowance.isLoading) return undefined
		if (amount && allowance.data !== undefined && allowance.data !== null) {
			return allowance.data >= amount.bigint
		}
		return false
	}, [allowance.data, allowance.isLoading, amount, token?.isNative])

	return {
		...allowance,
		isAllowed: isAllowed,
	}
}
