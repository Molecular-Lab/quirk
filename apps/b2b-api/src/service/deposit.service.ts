/**
 * Deposit Service - orchestrates B2B deposit operations
 */

import type { B2BDepositUseCase } from "@proxify/core";

export class DepositService {
	constructor(private depositUseCase: B2BDepositUseCase) {}

	async createDeposit(request: {
		orderId?: string;
		clientId: string;
		userId: string;
		depositType: "internal" | "external";
		fiatAmount: string;
		fiatCurrency: string;
		cryptoCurrency: string;
		gatewayProvider?: string;
		paymentUrl?: string;
		gatewayOrderId?: string;
		paymentInstructions?: any;
		chain?: string;
		tokenSymbol?: string;
		tokenAddress?: string;
		onRampProvider?: string;
		qrCode?: string;
		expiresAt?: Date;
	}) {
		return await this.depositUseCase.createDeposit(request);
	}

	async getDepositByOrderId(orderId: string) {
		return await this.depositUseCase.getDepositByOrderId(orderId);
	}

	async completeDeposit(request: {
		orderId: string;
		chain: string;
		tokenAddress: string;
		tokenSymbol: string;
		cryptoAmount: string;
		gatewayFee: string;
		proxifyFee: string;
		networkFee: string;
		totalFees: string;
	}) {
		return await this.depositUseCase.completeDeposit(request);
	}

	async failDeposit(orderId: string, errorMessage: string, errorCode?: string) {
		return await this.depositUseCase.failDeposit(orderId, errorMessage, errorCode);
	}

	async listDepositsByClient(clientId: string, limit?: number, offset?: number) {
		return await this.depositUseCase.listDepositsByClient(clientId, limit || 50, offset || 0);
	}

	async listDepositsByUser(clientId: string, userId: string, limit?: number) {
		return await this.depositUseCase.listDepositsByUser(clientId, userId, limit || 50);
	}

	async listAllPendingDeposits() {
		return await this.depositUseCase.listAllPendingDeposits();
	}

	async getDepositStats(clientId: string, startDate?: Date, endDate?: Date) {
		return await this.depositUseCase.getDepositStats(clientId, startDate, endDate);
	}

	async listPendingDeposits(clientId: string) {
		return await this.depositUseCase.listPendingDeposits(clientId);
	}

	async mintTokensToCustodial(
		chainId: string,
		tokenAddress: string,
		custodialWallet: string,
		amount: string
	) {
		return await this.depositUseCase.mintTokensToCustodial(
			chainId,
			tokenAddress,
			custodialWallet,
			amount
		);
	}
}

