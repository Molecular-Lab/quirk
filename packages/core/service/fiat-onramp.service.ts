/**
 * Fiat On-Ramp Service
 *
 * Handles traditional payment gateway integration and fiat-to-crypto conversion.
 *
 * FLOW:
 * 1. Client (e.g., Shopify) initiates fiat deposit
 * 2. We create payment session via traditional gateway (Stripe Connect, wire, etc.)
 * 3. Client sends fiat from THEIR bank → OUR bank
 * 4. We use on-ramp provider to convert fiat → USDC
 * 5. USDC is sent to client's custodial wallet
 * 6. Webhook notifies us of completion
 *
 * PROVIDERS:
 * - Traditional Gateway: Stripe Connect, Wire Transfer, ACH, SEPA
 * - On-ramp: Circle (USDC minting), Coinbase Commerce, Bridge.xyz
 */

import { NETWORK_CONFIG, type NetworkKey, type TokenKey, getNetworkByChainId } from "../constants/networks"

export interface CreatePaymentSessionParams {
	clientId: string
	orderId: string
	amount: string
	currency: string
	paymentMethod: "stripe" | "wire" | "ach" | "sepa"

	// Conversion details (network-aware)
	targetChainId?: number // Optional: chainId (1 for mainnet, 11155111 for sepolia)
	targetNetwork?: NetworkKey // Optional: 'eth_mainnet' | 'eth_sepolia'
	targetToken: TokenKey // 'usdc' | 'usdt' | 'weth' | 'mock_usdc'
	custodialWalletAddress: string

	// Metadata
	userId: string
	clientReference?: string
}

export interface PaymentSessionResult {
	sessionId: string
	paymentInstructions: {
		method: string
		amount: string
		currency: string

		// For Stripe Connect
		stripePaymentUrl?: string
		stripeSessionId?: string

		// For Wire Transfer
		bankName?: string
		accountNumber?: string
		routingNumber?: string
		swiftCode?: string
		reference?: string
	}
	expiresAt: Date
}

export interface OnRampConversionParams {
	fiatAmount: string
	fiatCurrency: string
	targetChainId?: number // Optional: chainId
	targetNetwork?: NetworkKey // Optional: 'eth_mainnet' | 'eth_sepolia'
	targetToken: TokenKey // 'usdc' | 'usdt' | 'weth' | 'mock_usdc'
	destinationAddress: string // Custodial wallet
	orderId: string
}

export interface OnRampConversionResult {
	success: boolean
	transactionHash?: string
	cryptoAmount?: string
	fees?: {
		gatewayFee: string
		networkFee: string
		proxifyFee: string
		totalFees: string
	}
	error?: string
}

export class FiatOnRampService {
	private isMockMode: boolean

	constructor() {
		this.isMockMode = process.env.NODE_ENV !== "production" || process.env.MOCK_ONRAMP === "true"
	}

	/**
	 * Resolve network configuration from params
	 * Priority: targetNetwork > targetChainId > active network (from NODE_ENV)
	 */
	private resolveNetwork(params: { targetChainId?: number; targetNetwork?: NetworkKey }): {
		networkKey: NetworkKey
		chainId: number
	} {
		// Option 1: Use targetNetwork if provided
		if (params.targetNetwork) {
			return {
				networkKey: params.targetNetwork,
				chainId: NETWORK_CONFIG[params.targetNetwork].chainId,
			}
		}

		// Option 2: Use targetChainId to lookup network
		if (params.targetChainId) {
			const network = getNetworkByChainId(params.targetChainId)
			if (!network) {
				throw new Error(`Unsupported chain ID: ${params.targetChainId}`)
			}

			// Map chainId to networkKey
			const networkKey = params.targetChainId === 1 ? "eth_mainnet" : "eth_sepolia"
			return {
				networkKey,
				chainId: params.targetChainId,
			}
		}

		// Option 3: Default to active network based on NODE_ENV
		const isProduction = process.env.NODE_ENV === "production"
		const networkKey: NetworkKey = isProduction ? "eth_mainnet" : "eth_sepolia"
		return {
			networkKey,
			chainId: NETWORK_CONFIG[networkKey].chainId,
		}
	}

	/**
	 * Create payment session for client to send fiat
	 *
	 * In production: Integrates with Stripe Connect, wire transfer, etc.
	 * In mock mode: Returns fake payment instructions
	 */
	async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
		if (this.isMockMode) {
			return this.mockCreatePaymentSession(params)
		}

