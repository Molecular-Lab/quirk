/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
	ENVIRONMENT: z.enum(["local", "development", "production"]).default("local"),
	PORT: z.coerce.number().default(3000),
	SUBGRAPH: z.object({
		ENDPOINT: z.string().default("https://api.studio.thegraph.com/query/109849/rabbit-dex/version/latest"),
		API_KEY: z.string().default(""),
	}),
	DB: z.object({
		USER: z.string().default("postgres"),
		HOST: z.string().default("localhost"),
		NAME: z.string().default("postgres"),
		PASSWORD: z.string().default("password"),
		PORT: z.coerce.number().default(5432),
	}),
	REDIS: z.object({
		URL: z.string(),
		DB: z.coerce.number().default(3),
	}),
	PARTICLE: z.object({
		PRIVATE_KEY: z.string(),
		PUBLIC_KEY: z.string(),
	}),
})

export const ENV = envSchema.parse({
	ENVIRONMENT: process.env.ENVIRONMENT,
	PORT: process.env.PORT,
	SUBGRAPH: {
		ENDPOINT: process.env.SUBGRAPH_ENDPOINT,
		API_KEY: process.env.SUBGRAPH_API_KEY,
	},
	DB: {
		USER: process.env.DB_USER,
		HOST: process.env.DB_HOST,
		NAME: process.env.DB_NAME,
		PASSWORD: process.env.DB_PASSWORD,
		PORT: process.env.DB_PORT,
	},
	REDIS: {
		URL: process.env.REDIS_URL,
		DB: process.env.REDIS_DB,
	},
	PARTICLE: {
		PRIVATE_KEY: process.env.PARTICLE_PRIVATE_KEY,
		PUBLIC_KEY: process.env.PARTICLE_PUBLIC_KEY,
	},
})
