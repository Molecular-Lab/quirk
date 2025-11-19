import { KEY_SEPARATOR } from "./constant"

interface TokenInterface {
	chainId: number
	address: string
	decimals: number
	symbol?: string
	name?: string
	iconURL?: string
	isStable: boolean
}

export abstract class Token {
	readonly chainId: number
	readonly address: string
	readonly decimals: number
	readonly symbol?: string
	readonly name?: string
	readonly isStable: boolean
	iconURL?: string

	constructor({ chainId, address, decimals, symbol, name, iconURL, isStable }: TokenInterface) {
		this.chainId = chainId
		this.address = address
		this.decimals = decimals
		this.symbol = symbol
		this.name = name
		this.iconURL = iconURL
		this.isStable = isStable
	}

	equals(other?: Token): boolean {
		return this.currencyId.toLocaleLowerCase() === other?.currencyId.toLocaleLowerCase()
	}

	compare(other: Token | undefined): number {
		if (other === undefined) return -1
		if (this.chainId !== other.chainId) return this.chainId - other.chainId
		return this.address.toLowerCase().localeCompare(other.address.toLowerCase())
	}

	get currencyId(): string {
		return Token.formatCurrencyId(this.chainId, this.address)
	}

	abstract get isNative(): boolean
	abstract get isWrappedNative(): boolean
	abstract get isMainToken(): boolean

	// ================== Static Methods =====================
	static formatCurrencyId(chainId: number, address: string): string {
		return [chainId, address].join(KEY_SEPARATOR)
	}
}
