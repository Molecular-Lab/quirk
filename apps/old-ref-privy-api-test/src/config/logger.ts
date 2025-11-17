import winston from "winston"
import { ENV } from "./env"

/**
 * Logger Configuration
 * Using Winston for structured logging
 */

const logFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json(),
)

const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
		return `${timestamp} [${level}]: ${message} ${metaStr}`
	}),
)

export const logger = winston.createLogger({
	level: ENV.LOG_LEVEL || "info",
	format: logFormat,
	defaultMeta: { service: "privy-api-test" },
	transports: [
		// Console output
		new winston.transports.Console({
			format: consoleFormat,
		}),
		// Error log file
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
		}),
		// Combined log file
		new winston.transports.File({
			filename: "logs/combined.log",
		}),
	],
})

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from "fs"
if (!existsSync("logs")) {
	mkdirSync("logs")
}
