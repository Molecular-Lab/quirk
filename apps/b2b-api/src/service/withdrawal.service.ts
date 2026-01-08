/**
 * Withdrawal Service - orchestrates B2B withdrawal operations
 */

import type { B2BWithdrawalUseCase } from "@quirk/core";

export class WithdrawalService {
	constructor(private withdrawalUseCase: B2BWithdrawalUseCase) {}

	async requestWithdrawal(request: {
		clientId: string;
		userId: string;
		chain: string;
		tokenAddress: string;
		amount: string;
		orderId: string;
		destinationType: "client_balance" | "bank_account" | "debit_card" | "crypto_wallet";
		destinationDetails?: any;
		environment?: "sandbox" | "production"; // ✅ Environment support
		network?: string; // ✅ Network support (e.g., "sepolia", "mainnet")
		oracleAddress?: string; // ✅ Oracle address
		deductFees?: boolean; // ✅ Optional fee deduction control (default: true)
	}) {
		return await this.withdrawalUseCase.requestWithdrawal(request);
	}

	async getWithdrawalById(id: string) {
		const withdrawal = await this.withdrawalUseCase.getWithdrawalById(id);
		return withdrawal;
	}

	async getWithdrawalByOrderId(orderId: string) {
		return await this.withdrawalUseCase.getWithdrawalByOrderId(orderId);
	}

	async completeWithdrawal(orderId: string, actualAmount?: string) {
		return await this.withdrawalUseCase.completeWithdrawal(orderId, actualAmount);
	}

	async failWithdrawal(orderId: string, errorMessage: string, errorCode?: string) {
		return await this.withdrawalUseCase.failWithdrawal(orderId, errorMessage, errorCode);
	}

	async listWithdrawalsByClient(clientId: string, limit?: number, offset?: number) {
		return await this.withdrawalUseCase.listWithdrawalsByClient(clientId, limit || 50, offset || 0);
	}

	async listWithdrawalsByUser(clientId: string, userId: string, limit?: number) {
		return await this.withdrawalUseCase.listWithdrawalsByUser(clientId, userId, limit || 50);
	}

	async getWithdrawalStats(clientId: string, startDate: Date, endDate: Date) {
		return await this.withdrawalUseCase.getWithdrawalStats(clientId, startDate, endDate);
	}

	async listPendingWithdrawals(environment?: "sandbox" | "production") {
		return await this.withdrawalUseCase.listPendingWithdrawalsByEnvironment(environment || "sandbox");
	}

	async listPendingWithdrawalsByClient(clientId: string, environment?: "sandbox" | "production") {
		if (environment) {
			return await this.withdrawalUseCase.listPendingWithdrawalsByClientAndEnvironment(clientId, environment);
		}
		return await this.withdrawalUseCase.listWithdrawalsByClient(clientId);
	}

	async transferFromCustodialToOracle(
		chainId: string,
		tokenAddress: string,
		oracleAddress: string,
		amount: string,
		custodialPrivateKey: string,
		rpcUrl?: string
	) {
		return await this.withdrawalUseCase.transferFromCustodialToOracle(
			chainId,
			tokenAddress,
			oracleAddress,
			amount,
			custodialPrivateKey,
			rpcUrl
		);
	}
}
