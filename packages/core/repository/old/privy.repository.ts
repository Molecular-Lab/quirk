import { PrivyClient } from "@privy-io/node"

import { PrivyWalletRepository } from "./wallet.repository"
import { PrivyUserRepository } from "./user.repository"

/**
 * Privy Repository Aggregator
 * Combines all Privy-related repositories
 * Following pattern from Proxify architecture
 */
export class PrivyRepository {
	readonly wallet: PrivyWalletRepository
	readonly user: PrivyUserRepository

	constructor(private readonly privyClient: PrivyClient) {
		this.wallet = new PrivyWalletRepository(this.privyClient)
		this.user = new PrivyUserRepository(this.privyClient)
	}
}
