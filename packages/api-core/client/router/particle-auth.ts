import { coreContract } from "../../contracts"
import { SignData } from "../../dto"
import { parsePrimitiveSignData, parseSignData } from "../../dto/particle"
import { APIError } from "../error"

import { Router } from "./router"

export class ParticleAuthRouter extends Router<typeof coreContract> {
	async getSignLoginData(chainId: number, address: string): Promise<SignData> {
		const response = await this.client.particle.signMessage({
			params: {
				chainId: chainId.toString(),
				address: address,
			},
		})

		switch (response.status) {
			case 200: {
				return parseSignData(response.body.signData)
			}
			case 400: {
				throw new APIError(response.status, "Failed to fetch sign data", {
					message: response.body.message,
					errorCode: "INVALID_REQUEST",
				})
			}
			default: {
				throw new APIError(response.status, "Failed to fetch sign data")
			}
		}
	}

	/**
	 * get jwt token from API to be sent to particle network
	 * @returns jwt token
	 */
	async login(signData: SignData, signature: string): Promise<string> {
		const response = await this.client.particle.login({
			body: {
				signData: parsePrimitiveSignData(signData),
				signature: signature,
			},
		})

		switch (response.status) {
			case 200: {
				return response.body.jwtToken
			}
			case 400: {
				throw new APIError(response.status, response.body.message, {
					message: response.body.message,
					errorCode: "INVALID_REQUEST",
				})
			}
			default: {
				throw new APIError(response.status, "Failed to login")
			}
		}
	}
}
