import { randomBytes } from "crypto"

import { initServer } from "@ts-rest/fastify"
import { exportJWK, importSPKI } from "jose"
import { sign } from "jsonwebtoken"
import { type Hex, getAddress, isAddressEqual, recoverTypedDataAddress } from "viem"

import { parseSignData } from "@rabbitswap/api-core"
import { particleContract } from "@rabbitswap/api-core/contracts/particle"

export const createParticleRouter = (
	s: ReturnType<typeof initServer>,
	{ privateKey, publicKey }: { privateKey: string; publicKey: string },
) => {
	return s.router(particleContract, {
		login: async ({ body: { signData: rawSignData, signature } }) => {
			try {
				const signData = parseSignData(rawSignData)

				// Verify the signature
				const recoveredAddress = await recoverTypedDataAddress({
					domain: signData.domain,
					types: signData.types,
					primaryType: signData.primaryType,
					message: signData.message,
					signature: signature as Hex,
				})

				// Verify the recovered address matches the message address
				if (!isAddressEqual(recoveredAddress, getAddress(signData.message.address))) {
					return {
						status: 400,
						body: {
							message: "Invalid signature",
						},
					}
				}

				const timestamp = Math.floor(Date.now() / 1000)

				// Create JWT token with exact payload structure
				const token = sign(
					{
						sub: signData.message.address,
						name: signData.message.address,
						iss: "particle-network",
						aud: "rabbitswap.xyz",
						iat: timestamp,
						nbf: timestamp,
					},
					privateKey,
					{
						algorithm: "RS256",
						expiresIn: "24h",
					},
				)

				return {
					status: 200,
					body: {
						jwtToken: token,
					},
				}
			} catch {
				return {
					status: 400,
					body: {
						message: "Invalid signature or data",
					},
				}
			}
		},

		signMessage: ({ params: { chainId, address } }) => {
			return new Promise((resolve) => {
				try {
					const nonce = randomBytes(32).toString("hex")
					const timestamp = Math.floor(Date.now() / 1000)

					resolve({
						status: 200,
						body: {
							signData: {
								types: {
									EIP712Domain: [
										{ name: "name", type: "string" },
										{ name: "version", type: "string" },
										{ name: "chainId", type: "uint256" },
									],
									ParticleLogin: [
										{ name: "address", type: "address" },
										{ name: "nonce", type: "string" },
										{ name: "timestamp", type: "uint256" },
										{ name: "feature", type: "string" },
									],
								},
								domain: {
									name: "RabbitOrder",
									version: "1",
									chainId: chainId,
								},
								primaryType: "ParticleLogin",
								message: {
									address: address as Hex,
									nonce: nonce,
									timestamp: timestamp.toString(),
									feature: "particle-login",
								},
							},
						},
					})
				} catch {
					return {
						status: 400,
						body: {
							message: "Failed to generate sign message data",
						},
					}
				}
			})
		},

		jwks: async () => {
			const publicKeySPKI = await importSPKI(publicKey, "RS256")
			const publicJwk = await exportJWK(publicKeySPKI)

			return Promise.resolve({
				status: 200,
				body: {
					keys: [publicJwk],
				},
			})
		},
	})
}
