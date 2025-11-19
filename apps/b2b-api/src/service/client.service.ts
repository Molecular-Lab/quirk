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
}
