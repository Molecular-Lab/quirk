import type { Request, Response, NextFunction } from "express";
import type { B2BClientUseCase } from "@proxify/core";
import { logger } from "../logger";

/**
 * API Key Authentication Middleware
 * 
 * Validates API keys from x-api-key header using bcrypt verification.
 * Attaches authenticated client to request object for downstream use.
 * 
 * Security features:
 * - Constant-time comparison via bcrypt
 * - Prefix-based fast lookup (O(1)) before expensive bcrypt (O(n))
 * - Checks client.isActive status
 * - Environment separation (prod_pk vs test_pk)
 * 
 * Usage:
 * ```typescript
 * import { apiKeyAuth } from './middleware/apiKeyAuth';
 * 
 * router.post('/api/v1/users', apiKeyAuth(clientUseCase), async (req, res) => {
 *   const client = req.client; // Authenticated client
 *   // ...
 * });
 * ```
 */
export function apiKeyAuth(clientUseCase: B2BClientUseCase) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Extract API key from header
			const apiKey = req.headers["x-api-key"] as string | undefined;

			if (!apiKey) {
				logger.warn("[API Key Auth] Missing API key", { 
					path: req.path,
					method: req.method 
				});
				return res.status(401).json({
					success: false,
					error: "Missing API key. Please provide 'x-api-key' header.",
					hint: "Get your API key from client registration response and save it securely.",
				});
			}

			// Validate API key format (basic check before expensive bcrypt)
			const apiKeyRegex = /^(prod|test)_pk_[a-f0-9]{32}$/;
			if (!apiKeyRegex.test(apiKey)) {
				logger.warn("[API Key Auth] Invalid API key format", { 
					path: req.path,
					prefix: apiKey.substring(0, 8) 
				});
				return res.status(401).json({
					success: false,
					error: "Invalid API key format",
					hint: "API key must be in format: {env}_pk_{32_hex_chars}",
				});
			}

			// Validate API key with bcrypt (constant-time comparison)
			const client = await clientUseCase.validateApiKey(apiKey);

			if (!client) {
				logger.warn("[API Key Auth] Invalid API key", { 
					path: req.path,
					prefix: apiKey.substring(0, 8) 
				});
				return res.status(401).json({
					success: false,
					error: "Invalid API key",
					hint: "API key not found or has been revoked. Please check your credentials.",
				});
			}

			// Check if client is active
			if (!client.isActive) {
				logger.warn("[API Key Auth] Inactive client attempted access", { 
					clientId: client.id,
					productId: client.productId,
					path: req.path 
				});
				return res.status(403).json({
					success: false,
					error: "Client account is inactive",
					hint: "Your organization account has been deactivated. Please contact support.",
				});
			}

			logger.info("[API Key Auth] Authentication successful", {
				clientId: client.id,
				productId: client.productId,
				companyName: client.companyName,
				path: req.path,
			});

			// Attach client to request for downstream use
			// @ts-ignore - Extending Request type
			req.client = client;

			next();
		} catch (error) {
			logger.error("[API Key Auth] Authentication failed", { 
				error: error instanceof Error ? error.message : "Unknown error",
				path: req.path 
			});
			return res.status(500).json({
				success: false,
				error: "Authentication failed",
				hint: "Internal server error during authentication. Please try again.",
			});
		}
	};
}

/**
 * TypeScript type extension for Request object
 * Add this to your global types or import where needed
 */
declare global {
	namespace Express {
		interface Request {
			client?: {
				id: string;
				productId: string;
				companyName: string;
				businessType: string;
				isActive: boolean;
				isSandbox: boolean;
				privyOrganizationId: string;
				privyWalletType: "custodial" | "non-custodial";
				createdAt: Date;
				updatedAt: Date;
			};
		}
	}
}
