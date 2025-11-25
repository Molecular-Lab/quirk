/**
 * B2B API Client
 * Type-safe client for B2B API with domain routers
 */

import { type AxiosInstance } from "axios";

import { b2bContract } from "../contracts";
import { initRawAPIClient, type RawAPIClient } from "./rawClient";
import { ClientRouter } from "./routers/client.router";
import { DepositRouter } from "./routers/deposit.router";
import { PrivyAccountRouter } from "./routers/privy-account.router";
import { UserRouter } from "./routers/user.router";
import { UserVaultRouter } from "./routers/user-vault.router";
import { VaultRouter } from "./routers/vault.router";
import { WithdrawalRouter } from "./routers/withdrawal.router";

export interface B2BAPIClientConfig {
	apiUrl: string;
}

export class B2BAPIClient {
	private rawClient: RawAPIClient<typeof b2bContract>;

	// Domain routers
	client: ClientRouter;
	vault: VaultRouter;
	user: UserRouter;
	userVault: UserVaultRouter;
	deposit: DepositRouter;
	withdrawal: WithdrawalRouter;
	privyAccount: PrivyAccountRouter;

	constructor(axios: AxiosInstance, config: B2BAPIClientConfig) {
		this.rawClient = initRawAPIClient(axios, config.apiUrl, b2bContract);

		// Initialize routers
		this.client = new ClientRouter(this.rawClient);
		this.vault = new VaultRouter(this.rawClient);
		this.user = new UserRouter(this.rawClient);
		this.userVault = new UserVaultRouter(this.rawClient);
		this.deposit = new DepositRouter(this.rawClient);
		this.withdrawal = new WithdrawalRouter(this.rawClient);
		this.privyAccount = new PrivyAccountRouter(this.rawClient);
	}
}

export * from "./error";
export * from "./rawClient";
export * from "./router";
export * from "./routers/client.router";
export * from "./routers/vault.router";
export * from "./routers/user.router";
export * from "./routers/user-vault.router";
export * from "./routers/deposit.router";
export * from "./routers/withdrawal.router";
export * from "./routers/privy-account.router";
