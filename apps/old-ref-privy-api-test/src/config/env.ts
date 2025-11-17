import { config } from "dotenv"
import { z } from "zod"

config()

const envSchema = z.object({
	// Server
	PORT: z.string().default("3002"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

	// Privy Credentials
	PRIVY_APP_ID: z.string().min(1, "PRIVY_APP_ID is required"),
	PRIVY_APP_SECRET: z.string().min(1, "PRIVY_APP_SECRET is required"),

	// Database (PostgreSQL)
	DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

	// Optional
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
})

export type ENV_TYPE = z.infer<typeof envSchema>

export const ENV = envSchema.parse(process.env)
