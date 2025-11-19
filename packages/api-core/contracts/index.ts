import { initContract } from "@ts-rest/core"

import { exploreContract } from "./explore"
import { orderContract } from "./order"
import { particleContract } from "./particle"
import { poolContract } from "./pool"
import { swapContract } from "./swap"
import { systemContract } from "./system"
import { tokenContract } from "./token"
import { walletContract } from "./wallet"

const c = initContract()

export const coreContract = c.router({
	system: systemContract,
	token: tokenContract,
	swap: swapContract,
	explore: exploreContract,
	pool: poolContract,
	particle: particleContract,
	order: orderContract,
	wallet: walletContract,
})
