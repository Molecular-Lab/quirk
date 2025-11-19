/**
 * Main Router - combines all domain routers
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import { createClientRouter } from "./client.router";
import { createVaultRouter } from "./vault.router";
import { createUserRouter } from "./user.router";
import { createDepositRouter } from "./deposit.router";
import { createWithdrawalRouter } from "./withdrawal.router";
import { createUserVaultRouter } from "./user-vault.router";
import type { ClientService } from "../service/client.service";
import type { VaultService } from "../service/vault.service";
import type { UserService } from "../service/user.service";
import type { DepositService } from "../service/deposit.service";
import type { WithdrawalService } from "../service/withdrawal.service";
import type { UserVaultService } from "../service/user-vault.service";

export const createMainRouter = (
	s: ReturnType<typeof initServer>,
	services: {
		clientService: ClientService;
		vaultService: VaultService;
		userService: UserService;
		depositService: DepositService;
		withdrawalService: WithdrawalService;
		userVaultService: UserVaultService;
	}
) => {
	return s.router(b2bContract, {
		client: createClientRouter(s, services.clientService),
		vault: createVaultRouter(s, services.vaultService),
		user: createUserRouter(s, services.userService),
		userVault: createUserVaultRouter(s, services.userVaultService),
		deposit: createDepositRouter(s, services.depositService),
		withdrawal: createWithdrawalRouter(s, services.withdrawalService),
	});
}
