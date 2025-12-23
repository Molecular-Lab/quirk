/**
 * Bank Account Service
 * Maps currencies to Quirk's bank accounts for deposit instructions
 */

export interface BankAccount {
	currency: string;
	bankName: string;
	accountNumber: string;
	accountName: string;
	swiftCode: string;
	bankCode?: string;
	branchCode?: string;
	routingNumber?: string;
	iban?: string;
	promptPayId?: string;
	instructions: string;
}

export class BankAccountService {
	// Mock bank accounts (in production, fetch from database or environment variables)
	private static BANK_ACCOUNTS: Record<string, BankAccount> = {
		SGD: {
			currency: "SGD",
			bankName: "DBS Bank (Singapore)",
			accountNumber: "123-456789-0",
			accountName: "Quirk Pte. Ltd.",
			swiftCode: "DBSSSGSG",
			bankCode: "7171",
			branchCode: "001",
			instructions: "Transfer from your business bank account. Include reference ID in transfer notes for automatic processing. Same-day processing if transferred before 3 PM SGT.",
		},

		USD: {
			currency: "USD",
			bankName: "Citibank N.A. (Singapore Branch)",
			accountNumber: "9876543210",
			accountName: "Quirk Pte. Ltd.",
			swiftCode: "CITISGSG",
			routingNumber: "021000089",
			instructions: "Wire transfer from your USD business account. Include reference ID in wire instructions. Processing time: 1-2 business days.",
		},

		EUR: {
			currency: "EUR",
			bankName: "Wise (TransferWise Europe SA)",
			accountNumber: "BE12 3456 7890 1234",
			accountName: "Quirk Pte. Ltd.",
			swiftCode: "TRWIBEB1XXX",
			iban: "BE12 3456 7890 1234",
			instructions: "SEPA transfer from your EUR business account. Include reference ID in transfer notes. Processing time: Same-day (SEPA) or 1-2 days (SWIFT).",
		},

		THB: {
			currency: "THB",
			bankName: "Kasikorn Bank (K-Bank)",
			accountNumber: "123-4-56789-0",
			accountName: "Quirk (Thailand) Co., Ltd.",
			swiftCode: "KASITHBK",
			bankCode: "004",
			branchCode: "0001",
			promptPayId: "0891234567",
			instructions: "Transfer from your THB business account. Include reference ID. PromptPay available for amounts < 2M THB (instant). Bank transfer: same-day processing.",
		},

		TWD: {
			currency: "TWD",
			bankName: "Cathay United Bank",
			accountNumber: "123-45-678901-2",
			accountName: "Quirk Taiwan Ltd.",
			swiftCode: "UBOBTWTPXXX",
			bankCode: "013",
			branchCode: "0001",
			instructions: "Transfer from your TWD business account. Include reference ID in transfer notes. Processing time: Same-day.",
		},

		KRW: {
			currency: "KRW",
			bankName: "Shinhan Bank",
			accountNumber: "110-123-456789",
			accountName: "Quirk Korea Inc.",
			swiftCode: "SHBKKRSE",
			bankCode: "088",
			branchCode: "001",
			instructions: "Transfer from your KRW business account. Include reference ID in transfer notes. Processing time: Same-day.",
		},
	};

	static getBankAccount(currency: string): BankAccount {
		const account = this.BANK_ACCOUNTS[currency.toUpperCase()];
		if (!account) {
			throw new Error(`Currency ${currency} not supported. Supported currencies: ${this.getSupportedCurrencies().join(", ")}`);
		}
		return account;
	}

	static getSupportedCurrencies(): string[] {
		return Object.keys(this.BANK_ACCOUNTS);
	}

	static isCurrencySupported(currency: string): boolean {
		return currency.toUpperCase() in this.BANK_ACCOUNTS;
	}
}

// Mock exchange rates (in production: use CoinGecko, CoinMarketCap, or Binance API)
export async function getExchangeRate(from: string, to: string = "USD"): Promise<number> {
	const rates: Record<string, number> = {
		SGD: 0.768,   // 1 SGD = 0.768 USD
		USD: 1.00,    // 1 USD = 1.00 USD
		EUR: 1.157,   // 1 EUR = 1.157 USD
		THB: 0.0310,  // 1 THB = 0.0310 USD
		TWD: 0.0318,  // 1 TWD = 0.0318 USD
		KRW: 0.00068, // 1 KRW = 0.00068 USD
	};

	return rates[from.toUpperCase()] || 1;
}
