import { type AxiosInstance } from "axios"

import { coreContract } from "../contracts"
import { coingeckoContract } from "../contracts/coingecko"

import { RawAPIClient, initRawAPIClient } from "./rawClient"
import { CoingeckoRouter } from "./router/coingecko"
import { ExploreRouter } from "./router/explore"
import { OrderRouter } from "./router/order"
import { ParticleAuthRouter } from "./router/particle-auth"
import { PoolRouter } from "./router/pool"
import { SwapRouter } from "./router/swap"
import { SystemRouter } from "./router/system"
import { TokenRouter } from "./router/token"
import { WalletRouter } from "./router/wallet"

export interface APIClientConfigs {
	rabbitApiUrl: string
	coingeckoApiUrl: string
}
export class APIClient {
	// main client
	private client: RawAPIClient<typeof coreContract>
	tokenRouter: TokenRouter
	poolRouter: PoolRouter
	swapRouter: SwapRouter
	exploreRouter: ExploreRouter
	orderRouter: OrderRouter
	walletRouter: WalletRouter
	systemRouter: SystemRouter

	// prod API
	particleAuthRouter: ParticleAuthRouter

	// coingecko client
	private coingeckoClient: RawAPIClient<typeof coingeckoContract>
	coingeckoRouter: CoingeckoRouter

	constructor(axios: AxiosInstance, configs: APIClientConfigs) {
		this.client = initRawAPIClient(axios, configs.rabbitApiUrl, coreContract)
		this.tokenRouter = new TokenRouter(this.client)
		this.poolRouter = new PoolRouter(this.client)
		this.swapRouter = new SwapRouter(this.client)
		this.exploreRouter = new ExploreRouter(this.client)
		this.orderRouter = new OrderRouter(this.client)
		this.walletRouter = new WalletRouter(this.client)
		this.systemRouter = new SystemRouter(this.client)

		// NOTE: particle auth has to use prod API
		const prodClient = initRawAPIClient(axios, "https://api.rabbitswap.xyz", coreContract)
		this.particleAuthRouter = new ParticleAuthRouter(prodClient)

		this.coingeckoClient = initRawAPIClient(axios, configs.coingeckoApiUrl, coingeckoContract)
		this.coingeckoRouter = new CoingeckoRouter(this.coingeckoClient)
	}
}
