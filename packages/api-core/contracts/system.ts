import { initContract } from "@ts-rest/core"

import { SystemInfo } from "../dto/system"

const c = initContract()

export const systemContract = c.router({
	info: {
		method: "GET",
		path: "/system/info",
		responses: {
			200: SystemInfo,
		},
	},
})
