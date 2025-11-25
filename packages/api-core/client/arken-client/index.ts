import { AxiosInstance } from "axios"
import forge, { Hex } from "node-forge"
import { v4 as uuidv4 } from "uuid"

import { arkenContract } from "./contract"
import { ARKEN_API_URL, ArkenAPIClient, initArkenAPIClient } from "./init-client"
import { ArkenRouter } from "./router"

export class ArkenClient {
	private arkenClient: ArkenAPIClient<typeof arkenContract>
	arkenRouter: ArkenRouter

	constructor(axiosClient: AxiosInstance) {
		axiosClient.interceptors.request.use((config) => {
			const headers: Record<string, string> = {
				"X-Request-ID": uuidv4(),
				...this.getValidatorHeader(config.url ?? "", config.data as unknown as object | string | undefined),
			}
			Object.assign(config.headers, headers)
			return config
		})

		this.arkenClient = initArkenAPIClient(axiosClient, arkenContract)
		this.arkenRouter = new ArkenRouter(this.arkenClient)
	}

	private hash(data: string): Hex {
		const md = forge.md.sha256.create()
		return md.update(data).digest().toHex()
	}

	private getValidatorHeader(url: string, data: object | string | undefined) {
		const timestampUnix = Math.round(Date.now() / 1000)
		const replacedUrl = url.replace(ARKEN_API_URL, "")
		const formattedData = typeof data === "object" ? JSON.stringify(data) : (data ?? "")
		const validatorData = `${replacedUrl}\n${timestampUnix}\n${formattedData}`

		const xValidator = this.hash(validatorData)

		return {
			"X-Validator-Timestamp": timestampUnix.toString(),
			"X-Validator": xValidator,
		}
	}
}
