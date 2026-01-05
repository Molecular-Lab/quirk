/**
 * Main Router - combines all domain routers
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@quirk/b2b-api-core";
import type { DefiTransactionsRepository } from "@quirk/core";
import { createClientRouter } from "./client.router";
import { createDashboardRouter } from "./dashboard.router";
import { createDeFiProtocolRouter } from "./defi-protocol.router";
import { createVaultRouter } from "./vault.router";
import { createUserRouter } from "./user.router";
import { createDepositRouter } from "./deposit.router";
import { createWithdrawalRouter } from "./withdrawal.router";
import { createUserVaultRouter } from "./user-vault.router";
import { createPrivyAccountRouter } from "./privy-account.router";
import { createExplorerRouter } from "./explorer.router";
import type { ClientService } from "../service/client.service";
import type { DeFiProtocolService } from "../service/defi-protocol.service";
import type { DeFiExecutionService } from "../service/defi-execution.service";
import type { VaultService } from "../service/vault.service";
import type { UserService } from "../service/user.service";
import type { DepositService } from "../service/deposit.service";
import type { WithdrawalService } from "../service/withdrawal.service";
import type { UserVaultService } from "../service/user-vault.service";
import type { PrivyAccountService } from "../service/privy-account.service";
import type { ExplorerService } from "../service/explorer.service";

export const createMainRouter = (
	s: ReturnType<typeof initServer>,
	services: {
		clientService: ClientService;
		defiProtocolService: DeFiProtocolService;
		defiExecutionService: DeFiExecutionService;
		vaultService: VaultService;
		userService: UserService;
		depositService: DepositService;
		withdrawalService: WithdrawalService;
		userVaultService: UserVaultService;
		privyAccountService: PrivyAccountService;
		explorerService: ExplorerService;
		defiTransactionsRepository?: DefiTransactionsRepository;
	}
) => {
	return s.router(b2bContract, {
		client: createClientRouter(s, services.clientService),
		dashboard: createDashboardRouter(s, services.vaultService, services.userService),
		defiProtocol: createDeFiProtocolRouter(s, {
			defiService: services.defiProtocolService,
			executionService: services.defiExecutionService,
			clientService: services.clientService,
			vaultService: services.vaultService,
			defiTransactionsRepository: services.defiTransactionsRepository,
		}) as any, // TS type path mismatch workaround
		explorer: createExplorerRouter(s, services.explorerService),
		vault: createVaultRouter(s, services.vaultService),
		user: createUserRouter(s, services.userService, services.userVaultService),
		userVault: createUserVaultRouter(s, services.userVaultService),
		deposit: createDepositRouter(s, services.depositService, services.clientService, services.vaultService),
		withdrawal: createWithdrawalRouter(s, services.withdrawalService),
		privyAccount: createPrivyAccountRouter(s, services.privyAccountService),
	});
}
