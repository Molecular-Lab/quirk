import "dotenv/config"
import express from "express"
import { getChainConfig, getDefaultChainId } from "./config/chain"
import { ENV } from "./config/env"

import { GnosisSafeClient, ViemClient } from "../../../packages/old-ref-contract-executor-client/src"
import { createClientFactory } from "./di/factory"
import { createClientRegistryRouter } from "./routers/client-registry.router"
import { createControllerRouter } from "./routers/controller.router"
import { createProxifyRouter } from "./routers/proxify.router"

const app = express()
const PORT = ENV.PORT ?? "3001"

// Get default chain configuration
const defaultChainId = getDefaultChainId()
const chainConfig = getChainConfig(defaultChainId)

// Initialize ViemClient with signer private keys
ViemClient.init({
	oraclePrivateKey: ENV.SAFE_SIGNER_PRIVATE_KEY_1 as `0x${string}`,
	guardianPrivateKey: ENV.SAFE_SIGNER_PRIVATE_KEY_2 as `0x${string}`,
})

// Create service container with dependency injection
const main = async () => {
	// Initialize GnosisSafeClient if safe address is configured
	let gnosisClient: GnosisSafeClient | undefined

	if (chainConfig.safeAddress) {
		gnosisClient = await GnosisSafeClient.create({
			chainId: defaultChainId,
			safeAddress: chainConfig.safeAddress as `0x${string}`,
			masterSignerPrivateKey: ENV.SAFE_SIGNER_PRIVATE_KEY_1 as `0x${string}`,
		})
	}

	const clientFactory = createClientFactory({
		chainId: defaultChainId,
		proxifyContractAddress: chainConfig.proxifyAddress! as `0x${string}`,
		controllerContractAddress: chainConfig.proxifyControllerAddress! as `0x${string}`,
		clientRegistryContractAddress: chainConfig.proxifyClientRegistryAddress! as `0x${string}`,
		safeClient: gnosisClient,
	})

	const serviceContainer = clientFactory.createContainer()

	// Store container in app locals for access in routes
	app.locals.serviceContainer = serviceContainer
	app.locals.masterSignerPrivateKey = ENV.SAFE_SIGNER_PRIVATE_KEY_1
	app.locals.chainConfig = chainConfig
	app.locals.chainId = defaultChainId

	app.use(express.json())

	app.get("/", (_req, res) => {
		res.send("Contract Executor API is running!")
	})

	// API routes with dependency injection
	app.use("/api/v1/proxify", createProxifyRouter(serviceContainer))
	app.use("/api/v1/controller", createControllerRouter(serviceContainer))
	app.use("/api/v1/client-registry", createClientRegistryRouter(serviceContainer))

	// Basic error handling middleware
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		console.error(err.stack)
		res.status(500).send("Something broke!")
	})

	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`)
		console.log(`📡 Chain ID: ${defaultChainId}`)
		console.log(`📝 proxify Address: ${chainConfig.proxifyAddress}`)
		console.log(`🎮 Controller Address: ${chainConfig.proxifyControllerAddress}`)
		console.log(`📋 Client Registry Address: ${chainConfig.proxifyClientRegistryAddress}`)
	})
}

// Start the application
main().catch((error) => {
	console.error("Failed to start application:", error)
	process.exit(1)
})
