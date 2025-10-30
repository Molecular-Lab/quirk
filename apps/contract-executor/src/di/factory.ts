import {
	GnosisSafeAdapter,
	GnosisSafeClient,
	ProxifyClient,
	ProxifyClientRegistryClient,
	ProxifyControllerClient,
	type SupportedChainId,
} from "@proxify/contract-executor-client"
import { ProxifyClientRegistryRepository, ProxifyControllerRepository, ProxifyRepository } from "@proxify/core"
import type { Address } from "viem"
import { createServiceContainer, type DIContainer } from "./container"

export interface ClientFactoryConfig {
	chainId: SupportedChainId
	proxifyContractAddress: Address
	controllerContractAddress: Address
	clientRegistryContractAddress: Address
	safeClient?: GnosisSafeClient
}

export class ClientFactory {
	constructor(private readonly config: ClientFactoryConfig) {}

	createContainer(): DIContainer {
		// Create clients
		const proxifyClient = new ProxifyClient(this.config.chainId, this.config.proxifyContractAddress)
		const controllerClient = new ProxifyControllerClient(
			this.config.safeClient!,
			this.config.chainId,
			this.config.controllerContractAddress,
		)
		const clientRegistryClient = new ProxifyClientRegistryClient(
			this.config.safeClient!,
			this.config.chainId,
			this.config.clientRegistryContractAddress,
		)

	// Create adapter for SafeClient
	const safeAdapter = this.config.safeClient ? new GnosisSafeAdapter(this.config.safeClient) : undefined

	// Create repositories with their dependencies
	const proxifyRepository = new ProxifyRepository(proxifyClient.read, safeAdapter)
	const controllerRepository = new ProxifyControllerRepository({
		getControllerClient: () => controllerClient,
	})
		const clientRegistryRepository = new ProxifyClientRegistryRepository({
			getClientRegistryClient: () => clientRegistryClient,
		})

		// Create and return the service container
		return createServiceContainer(
			proxifyRepository,
			controllerRepository,
			clientRegistryRepository,
			proxifyClient.read,
			controllerClient,
			clientRegistryClient,
			safeAdapter,
		)
	}
}

// Helper function to create a factory with default configuration
export function createClientFactory(config: ClientFactoryConfig): ClientFactory {
	return new ClientFactory(config)
}
