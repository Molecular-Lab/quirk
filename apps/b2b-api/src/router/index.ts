/**
 * Main Router - combines all domain routers
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import { createClientRouter } from "./client.router";
import { createDashboardRouter } from "./dashboard.router";
import { createVaultRouter } from "./vault.router";
import { createUserRouter } from "./user.router";
import { createDepositRouter } from "./deposit.router";
import { createWithdrawalRouter } from "./withdrawal.router";
import { createUserVaultRouter } from "./user-vault.router";
import { createPrivyAccountRouter } from "./privy-account.router";
import type { ClientService } from "../service/client.service";
import type { VaultService } from "../service/vault.service";
import type { UserService } from "../service/user.service";
import type { DepositService } from "../service/deposit.service";
import type { WithdrawalService } from "../service/withdrawal.service";
import type { UserVaultService } from "../service/user-vault.service";
import type { PrivyAccountService } from "../service/privy-account.service";

export const createMainRouter = (
	s: ReturnType<typeof initServer>,
	services: {
		clientService: ClientService;
		vaultService: VaultService;
		userService: UserService;
		depositService: DepositService;
		withdrawalService: WithdrawalService;
		userVaultService: UserVaultService;
		privyAccountService: PrivyAccountService;
	}
) => {
	return s.router(b2bContract, {
		client: createClientRouter(s, services.clientService),
		dashboard: createDashboardRouter(s, services.vaultService, services.userService),
		vault: createVaultRouter(s, services.vaultService),
		user: createUserRouter(s, services.userService, services.userVaultService),
		userVault: createUserVaultRouter(s, services.userVaultService),
		deposit: createDepositRouter(s, services.depositService, services.clientService),
		withdrawal: createWithdrawalRouter(s, services.withdrawalService),
		privyAccount: createPrivyAccountRouter(s, services.privyAccountService),
	});
}