		return this.realCreatePaymentSession(params)
	}

	/**
	 * Convert fiat to crypto via on-ramp provider
	 *
	 * In production: Integrates with Circle, Coinbase Commerce, Bridge.xyz
	 * In mock mode: Simulates conversion
	 */
	async convertFiatToCrypto(params: OnRampConversionParams): Promise<OnRampConversionResult> {
		if (this.isMockMode) {
			return this.mockConvertFiatToCrypto(params)
		}

		return this.realConvertFiatToCrypto(params)
	}

	/**
	 * Verify webhook signature from payment gateway
	 */
	verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
		if (this.isMockMode) {
			return true // Skip verification in mock mode
		}

		// TODO: Implement signature verification for Stripe, Circle, etc.
		throw new Error("Webhook verification not implemented")
	}

	// ============================================
	// MOCK IMPLEMENTATIONS (for development)
	// ============================================

	private async mockCreatePaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
		const { networkKey, chainId } = this.resolveNetwork(params)
		const networkConfig = NETWORK_CONFIG[networkKey]
		const tokenConfig = networkConfig.token[params.targetToken]

		console.log("[MOCK] Creating payment session:", {
			clientId: params.clientId,
			orderId: params.orderId,
			amount: params.amount,
			currency: params.currency,
			method: params.paymentMethod,
			network: networkConfig.name,
			chainId,
			targetToken: params.targetToken,
			tokenAddress: tokenConfig?.address,
		})

		// Simulate 500ms delay
		await new Promise((resolve) => setTimeout(resolve, 500))

		const sessionId = `mock_session_${Date.now()}`
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

		// Return mock payment instructions based on method
		if (params.paymentMethod === "stripe") {
			return {
				sessionId,
				paymentInstructions: {
					method: "stripe",
					amount: params.amount,
					currency: params.currency,
					stripePaymentUrl: `https://checkout.stripe.com/mock/${sessionId}`,
					stripeSessionId: sessionId,
				},
				expiresAt,
			}
		}

		// Mock wire transfer instructions
		return {
			sessionId,
			paymentInstructions: {
				method: "wire",
				amount: params.amount,
				currency: params.currency,
				bankName: "Quirk Bank (Mock)",
				accountNumber: "1234567890",
				routingNumber: "021000021",
				swiftCode: "PROXUS33",
				reference: params.orderId, // Client must include this in wire
			},
			expiresAt,
		}
	}

	private async mockConvertFiatToCrypto(params: OnRampConversionParams): Promise<OnRampConversionResult> {
		const { networkKey, chainId } = this.resolveNetwork(params)
		const networkConfig = NETWORK_CONFIG[networkKey]
		const tokenConfig = networkConfig.token[params.targetToken]

		if (!tokenConfig) {
			throw new Error(`Token ${params.targetToken} not available on network ${networkKey}`)
		}

		console.log("[MOCK] Converting fiat to crypto:", {
			fiatAmount: params.fiatAmount,
			fiatCurrency: params.fiatCurrency,
			network: networkConfig.name,
			chainId,
			targetToken: params.targetToken,
			tokenAddress: tokenConfig.address,
			tokenSymbol: tokenConfig.symbol,
			destination: params.destinationAddress,
		})

		// Simulate 2 second conversion delay
		await new Promise((resolve) => setTimeout(resolve, 2000))

		// Mock conversion (1:1 for simplicity, real rate would vary)
		const fiatAmount = parseFloat(params.fiatAmount)
		const gatewayFee = fiatAmount * 0.01 // 1% gateway fee
		const proxifyFee = fiatAmount * 0.005 // 0.5% Quirk fee
		const networkFee = 1.0 // $1 network fee
		const totalFees = gatewayFee + proxifyFee + networkFee
		const cryptoAmount = fiatAmount - totalFees

		// Mock transaction hash
		const mockTxHash = `0x${Array(64)
			.fill(0)
			.map(() => Math.floor(Math.random() * 16).toString(16))
			.join("")}`

		return {
			success: true,
			transactionHash: mockTxHash,
			cryptoAmount: cryptoAmount.toFixed(6),
			fees: {
				gatewayFee: gatewayFee.toFixed(6),
				networkFee: networkFee.toFixed(6),
				proxifyFee: proxifyFee.toFixed(6),
				totalFees: totalFees.toFixed(6),
			},
		}
	}

	// ============================================
	// REAL IMPLEMENTATIONS (for production)
	// ============================================

	private async realCreatePaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
		// TODO: Implement real payment gateway integration
		//
		// For Stripe Connect:
		// 1. Create Stripe Checkout Session
		// 2. Return payment URL
		//
		// For Wire Transfer:
		// 1. Generate unique reference ID
		// 2. Return bank account details
		// 3. Set up webhook to monitor incoming wire

		throw new Error("Real payment gateway integration not implemented. Set NODE_ENV=development to use mock mode.")
	}

	private async realConvertFiatToCrypto(params: OnRampConversionParams): Promise<OnRampConversionResult> {
		// TODO: Implement real on-ramp integration
		//
		// Option 1: Circle (Recommended for USDC)
		// - Circle API for USDC minting
		// - Supports wire transfers, card payments
		// - https://developers.circle.com/
		//
		// Option 2: Coinbase Commerce
		// - Good for existing crypto users
		// - https://commerce.coinbase.com/
		//
		// Option 3: Bridge.xyz
		// - Multi-chain support
		// - https://bridge.xyz/
		//
		// Steps:
		// 1. Call on-ramp API to convert fiat → USDC
		// 2. Provide destination address (custodial wallet)
		// 3. Wait for blockchain confirmation
		// 4. Return transaction hash + amounts

		throw new Error("Real on-ramp integration not implemented. Set NODE_ENV=development to use mock mode.")
	}
}
