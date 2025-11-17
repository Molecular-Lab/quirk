import { initializePrivyServices, type PrivyServices } from "../../../../packages/old-ref-privy-client/src"
import type { IUserEmbeddedWalletDataGateway } from "@proxify/core"
import { createServiceContainer, type DIContainer } from "./container"

/**
 * Service Factory
 * Creates and wires up all dependencies
 */
export class ServiceFactory {
	private privyServices: PrivyServices

	constructor(userWalletRepository: IUserEmbeddedWalletDataGateway) {
		// Initialize Privy services from privy-client package
		this.privyServices = initializePrivyServices(userWalletRepository)
	}

	/**
	 * Create DI container with all services
	 */
	createContainer(): DIContainer {
		return createServiceContainer(
			this.privyServices.embeddedWalletUsecase,
			this.privyServices.privyUsecase,
			this.privyServices.privyRepository,
		)
	}
}

/**
 * Helper function to create service factory
 */
export function createServiceFactory(userWalletRepository: IUserEmbeddedWalletDataGateway): ServiceFactory {
	return new ServiceFactory(userWalletRepository)
}
