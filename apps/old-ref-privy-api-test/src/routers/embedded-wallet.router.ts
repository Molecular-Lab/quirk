import { Router } from "express"
import { EmbeddedWalletController } from "../controllers/embedded-wallet.controller"
import type { DIContainer } from "../di/container"

/**
 * Create Embedded Wallet Router
 * Routes for embedded wallet operations
 */
export function createEmbeddedWalletRouter(container: DIContainer): Router {
	const router = Router()
	const controller = new EmbeddedWalletController(container)

	// Create wallet
	router.post("/create", (req, res) => controller.createWallet(req, res))

	// Get wallet by userId
	router.get("/user/:productId/:userId", (req, res) => controller.getWalletByUserId(req, res))

	// Get wallet by wallet address
	router.get("/address/:productId/:walletAddress", (req, res) => controller.getWalletByAddress(req, res))

	// Link wallet address
	router.put("/link", (req, res) => controller.linkWallet(req, res))

	// Get detailed wallet info
	router.get("/details/:productId/:userId", (req, res) => controller.getWalletDetails(req, res))

	return router
}
