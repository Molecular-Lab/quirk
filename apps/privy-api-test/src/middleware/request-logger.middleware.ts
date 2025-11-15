import type { Request, Response, NextFunction } from "express"
import dayjs from "dayjs"
import { logger } from "../config/logger"

/**
 * Request Logger Middleware
 * Logs all incoming HTTP requests and their responses
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
	const startTime = dayjs().valueOf()

	// Log incoming request
	logger.info("📥 Incoming Request", {
		method: req.method,
		path: req.path,
		query: req.query,
		body: req.body,
		ip: req.ip,
		userAgent: req.get("user-agent"),
	})

	// Capture response
	const originalSend = res.send
	res.send = function (body: any) {
		const duration = dayjs().valueOf() - startTime

		// Log response
		logger.info("📤 Response Sent", {
			method: req.method,
			path: req.path,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
			success: res.statusCode >= 200 && res.statusCode < 400,
		})

		// Log response body for errors
		if (res.statusCode >= 400) {
			logger.error("❌ Error Response", {
				method: req.method,
				path: req.path,
				statusCode: res.statusCode,
				body: typeof body === "string" ? JSON.parse(body) : body,
			})
		}

		return originalSend.call(this, body)
	}

	next()
}
