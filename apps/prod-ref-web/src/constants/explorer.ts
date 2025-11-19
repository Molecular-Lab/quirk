import { type Hash } from "viem"

import { VIEM_CHAINS } from "@/constants/chain"

type LinkType = "transaction" | "address"

export function getExplorerLink(chainId: number, hash?: Hash, linkType?: LinkType): string {
	const baseUrl: string = getExplorerBaseUrl(chainId)
	if (!hash || !linkType) {
		return baseUrl
	}
	switch (linkType) {
		case "transaction": {
			return `${baseUrl}/tx/${hash}`
		}
		case "address": {
			return `${baseUrl}/address/${hash}`
		}
		default: {
			throw new Error(`[getExplorerLink] unsupported linkType ${linkType}`)
		}
	}
}

function getExplorerBaseUrl(chainId: number): string {
	const baseUrl = VIEM_CHAINS[chainId]?.blockExplorers?.default.url
	if (baseUrl === undefined) {
		throw new Error(`[getExplorerBaseUrl] unsupported chainId ${chainId}`)
	}
	return baseUrl
}
