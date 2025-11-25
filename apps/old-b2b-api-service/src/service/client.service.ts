/**
 * B2B Client Service
 * Business logic layer that orchestrates UseCases
 */

import type { B2BClientUseCase } from "@proxify/core";
import type {
	CreateClientDto,
	AddFundsDto,
	ReserveFundsDto,
	ReleaseFundsDto,
	DeductReservedDto,
} from "@proxify/b2b-api-core";

export class ClientService {
	constructor(private readonly clientUseCase: B2BClientUseCase) {}

	/**
	 * Create a new client organization
	 */
	async createClient(data: CreateClientDto) {
		return await this.clientUseCase.createClient({
			companyName: data.companyName,
			businessType: data.businessType,
			description: data.description,
			websiteUrl: data.websiteUrl,
			walletType: data.walletType,
			privyOrganizationId: data.privyOrganizationId,
		});
	}

	/**
	 * Get client by ID
	 */
	async getClientById(id: string) {
		return await this.clientUseCase.getClientById(id);
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
	async getClientBalance(id: string) {
		return await this.clientUseCase.getClientBalance(id);
	}

	/**
	 * Add funds to client balance
	 */
	async addFunds(id: string, data: AddFundsDto) {
		return await this.clientUseCase.addFunds(id, {
			amount: data.amount,
			source: data.source,
			reference: data.reference,
		});
	}

	/**
	 * Reserve funds from available balance
	 */
	async reserveFunds(id: string, data: ReserveFundsDto) {
		return await this.clientUseCase.reserveFunds(id, {
			amount: data.amount,
			purpose: data.purpose,
			reference: data.reference,
		});
	}

	/**
	 * Release reserved funds
	 */
	async releaseReservedFunds(id: string, data: ReleaseFundsDto) {
		return await this.clientUseCase.releaseReservedFunds(id, {
			amount: data.amount,
			reference: data.reference,
		});
	}

	/**
	 * Deduct reserved funds
	 */
	async deductReservedFunds(id: string, data: DeductReservedDto) {
		return await this.clientUseCase.deductReservedFunds(id, {
			amount: data.amount,
			reference: data.reference,
		});
	}

	/**
	 * Get client statistics
	 */
	async getClientStats(id: string) {
		return await this.clientUseCase.getClientStats(id);
	}
}
