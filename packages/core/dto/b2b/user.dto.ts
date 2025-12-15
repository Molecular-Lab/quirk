/**
 * B2B User DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface CreateUserRequest {
	clientId: string
	userId: string
	userType: string
	userWalletAddress?: string
}

export interface GetUserPortfolioRequest {
	clientId: string
	userId: string
}

export interface ListUsersByClientRequest {
	clientId: string
	limit?: number
	offset?: number
}
