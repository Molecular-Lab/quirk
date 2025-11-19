import { solana } from "@particle-network/connectkit/chains"

import { SOLANA_NATIVE_TOKEN_ADDRESS } from "@/types/tokens/constant"
import { getChainToken } from "@/utils/token"

import { Token } from "./token"

export class SolanaToken extends Token {
	readonly address: string
	constructor({
		chainId,
		address,
		decimals,
		symbol,
		name,
		iconURL,
		isStable,
	}: {
		chainId: number
		address: string
		decimals: number
		symbol?: string
		name?: string
		iconURL?: string
		isStable: boolean
	}) {
		super({ chainId, address, decimals, symbol, name, iconURL, isStable })
		this.address = address
	}

	equals(other?: Token): boolean {
		return this.currencyId === other?.currencyId
	}

	compare(other: Token | undefined): number {
		if (other === undefined) {
			return -1
		}
		if (this.chainId !== other.chainId) {
			return this.chainId - other.chainId
		}
		return this.address.localeCompare(other.address)
	}

	get isNative(): boolean {
		return this.address === SOLANA_NATIVE_TOKEN_ADDRESS
	}

	get isWrappedNative(): boolean {
		const wrappedAddress = getChainToken(this.chainId, true).wrapped.address
		if (!wrappedAddress) {
			throw new Error(`[getWrapped] invalid chain ${this.chainId}`)
		}
		return this.address === wrappedAddress
	}

	get isMainToken(): boolean {
		return this.isNative || this.isWrappedNative
	}

	static decimals(): number {
		return 9
	}
}

export function isSolanaToken(t: Token | undefined): t is SolanaToken {
	return t !== undefined && t.chainId === solana.id
}
