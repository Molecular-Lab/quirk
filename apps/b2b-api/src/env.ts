/**
 * Environment Configuration for B2B API
 */

import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().default("3001"),
	DATABASE_URL: z.string(),
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
	DEPLOYER_PRIVATE_KEY: z.string().optional(),
	PRIVATE_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	process.exit(1);
}

export const ENV = {
	...parsedEnv.data,
	PORT: parseInt(parsedEnv.data.PORT, 10),
};
