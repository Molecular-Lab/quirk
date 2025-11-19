/**
 * B2B API Contracts
 * Combines all domain contracts into a single router
 */

import { initContract } from "@ts-rest/core";

import { clientContract } from "./client";
import { depositContract } from "./deposit";
import { userContract } from "./user";
import { userVaultContract } from "./user-vault";
import { vaultContract } from "./vault";
import { withdrawalContract } from "./withdrawal";

const c = initContract();

export const b2bContract = c.router(
	{
		client: clientContract,
		vault: vaultContract,
		user: userContract,
		userVault: userVaultContract,
		deposit: depositContract,
		withdrawal: withdrawalContract,
	},
	{
		pathPrefix: "/api/v1",
	}
);

export * from "./client";
export * from "./vault";
export * from "./user";
export * from "./user-vault";
export * from "./deposit";
export * from "./withdrawal";
