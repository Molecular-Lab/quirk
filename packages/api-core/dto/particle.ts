import { z } from "zod"

export const PrimitiveSignDataSchema = z.object({
	types: z.object({
		EIP712Domain: z.array(
			z.object({
				name: z.enum(["name", "version", "chainId"]),
				type: z.enum(["string", "uint256"]),
			}),
		),
		ParticleLogin: z.array(
			z.object({
				name: z.enum(["address", "nonce", "timestamp", "feature"]),
				type: z.enum(["address", "string", "uint256"]),
			}),
		),
	}),
	domain: z.object({
		name: z.string(),
		version: z.string(),
		chainId: z.string(),
	}),
	primaryType: z.enum(["ParticleLogin", "EIP712Domain"]),
	message: z.object({
		address: z.string(),
		nonce: z.string(),
		timestamp: z.string(),
		feature: z.string(),
	}),
})
export type PrimitiveSignData = z.infer<typeof PrimitiveSignDataSchema>

export const SignDataSchema = z.object({
	types: z.object({
		EIP712Domain: z.array(
			z.object({
				name: z.enum(["name", "version", "chainId"]),
				type: z.enum(["string", "uint256"]),
			}),
		),
		ParticleLogin: z.array(
			z.object({
				name: z.enum(["address", "nonce", "timestamp", "feature"]),
				type: z.enum(["address", "string", "uint256"]),
			}),
		),
	}),
	domain: z.object({
		name: z.string(),
		version: z.string(),
		chainId: z.bigint(),
	}),
	primaryType: z.enum(["ParticleLogin", "EIP712Domain"]),
	message: z.object({
		address: z.string(),
		nonce: z.string(),
		timestamp: z.bigint(),
		feature: z.string(),
	}),
})
export type SignData = z.infer<typeof SignDataSchema>

export function parseSignData(signData: PrimitiveSignData): SignData {
	return {
		...signData,
		domain: { ...signData.domain, chainId: BigInt(signData.domain.chainId) },
		message: { ...signData.message, timestamp: BigInt(signData.message.timestamp) },
	}
}

export function parsePrimitiveSignData(signData: SignData): PrimitiveSignData {
	return {
		...signData,
		domain: { ...signData.domain, chainId: signData.domain.chainId.toString() },
		message: { ...signData.message, timestamp: signData.message.timestamp.toString() },
	}
}
