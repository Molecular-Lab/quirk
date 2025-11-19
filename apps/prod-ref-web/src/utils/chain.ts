import { VIEM_CHAINS } from "@/constants/chain"

export function chainNameToId(_chainName: string): number | undefined {
	const chainName = _chainName.toLowerCase()
	const chainId = Object.keys(VIEM_CHAINS).find((id) => VIEM_CHAINS[Number(id)]?.name.toLocaleLowerCase() === chainName)
	if (!chainId) return undefined
	return parseInt(chainId)
}
