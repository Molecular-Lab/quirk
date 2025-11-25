import { coreContract } from "../../contracts"
import { TokenStats } from "../../dto"
import { Address } from "../../entity"
import { APIError } from "../error"

import { Router } from "./router"

export class TokenRouter extends Router<typeof coreContract> {
	async getAllTokens(_chainId: number) {
		const response = await this.client.token.getAllTokens()

		switch (response.status) {
			case 200: {
				return response.body.tokens
			}
			default: {
				throw new APIError(response.status, "Failed to fetch all tokens")
			}
		}
	}

	async getTokenByAddress(_chainId: number, address: Address) {
		const response = await this.client.token.getTokenByAddress({
			params: {
				address,
			},
		})

		switch (response.status) {
			case 200: {
				return response.body.token
			}
			default: {
				throw new APIError(response.status, "Failed to fetch token by address")
			}
		}
	}

	// tokenAddress -> stat
	async getTokensStats(_chainId: number): Promise<Record<string, TokenStats>> {
		const response = await this.client.token.getTokensStats()

		switch (response.status) {
			case 200: {
				return response.body.tokenStats
			}
			default: {
				throw new APIError(response.status, "Failed to fetch token stats")
			}
		}
	}
}
