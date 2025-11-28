/**
 * Client DTO Mapper
 * Transforms database rows to API DTOs
 */

import type { BankAccount } from "@proxify/core/entity/database/client.entity";

interface ClientRow {
	id: string;
	productId: string;
	companyName: string;
	businessType: string;
	description: string | null;
	websiteUrl: string | null;
	walletType: string;
	privyOrganizationId: string;
	isActive: boolean;
	isSandbox: boolean;
	supportedCurrencies: string[] | null;
	bankAccounts: unknown; // JSONB from database
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Parse bank accounts from JSONB
 */
export function parseBankAccounts(bankAccountsJson: unknown): BankAccount[] {
	if (!bankAccountsJson) return [];

	try {
		// If it's already an array, return it
		if (Array.isArray(bankAccountsJson)) {
			return bankAccountsJson as BankAccount[];
		}

		// If it's a string, parse it
		if (typeof bankAccountsJson === "string") {
			return JSON.parse(bankAccountsJson) as BankAccount[];
		}

		return [];
	} catch (error) {
		console.error("Failed to parse bank accounts:", error);
		return [];
	}
}

/**
 * Map database row to Client DTO
 */
export function mapClientToDto(client: ClientRow) {
	return {
		id: client.id,
		productId: client.productId,
		companyName: client.companyName,
		businessType: client.businessType,
		description: client.description,
		websiteUrl: client.websiteUrl,
		walletType: client.walletType,
		privyOrganizationId: client.privyOrganizationId,
		isActive: client.isActive,
		isSandbox: client.isSandbox,
		supportedCurrencies: client.supportedCurrencies || [],
		bankAccounts: parseBankAccounts(client.bankAccounts),
		createdAt: client.createdAt.toISOString(),
		updatedAt: client.updatedAt.toISOString(),
	};
}

/**
 * Map multiple clients
 */
export function mapClientsToDto(clients: ClientRow[]) {
	return clients.map(mapClientToDto);
}

/**
 * Serialize bank accounts to JSONB string for database
 */
export function serializeBankAccounts(bankAccounts: BankAccount[]): string {
	return JSON.stringify(bankAccounts);
}

/**
 * Example bank account structures for different currencies
 */
export const BANK_ACCOUNT_EXAMPLES = {
	THB: {
		currency: "THB",
		bank_name: "Kasikorn Bank",
		account_number: "123-4-56789-0",
		account_name: "Company (Thailand) Co., Ltd.",
		bank_details: {
			swift_code: "KASITHBK",
			bank_code: "004",
			branch_code: "0001",
			promptpay_id: "0891234567",
			bank_address: "Bangkok, Thailand",
			contact_phone: "+66-2-123-4567",
		},
	},
	SGD: {
		currency: "SGD",
		bank_name: "DBS Bank (Singapore)",
		account_number: "XXX-XXXXX-X",
		account_name: "Company Pte. Ltd.",
		bank_details: {
			swift_code: "DBSSSGSG",
			bank_code: "7171",
			branch_code: "001",
			paynow_id: "UEN123456789A",
		},
	},
	USD: {
		currency: "USD",
		bank_name: "Citibank N.A.",
		account_number: "9876543210",
		account_name: "Company International Inc.",
		bank_details: {
			swift_code: "CITISGSG",
			routing_number: "021000089",
			account_type: "Business Checking",
			wire_instructions: "For international wires, include reference...",
		},
	},
} as const;
