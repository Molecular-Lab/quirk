import { APIError } from "../error"

import { arkenContract } from "./contract"
import { ArkenQuoteRequest, ArkenQuoteResponse, GetDexConfigResponse } from "./dto"
import { ArkenAPIClient } from "./init-client"
import { RouteProtocols } from "./route-protocol"

export class ArkenRouter {
	private dexConfig: GetDexConfigResponse | undefined
	private routeProtocol: RouteProtocols | undefined

	constructor(protected client: ArkenAPIClient<typeof arkenContract>) {}

	async getRouteProtocol(): Promise<RouteProtocols> {
		if (this.routeProtocol) return this.routeProtocol
		await this.getDexConfig()
		return this.routeProtocol!
	}

	async getDexConfig(): Promise<GetDexConfigResponse> {
		if (this.dexConfig) return this.dexConfig
		const response = await this.client.appConigGetDex({ body: {} })
		switch (response.status) {
			case 200: {
				this.dexConfig = response.body
				this.routeProtocol = new RouteProtocols(response.body)
				return response.body
			}
			default: {
				throw new APIError(response.status, "Failed to fetch arken dex config")
			}
		}
	}

	async quote(
		req: Omit<ArkenQuoteRequest, "chain" | "includedSources"> & { chainId: number },
	): Promise<ArkenQuoteResponse> {
		const body: ArkenQuoteRequest = {
			...req,
			chain: req.chainId !== 88 ? "" : "viction",
			includedSources: req.chainId !== 88 ? ["Arken", "0x", "1inch"] : ["Arken"],
		}
		if (req.chainId !== 88) {
			throw new APIError(500, `Unsupported chain id=${req.chainId}`)
		}
		const response = await this.client.quote({ body: body })
		switch (response.status) {
			case 200: {
				return response.body
			}
			case 400: {
				throw new APIError(response.status, "Failed to fetch arken quote", {
					errorCode: response.body.error,
					message: response.body.error,
				})
			}
			default: {
				throw new APIError(response.status, "Failed to fetch arken quote")
			}
		}
	}
}
