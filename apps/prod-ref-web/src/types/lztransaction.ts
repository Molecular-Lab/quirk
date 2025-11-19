import { Transaction, TxInterface } from "@/types/transaction"

export class LzTransaction<T = unknown> extends Transaction<T> {
	constructor({ hash, chainId, address, status, data }: TxInterface<T>) {
		super({ hash, chainId, address, status, data })
	}

	get explorerUrl() {
		return `https://layerzeroscan.com/tx/${this.hash}`
	}
}
