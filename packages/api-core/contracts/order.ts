import { initContract } from "@ts-rest/core"
import { z } from "zod"

import { OrderSchema } from "../dto/order"

const c = initContract()

export const orderContract = c.router({
	getOrder: {
		method: "GET",
		path: "/order/:orderId",
		responses: {
			200: z.object({
				order: OrderSchema,
			}),
			404: c.type<{ message: string }>(),
		},
	},
	getOrdersByWallet: {
		method: "GET",
		path: "/orders/:walletAddress",
		responses: {
			200: z.object({
				orders: z.array(OrderSchema),
			}),
		},
	},
})
