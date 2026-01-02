/**
 * Winston Logger Configuration
 */

import winston from "winston";
import { ENV } from "./env";

export const logger = winston.createLogger({
	level: ENV.LOG_LEVEL,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message, ...meta }) => {
					// Single-line JSON (no pretty-printing)
					const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
					return `${timestamp} [${level}]: ${message}${metaStr}`;
				})
			),
		}),
	],
});
