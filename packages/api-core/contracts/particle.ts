import { initContract } from "@ts-rest/core"
import { z } from "zod"

import { PrimitiveSignDataSchema } from "../dto/particle"

const c = initContract()

export const particleContract = c.router({
	login: {
		summary: "Particle Network Login",
		method: "POST",
		path: "/auth/particle/login",
		body: z.object({
			signData: PrimitiveSignDataSchema,
			signature: z.string().startsWith("0x"),
		}),
		responses: {
			200: z.object({
				jwtToken: z.string(),
			}),
			400: z.object({
				message: z.string(),
			}),
		},
	},

	signMessage: {
		summary: "Get sign message data for Particle Network login",
		method: "GET",
		path: "/auth/particle/sign-message/:chainId/:address",
		responses: {
			200: z.object({
				signData: PrimitiveSignDataSchema,
			}),
			400: z.object({
				message: z.string(),
			}),
		},
	},

	jwks: {
		summary: "Get JWKS (JSON Web Key Set)",
		method: "GET",
		path: "/auth/particle/.well-known/jwks.json",
		responses: {
			200: z.object({
				keys: z.array(
					z.object({
						kty: z.string().optional(),
						kid: z.string().optional(),
						n: z.string().optional(),
						e: z.string().optional(),
						alg: z.string().optional(),
						use: z.string().optional(),
					}),
				),
			}),
		},
	},
})
