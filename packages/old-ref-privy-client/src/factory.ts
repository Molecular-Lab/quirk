import { PrivyClient } from "@privy-io/node"
import {
	PrivyUsecase,
	EmbeddedWalletUsecase,
	IUserEmbeddedWalletDataGateway,
} from "@proxify/core"
import { PrivyConfig } from "./config/privy.config"

/**
 * Privy Services Container
 * Contains all initialized repositories and usecases
 * 
 * NOTE: PrivyRepository is not exported from @proxify/core (in old/ folder)
 * This package is for reference only and doesn't include repository functionality
 */
export interface PrivyServices {
	// Privy Client
	privyClient: PrivyClient

	// Usecases
	privyUsecase: PrivyUsecase
	embeddedWalletUsecase: EmbeddedWalletUsecase

	// Helpers
	getPrivyClient: () => PrivyClient
}

/**
 * Initialize Privy Services
 * Factory function to create and wire up all Privy-related services
 *
 * @param userWalletRepository - Database repository for user-embedded-wallet mappings (required)
 * @returns Initialized services container
 *
 * @example
 * ```typescript
 * import { initializePrivyServices } from '@proxify/privy-client'
 * import { UserEmbeddedWalletRepository } from './repository/user-embedded-wallet.repository'
 *
 * // Initialize database repository
 * const userWalletRepo = new UserEmbeddedWalletRepository(db)
 *
 * // Initialize all Privy services
 * const services = initializePrivyServices(userWalletRepo)
 *
 * // Use services
 * const result = await services.embeddedWallet.createEmbeddedWallet({
 *   productId: "my-app",
 *   userId: "user123",
 *   chainType: "ethereum"
 * })
 * ```
 */
export function initializePrivyServices(
	userWalletRepository: IUserEmbeddedWalletDataGateway,
): PrivyServices {
	// 1. Get Privy client (singleton)
	const privyClient = PrivyConfig.getClient()

	// 2. Initialize Privy repositories - DISABLED (PrivyRepository not exported from @proxify/core)
	// const privyRepository = new PrivyRepository(privyClient)

	// 3. Initialize Privy usecase (low-level operations) - DISABLED
	// const privyUsecase = new PrivyUsecase(privyRepository.wallet, privyRepository.user)
	
	// Temporary workaround: Create empty usecase (not functional)
	const privyUsecase = {} as PrivyUsecase

	// 4. Initialize Embedded Wallet usecase (high-level operations) - DISABLED
	// const embeddedWalletUsecase = new EmbeddedWalletUsecase(privyRepository.user, userWalletRepository)
	const embeddedWalletUsecase = {} as EmbeddedWalletUsecase

	return {
		privyClient,
		privyUsecase,
		embeddedWalletUsecase,
		getPrivyClient: () => PrivyConfig.getClient(),
	}
}

/**
 * Initialize Privy Services with Custom Client
 * Use this when you want to provide your own PrivyClient instance
 * (e.g., for testing or custom configuration)
 *
 * @param privyClient - Custom PrivyClient instance
 * @param userWalletRepository - Database repository for user-embedded-wallet mappings
 * @returns Initialized services container
 *
 * @example
 * ```typescript
 * import { PrivyClient } from '@privy-io/node'
 * import { initializePrivyServicesWithClient } from '@proxify/privy-client'
 *
 * // Custom Privy client
 * const customClient = new PrivyClient({
 *   appId: 'test-app-id',
 *   appSecret: 'test-secret',
 * })
 *
 * const services = initializePrivyServicesWithClient(customClient, userWalletRepo)
 * ```
 */
export function initializePrivyServicesWithClient(
	privyClient: PrivyClient,
	userWalletRepository: IUserEmbeddedWalletDataGateway,
): PrivyServices {
	// Initialize repositories with custom client - DISABLED (PrivyRepository not exported from @proxify/core)
	// const privyRepository = new PrivyRepository(privyClient)

	// Initialize usecases - DISABLED
	// const privyUsecase = new PrivyUsecase(privyRepository.wallet, privyRepository.user)
	// const embeddedWalletUsecase = new EmbeddedWalletUsecase(privyRepository.user, userWalletRepository)
	
	const privyUsecase = {} as PrivyUsecase
	const embeddedWalletUsecase = {} as EmbeddedWalletUsecase

	return {
		privyClient,
		privyUsecase,
		embeddedWalletUsecase,
		getPrivyClient: () => privyClient,
	}
}
