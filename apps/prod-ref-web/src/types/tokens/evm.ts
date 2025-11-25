import { Address, getAddress, isAddress, isAddressEqual } from "viem"

import { MAIN_TOKENS } from "@/constants/token"
import { EVM_NATIVE_TOKEN_ADDRESS, KEY_SEPARATOR } from "@/types/tokens/constant"
import { Token } from "@/types/tokens/token"
import { getChainToken } from "@/utils/token"

export class EvmToken extends Token {
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
	}

	get isNative(): boolean {
		return isAddressEqual(getAddress(this.address), EVM_NATIVE_TOKEN_ADDRESS)
	}

	get isWrappedNative(): boolean {
		const wrappedAddress = getChainToken(this.chainId).wrapped.address
		if (!isAddress(wrappedAddress)) {
			throw new Error(`[getWrapped] invalid chain ${this.chainId}`)
		}
		if (!this.address) {
			throw new Error(`invalid ${this.address} for evm chain`)
		}
		return isAddressEqual(getAddress(this.address), wrappedAddress)
	}

	get isMainToken(): boolean {
		const chainMainTokens = MAIN_TOKENS[this.chainId] ?? []
		return chainMainTokens.some((token) => token.equals(this))
	}

	// ================== Static Methods =====================
	static decimals(): number {
		return 18
	}

	static parseCurrencyId(currencyId: string): [number, Address] {
		const splitCcyId = currencyId.split(KEY_SEPARATOR)
		if (splitCcyId.length !== 2) {
			throw new Error(`Invalid currencyId: ${currencyId}`)
		}
		const [chainId, address] = splitCcyId
		if (!chainId) {
			throw new Error(`Invalid chainId: ${chainId}`)
		}
		if (!address?.startsWith("0x")) {
			throw new Error(`Invalid address format: ${currencyId}`)
		}
		return [parseInt(chainId), getAddress(address)]
	}
}

export function isEvmToken(t: EvmToken | undefined): t is EvmToken {
	return t !== undefined && isAddress(t.address)
}
