/**
 * Shared Demo Infrastructure
 *
 * This module exports the reusable demo components, hooks, and configurations
 * used across all demo platforms (E-commerce, Gig Workers, Creators).
 */

// Core component
export { BaseDemoApp } from "./components/BaseDemoApp"

// Platform configurations
export { ecommerceConfig } from "./config/ecommerce.config"
export { gigWorkersConfig } from "./config/gig-workers.config"
export { creatorsConfig } from "./config/creators.config"

// Type definitions
export type {
	PlatformConfig,
	PlatformMockData,
	MockBalances,
	CardConfig,
	Transaction,
} from "./config/platform-config.types"

// Hooks
export { useDemoBalance } from "./hooks/useDemoBalance"
