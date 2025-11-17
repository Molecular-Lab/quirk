import { Address } from "viem"
import { getChainConfig, type SupportedChainId } from "./chain"

import * as SafeApiKitModule from "@safe-global/api-kit"
// Import as namespace to access both default and named exports
import * as ProtocolKit from "@safe-global/protocol-kit"
import type { MetaTransactionData } from "@safe-global/safe-core-sdk-types"

// Type for Safe instance
type SafeInstance = any

export class GnosisSafeClient {
	private readonly protocolKit: SafeInstance
	private readonly apiKit: any

	private constructor(protocolKit: SafeInstance, apiKit: any) {
		this.protocolKit = protocolKit
		this.apiKit = apiKit
	}

	public static async create(config: {
		chainId: SupportedChainId
		safeAddress: Address
		masterSignerPrivateKey: Address
		gnosisApiKey?: string
	}): Promise<GnosisSafeClient> {
		const { chainId, safeAddress, masterSignerPrivateKey, gnosisApiKey } = config

		const chainConfigured = getChainConfig(chainId)

		// Access the actual Safe class (it's double-nested)
		const SafeClass = (ProtocolKit.default as any).default as any
		
		const protocolKit = await SafeClass.init({
			provider: chainConfigured.rpcUrl,
			signer: masterSignerPrivateKey,
			safeAddress: safeAddress,
		})

		// Access SafeApiKit class similarly
		console.log("SafeApiKitModule keys:", Object.keys(SafeApiKitModule))
		console.log("SafeApiKitModule.default:", (SafeApiKitModule as any).default)
		
		const SafeApiKitClass = (SafeApiKitModule as any).default?.default || (SafeApiKitModule as any).default || SafeApiKitModule
		
		console.log("SafeApiKitClass:", SafeApiKitClass)
		console.log("SafeApiKitClass type:", typeof SafeApiKitClass)
		
		const apiKit = new SafeApiKitClass({
			chainId: chainConfigured.chain.id,
			apiKey: gnosisApiKey,
		})

		return new GnosisSafeClient(protocolKit, apiKit)
	}

	async proposeTransaction(txData: MetaTransactionData[], senderAddress: Address) {
		const safeTransaction = await this.protocolKit.createTransaction({
			transactions: txData,
		})

		const safeTxHash = await this.protocolKit.getTransactionHash(safeTransaction)
		const senderSignature = await this.protocolKit.signHash(safeTxHash)

		await this.apiKit.proposeTransaction({
			safeAddress: await this.protocolKit.getAddress(),
			safeTransactionData: safeTransaction.data,
			safeTxHash,
			senderAddress: senderAddress,
			senderSignature: senderSignature.data,
		})
		// in this the secoundary keys go to sign on website first
		// https://docs.safe.global/sdk/api-kit/guides/propose-and-confirm-transactions
		// Docs for second key siging
	}

	getProtocolKit(): SafeInstance {
		return this.protocolKit
	}
}
