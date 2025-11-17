import type { EmbeddedWalletUsecase, PrivyRepository, PrivyUsecase } from "@proxify/core"
import { EmbeddedWalletService } from "../services/embedded-wallet.service"

/**
 * Dependency Injection Container
 * Contains all services, repositories, and usecases
 */
export interface DIContainer {
	// Services (API layer)
	embeddedWalletService: EmbeddedWalletService

	// Usecases (business logic from @proxify/core)
	embeddedWalletUsecase: EmbeddedWalletUsecase
	privyUsecase: PrivyUsecase

	// Repositories (data access from @proxify/core)
	privyRepository: PrivyRepository
}

/**
 * Service Container Implementation
 */
export class ServiceContainer implements DIContainer {
	public readonly embeddedWalletService: EmbeddedWalletService

	constructor(
		public readonly embeddedWalletUsecase: EmbeddedWalletUsecase,
		public readonly privyUsecase: PrivyUsecase,
		public readonly privyRepository: PrivyRepository,
	) {
		// Initialize service with usecase dependency
		this.embeddedWalletService = new EmbeddedWalletService(embeddedWalletUsecase)
	}
}

/**
 * Factory function to create service container
 */
export function createServiceContainer(
	embeddedWalletUsecase: EmbeddedWalletUsecase,
	privyUsecase: PrivyUsecase,
	privyRepository: PrivyRepository,
): DIContainer {
	return new ServiceContainer(embeddedWalletUsecase, privyUsecase, privyRepository)
}
