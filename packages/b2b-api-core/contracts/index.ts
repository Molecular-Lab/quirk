/**
 * B2B API Contracts
 * Combines all domain contracts into a single router
 */

import { initContract } from "@ts-rest/core";

import { clientContract } from "./client";
import { dashboardContract } from "./dashboard";
import { depositContract } from "./deposit";
import { privyAccountContract } from "./privy-account";
import { userContract } from "./user";
import { userVaultContract } from "./user-vault";
import { vaultContract } from "./vault";
import { withdrawalContract } from "./withdrawal";

const c = initContract();

export const b2bContract = c.router(
	{
		client: clientContract,
		dashboard: dashboardContract,
		vault: vaultContract,
		user: userContract,
		userVault: userVaultContract,
		deposit: depositContract,
		withdrawal: withdrawalContract,
		privyAccount: privyAccountContract,
	},
	{
		pathPrefix: "/api/v1",
	}
);

export * from "./client";
export * from "./dashboard";
export * from "./vault";
export * from "./user";
export * from "./user-vault";
export * from "./deposit";
export * from "./withdrawal";
export * from "./privy-account";
