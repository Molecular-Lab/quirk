/**
 * B2B Client Service
 * Business logic layer - maps between API DTOs and UseCase layer
 */

import type { B2BClientUseCase } from "@proxify/core";
import type {
	CreateClientRequest,
	AddFundsRequest,
	ReserveFundsRequest,
	ReleaseFundsRequest,
	DeductReservedRequest,
} from "@proxify/core/dto/b2b";

export class ClientService {
	constructor(private readonly clientUseCase: B2BClientUseCase) {}

	/**
	 * Create new client
	 */
	async createClient(request: CreateClientRequest) {
		return await this.clientUseCase.createClient(request);
	}

	/**
	 * Get client by product ID
	 */
	async getClientByProductId(productId: string) {
		return await this.clientUseCase.getClientByProductId(productId);
	}

	/**
	 * Regenerate API key for existing client
	 * ⚠️ Returns new API key (shown only once!)
	 * ⚠️ Invalidates old API key immediately
	 */
	async regenerateApiKey(productId: string) {
		return await this.clientUseCase.regenerateApiKey(productId);
	}

	/**
	 * Get all clients by Privy Organization ID
	 */
	async getClientsByPrivyOrgId(privyOrganizationId: string) {
		return await this.clientUseCase.getClientsByPrivyOrgId(privyOrganizationId);
	}

	/**
	 * Get client balance
	 */
	async getClientBalance(clientId: string) {
		return await this.clientUseCase.getBalance(clientId);
	}

	/**
	 * Add funds to client balance
	 */
	async addFunds(request: AddFundsRequest) {
		return await this.clientUseCase.addFunds(request);
	}

	/**
	 * Reserve funds from available balance
	 */
	async reserveFunds(request: ReserveFundsRequest) {
		return await this.clientUseCase.reserveFunds(request);
	}

	/**
	 * Release reserved funds back to available
	 */
	async releaseReservedFunds(request: ReleaseFundsRequest) {
		return await this.clientUseCase.releaseFunds(request);
	}

	/**
	 * Deduct reserved funds (after withdrawal completed)
	 */
	async deductReservedFunds(request: DeductReservedRequest) {
		return await this.clientUseCase.deductReserved(request);
	}

	/**
	 * Configure vault strategies (FLOW 2)
	 */
	async configureStrategies(
		productId: string,
		data: {
			chain: string;
			tokenAddress: string;
			tokenSymbol?: string;
			strategies: Array<{ category: string; target: number }>;
		}
	) {
		return await this.clientUseCase.configureStrategies(productId, data);
	}
}
