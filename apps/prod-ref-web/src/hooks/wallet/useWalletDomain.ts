import { useMemo } from "react"

import { LinkedID } from "@oneid-xyz/inspect"
import { Address } from "viem"

import { shortenText } from "@rabbitswap/ui/utils"

import { useWalletDomains } from "@/hooks/wallet/useWalletDomains"

interface ISelectedDomain {
	selectedDomain: LinkedID | null
	displayDomain: string
}

export const useWalletDomain = (
	address: Address | undefined,
	domainId: string,
	options?: {
		startLength?: number
		endLength?: number
	},
): {
	selectedDomain: ISelectedDomain | null
} => {
	const { data: domains } = useWalletDomains(address)

	const selectedDomain = useMemo<ISelectedDomain | null>(() => {
		if (!domains) return null

		const selectedDomain = domains.find((linkId) => linkId.name?.toLowerCase().endsWith(domainId.toLowerCase())) ?? null
		if (selectedDomain?.name) {
			const domainName = shortenText({
				text: selectedDomain.name.slice(0, -domainId.length),
				startLength: options?.startLength,
				endLength: options?.endLength,
			})
			return {
				selectedDomain: selectedDomain,
				displayDomain: `${domainName}${domainId}`,
			}
		}
		if (domains[0]?.name) {
			const currentDomainID = domains[0].name.split(".").pop()
			const domainName = currentDomainID ? domains[0].name.slice(0, -currentDomainID.length) : ""
			return {
				selectedDomain: null,
				displayDomain: `${domainName}${currentDomainID ?? ""}`,
			}
		}
		return null
	}, [domains, domainId, options?.startLength, options?.endLength])

	return {
		selectedDomain,
	}
}
