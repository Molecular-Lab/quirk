import {
	SafeClientAdapter,
	SafeInfo,
	SafeTransaction,
	SafeTransactionResult,
	TransactionResult,
} from "@proxify/core"
import { Address, Hash } from "viem"
import { GnosisSafeClient } from "./gnosis-client"

/**
 * Adapter to make GnosisSafeClient compatible with SafeClientAdapter interface
 */
export class GnosisSafeAdapter implements SafeClientAdapter {
	constructor(private readonly gnosisClient: GnosisSafeClient) {}

	async getInfo(safeAddress: Address): Promise<SafeInfo> {
		const protocolKit = this.gnosisClient.getProtocolKit()
		const [owners, threshold, nonce, chainId] = await Promise.all([
			protocolKit.getOwners(),
			protocolKit.getThreshold(),
			protocolKit.getNonce(),
			protocolKit.getChainId(),
		])

		return {
			address: safeAddress,
			chainId: chainId,
			owners: owners as Address[],
			threshold,
			nonce,
		}
	}

	async sendTransaction(tx: SafeTransaction): Promise<TransactionResult> {
		try {
			const result = await this.proposeTransaction(tx)
			return {
				success: true,
				safeTxHash: result.safeTxHash,
				message: "Transaction proposed successfully",
			}
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Unknown error",
			}
		}
	}

	async executeTransaction(tx: SafeTransaction): Promise<Hash> {
		const protocolKit = this.gnosisClient.getProtocolKit()
		const safeTransaction = await protocolKit.createTransaction({
			transactions: [tx],
		})

		const executeTxResponse = await protocolKit.executeTransaction(safeTransaction)
		return executeTxResponse.hash as Hash
	}

	async signTransaction(tx: SafeTransaction): Promise<SafeTransactionResult> {
		const protocolKit = this.gnosisClient.getProtocolKit()
		const safeTransaction = await protocolKit.createTransaction({
			transactions: [tx],
		})

		const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
		const signature = await protocolKit.signHash(safeTxHash)
		const nonce = await protocolKit.getNonce()

		return {
			safeTxHash,
			nonce,
			signatures: [signature.data],
		}
	}

	async proposeTransaction(tx: SafeTransaction): Promise<SafeTransactionResult> {
		const protocolKit = this.gnosisClient.getProtocolKit()
		const safeAddress = (await protocolKit.getAddress()) as Address

		// Use the existing proposeTransaction method
		await this.gnosisClient.proposeTransaction([tx], safeAddress)

		const safeTransaction = await protocolKit.createTransaction({
			transactions: [tx],
		})
		const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
		const nonce = await protocolKit.getNonce()

		return {
			safeTxHash,
			nonce,
		}
	}
}
