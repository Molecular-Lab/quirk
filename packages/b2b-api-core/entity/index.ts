/**
 * B2B Entity Types
 * Pure TypeScript types without validation (not Zod schemas)
 */

export type UUID = string;
export type ISODateString = string;
export type BigIntString = string;

export enum ClientWalletType {
	MANAGED = "MANAGED",
	USER_OWNED = "USER_OWNED",
}

export enum TransactionStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}

export enum WithdrawalStatus {
	PENDING = "PENDING",
	QUEUED = "QUEUED",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}
