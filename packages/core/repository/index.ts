// Legacy datagateway exports (still in use)
export * from "../datagateway/privy-user.datagateway"
export * from "../datagateway/privy-wallet.datagateway"

// PostgreSQL B2B Database Repositories (Quirk Pattern with SQLC)
// This is the CURRENT implementation - all repositories use SQLC-generated types
export * from "./postgres"

// Old repositories moved to ./old/ for reference
// - See ./old/ for deprecated implementations
// NOTE: Old repositories have broken imports and are not exported
