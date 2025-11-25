/**
 * @proxify/privy-client
 *
 * Thin wrapper package for Privy wallet operations
 * Following Clean Architecture - all business logic is in @proxify/core
 *
 * This package provides:
 * 1. Privy client configuration (singleton)
 * 2. Environment configuration
 * 3. Chain configuration
 * 4. Convenient factory functions to initialize repositories and usecases
 *
 * Usage:
 * ```typescript
 * import { initializePrivyServices } from '@proxify/privy-client'
 *
 * const services = initializePrivyServices()
 * const result = await services.embeddedWallet.createEmbeddedWallet({
 *   productId: "my-app",
 *   userId: "user123",
 *   chainType: "ethereum"
 * })
 * ```
 */

// ===== Re-export from @proxify/core =====

// Entities
export type {
	PrivyUser,
	PrivyLinkedAccount,
	PrivyEmbeddedWallet,
	PrivyWallet,
	UserEmbeddedWallet,
	CreateEmbeddedWalletParams,
	GetWalletByUserIdParams,
	GetWalletByAddressParams,
} from "@proxify/core"

// Datagateway Interfaces
export type {
	IPrivyUserDataGateway,
	IPrivyWalletDataGateway,
	IUserEmbeddedWalletDataGateway,
} from "@proxify/core"

// Repository Classes
// Note: PrivyRepository and related repos are not exported from @proxify/core (moved to ./old)
// These are disabled in this package

// Usecase Classes
export { PrivyUsecase, EmbeddedWalletUsecase } from "@proxify/core"

// ===== Configuration =====
export { PrivyConfig } from "./config/privy.config"
export { ENV, type ENV_TYPE } from "./config/env"
export { chains, getChainConfig, getEnabledChains, isChainSupported, type SupportedChain, type ChainConfig } from "./config/chains"

// ===== Factory & Initialization =====
export { initializePrivyServices, type PrivyServices } from "./factory"
