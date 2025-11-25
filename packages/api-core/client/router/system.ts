import { coreContract } from "../../contracts"
import { SystemInfo } from "../../dto"
import { APIError } from "../error"

import { Router } from "./router"

export class SystemRouter extends Router<typeof coreContract> {
	async getSystemInfo(): Promise<SystemInfo> {
		const response = await this.client.system.info()
		switch (response.status) {
			case 200: {
				return response.body
			}
			case 400: {
				throw new APIError(response.status, "Failed to fetch system info")
			}
			default: {
				throw new APIError(response.status, "Failed to fetch system info")
			}
		}
	}
}
