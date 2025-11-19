import { type Address, type Hash } from "viem"

import { getExplorerLink } from "@/constants/explorer"

export interface TxSubmitResult<T> {
	hash: Address
	chainId: number
	address: Address
	data: T
}

type TxStatus = "pending" | "success" | "failed"

export type TxInterface<T> = TxSubmitResult<T> & { status?: TxStatus }

const KEY_SEPARATOR = "-"

export class Transaction<T = unknown> {
	hash: Hash
	chainId: number
	address: Address
	status: TxStatus
	data: T

	constructor({ hash, chainId, address, status, data }: TxInterface<T>) {
		this.hash = hash
		this.chainId = chainId
		this.address = address
		this.status = status ?? "pending"
		this.data = data
	}

	newStatus(status: TxStatus) {
		return new Transaction({
			hash: this.hash,
			chainId: this.chainId,
			address: this.address,
			data: this.data,
			status: status,
		})
	}

	get txId() {
		return Transaction.formatTxId(this.chainId, this.hash)
	}

	get explorerUrl() {
		return getExplorerLink(this.chainId, this.hash, "transaction")
	}

	// ========================= Static Methods =========================
	static formatTxId(chainId: number, hash: Address) {
		return `${chainId}${KEY_SEPARATOR}${hash}`
	}

	static parseTxId(txId: string): [number, Hash] {
		const splitTxId = txId.split(KEY_SEPARATOR)
		if (splitTxId.length !== 2) {
			throw new Error(`Invalid txId: ${txId}`)
		}
		const [chainId, hash] = splitTxId
		if (!chainId || !hash) {
			throw new Error(`Invalid txId: ${txId}`)
		}
		if (!chainId) {
			throw new Error(`Invalid chainId: ${chainId}`)
		}
		if (!hash.startsWith("0x")) {
			throw new Error(`Invalid hash format: ${hash}`)
		}
		return [parseInt(chainId), hash as Hash]
	}
}
