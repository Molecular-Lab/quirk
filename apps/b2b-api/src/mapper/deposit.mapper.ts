/**
 * Deposit DTO Mapper
 * Transforms database rows to API DTOs
 */

import type { GetDepositByOrderIDRow, CreateDepositRow } from "@quirk/sqlcgen";
import { BankAccountService } from "../service/bank-account.service";

interface BankAccount {
	currency: string;
	bank_name: string;
	account_number: string;
	account_name: string;
	bank_details?: {
		swift_code?: string;
		bank_code?: string;
		branch_code?: string;
		routing_number?: string;
		iban?: string;
		promptpay_id?: string;
	};
}

export function mapDepositToDto(
	deposit: GetDepositByOrderIDRow | CreateDepositRow,
	clientBankAccounts?: any[] // Not used anymore - payment instructions stored in deposit
) {
	// ✅ Calculate expected crypto amount (fiat → USD → USDC)
	const fiatAmount = parseFloat(deposit.fiatAmount || "0");
	const fiatCurrency = deposit.currency || "USD";

	// For now, assume 1:1 for USD, or use approximate rates
	// TODO: Fetch real exchange rates from API
	const exchangeRates: Record<string, number> = {
		USD: 1.0,
		SGD: 0.74,
		THB: 0.029,
		EUR: 1.09,
		TWD: 0.031,
		KRW: 0.00074,
	};
	const exchangeRate = exchangeRates[fiatCurrency] || 1.0;
	const usdAmount = fiatAmount * exchangeRate;
	const expectedCryptoAmount = usdAmount.toFixed(2); // USDC 1:1 with USD

	// ✅ Use stored payment instructions from deposit (frozen at creation time)
	const storedPaymentInstructions = (deposit as any).paymentInstructions;

	return {
		id: deposit.id,
		orderId: deposit.orderId,
		depositType: "external" as const, // All B2B deposits are external
		clientId: deposit.clientId,
		userId: deposit.userId,
		amount: deposit.fiatAmount || "0",
		status: mapDepositStatus(deposit.status),
		createdAt: deposit.createdAt.toISOString(),
		completedAt: deposit.completedAt?.toISOString(),

		// ✅ Return stored payment instructions (immutable, frozen at deposit creation)
		expectedCryptoAmount,
		expiresAt: deposit.expiresAt?.toISOString() || null,
		paymentInstructions: storedPaymentInstructions || null,
	};
}

export function mapDepositsToDto(
	deposits: GetDepositByOrderIDRow[]
) {
	return deposits.map((d) => mapDepositToDto(d));
}

function mapDepositStatus(status: string): "pending" | "completed" | "failed" {
	if (status === "completed") return "completed";
	if (status === "failed") return "failed";
	return "pending";
}
