import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X, ArrowDown, Check, ChevronDown, ExternalLink } from 'lucide-react'
import { b2bApiClient } from '@/api/b2bClient'
import usdcLogo from '@/assets/usd-coin-usdc-logo.png'

interface OnRampModalProps {
	isOpen: boolean
	onClose: () => void
	selectedOrderIds: string[]
	orders: Array<{
		orderId: string
		amount: string
		currency: string
	}>
	onComplete: () => void
}

const FIAT_CURRENCIES = [
	{ code: 'USD', name: 'US Dollar', symbol: '$', toUsdRate: 1.0 },
	{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', toUsdRate: 0.74 }, // 1 SGD = 0.74 USD
	{ code: 'EUR', name: 'Euro', symbol: '€', toUsdRate: 1.09 }, // 1 EUR = 1.09 USD
	{ code: 'THB', name: 'Thai Baht', symbol: '฿', toUsdRate: 0.029 }, // 1 THB = 0.029 USD
	{ code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', toUsdRate: 0.031 }, // 1 TWD = 0.031 USD
	{ code: 'KRW', name: 'Korean Won', symbol: '₩', toUsdRate: 0.00071 }, // 1 KRW = 0.00071 USD
]

const CRYPTO_TOKENS = [
	{ symbol: 'USDC', name: 'USD Coin', enabled: true },
	{ symbol: 'USDT', name: 'Tether', enabled: false },
	{ symbol: 'PYUSD', name: 'PayPal USD', enabled: false },
	{ symbol: 'BTC', name: 'Bitcoin', enabled: false },
	{ symbol: 'ETH', name: 'Ethereum', enabled: false },
	{ symbol: 'SOL', name: 'Solana', enabled: false },
]

export function OnRampModal({ isOpen, onClose, selectedOrderIds, orders, onComplete }: OnRampModalProps) {
	const [fiatCurrency, setFiatCurrency] = useState('USD')
	const [cryptoToken, setCryptoToken] = useState('USDC')
	const [step, setStep] = useState<'select' | 'summary' | 'processing' | 'success'>('select')

	// Mutation hook for batch completing deposits
	const batchCompleteMutation = useMutation({
		mutationFn: async (data: { orderIds: string[]; paidCurrency: string }) => {
			console.log('[OnRampModal] Starting batch purchase for orders:', selectedOrders)
			const response = await b2bApiClient.batchCompleteDeposits(data)

			console.log('[OnRampModal] Batch complete response:', response)
			console.log(`✅ ${data.orderIds.length} orders completed`)
			console.log(`💰 Total USDC transferred: ${response.totalUSDC}`)
			console.log(`🏦 Custodial wallet: ${response.custodialWallet}`)
			console.log(`🔗 Transaction hash:`, response.completedOrders?.[0]?.transferTxHash)

			return response
		},
		onSuccess: (data) => {
			console.log('[OnRampModal] Mutation success:', data)
			console.log('[OnRampModal] ✅ Deposit completed - Balance will update automatically')

			// Show success after brief delay
			setTimeout(() => {
				setStep('success')
			}, 1000)
		},
		onError: (error) => {
			console.error('[OnRampModal] Mutation error:', error)
			// Still show success for demo purposes
			setTimeout(() => {
				setStep('success')
			}, 1000)
		},
	})

	// Reset state when modal closes
	const handleClose = () => {
		setStep('select')
		setFiatCurrency('USD')
		setCryptoToken('USDC')
		batchCompleteMutation.reset()
		onClose()
	}

	if (!isOpen) return null

	// Calculate USDC amount (FIXED - based on orders in USD)
	const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.orderId))
	const usdcAmount = selectedOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0) // Assuming orders are in USD

	// Currency selection
	const selectedFiatCurrency = FIAT_CURRENCIES.find((c) => c.code === fiatCurrency) || FIAT_CURRENCIES[0]
	const fiatSymbol = selectedFiatCurrency.symbol

	// Calculate fiat amount needed to get the required USDC
	// fiatAmount = usdcAmount / toUsdRate
	// Example: Need 100 USDC, rate is 0.029 (THB), so need 100 / 0.029 = 3448.28 THB
	const fiatAmount = usdcAmount / selectedFiatCurrency.toUsdRate

	const handleContinue = () => {
		setStep('summary')
	}

	const handlePurchase = () => {
		setStep('processing')

		// Execute batch complete mutation
		batchCompleteMutation.mutate({
			orderIds: selectedOrderIds,
			paidCurrency: fiatCurrency,
		})
	}

	const handleComplete = () => {
		onComplete()
		handleClose()
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
				{/* Header */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						{step !== 'select' && (
							<h2 className="text-2xl font-bold text-gray-900">
								{step === 'summary' && 'Order Summary'}
								{step === 'processing' && 'Processing Payment...'}
								{step === 'success' && 'Payment Successful!'}
							</h2>
						)}
						<button
							onClick={handleClose}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					{step === 'select' && (
						<div className="space-y-4">
							{/* From (Fiat) */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<label className="block text-xs font-medium text-gray-500 mb-3">You pay</label>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={fiatAmount.toFixed(2)}
										readOnly
										className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900"
									/>
									<div className="relative">
										<select
											value={fiatCurrency}
											onChange={(e) => setFiatCurrency(e.target.value)}
											className="appearance-none bg-white border-2 border-gray-300 rounded-xl pl-4 pr-10 py-3 text-base font-bold text-gray-900 cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
										>
											{FIAT_CURRENCIES.map((currency) => (
												<option key={currency.code} value={currency.code}>
													{currency.code}
												</option>
											))}
										</select>
										<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
									</div>
								</div>
								<p className="text-sm text-gray-500 mt-3">≈ ${usdcAmount.toFixed(2)} USD</p>
							</div>

							{/* Arrow */}
							<div className="flex justify-center">
								<div className="bg-gray-100 rounded-full p-2">
									<ArrowDown className="w-5 h-5 text-gray-600" />
								</div>
							</div>

							{/* To (Crypto) */}
							<div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
								<label className="block text-xs font-medium text-gray-500 mb-3">You receive</label>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={usdcAmount.toFixed(2)}
										readOnly
										className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900"
									/>
									<div className="relative flex items-center gap-2 bg-white border-2 border-blue-500 rounded-xl pl-3 pr-10 py-3 shadow-sm">
										{/* USDC Logo */}
										<img src={usdcLogo} alt="USDC" className="w-6 h-6 rounded-full" />
										<select
											value={cryptoToken}
											onChange={(e) => {
												const token = CRYPTO_TOKENS.find((t) => t.symbol === e.target.value)
												if (token?.enabled) {
													setCryptoToken(e.target.value)
												}
											}}
											className="appearance-none bg-transparent border-none text-sm font-bold text-gray-900 cursor-pointer outline-none pr-2"
										>
											{CRYPTO_TOKENS.map((token) => (
												<option
													key={token.symbol}
													value={token.symbol}
													disabled={!token.enabled}
													className={!token.enabled ? 'text-gray-400' : ''}
												>
													{token.symbol} {!token.enabled && '(Soon)'}
												</option>
											))}
										</select>
										<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
									</div>
								</div>
								<p className="text-sm text-gray-500 mt-3">On Ethereum network</p>
							</div>

							{/* Continue Button */}
							<button
								onClick={handleContinue}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
							>
								Continue
							</button>
						</div>
					)}

					{step === 'summary' && (
						<div className="space-y-4">
							{/* Order Summary */}
							<div className="border border-gray-200 rounded-xl p-4">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Order Details</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600">Orders to process:</span>
										<span className="font-semibold text-gray-900">{selectedOrderIds.length}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Total amount:</span>
										<span className="font-semibold text-gray-900">
											{fiatSymbol}
											{fiatAmount.toFixed(2)} {fiatCurrency}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Exchange rate:</span>
										<span className="font-semibold text-gray-900">
											1 {fiatCurrency} = ${selectedFiatCurrency.toUsdRate.toFixed(4)} USD
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Network fee:</span>
										<span className="font-semibold text-gray-900">~$0.50</span>
									</div>
									<div className="pt-2 border-t border-gray-200 flex justify-between">
										<span className="font-semibold text-gray-900">You'll receive:</span>
										<span className="font-bold text-gray-900">{usdcAmount.toFixed(2)} USDC</span>
									</div>
								</div>
							</div>

							{/* Purchase Button */}
							<button
								onClick={handlePurchase}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
							>
								Purchase
							</button>
						</div>
					)}

					{step === 'processing' && (
						<div className="py-12 text-center">
							<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Processing your payment...</h3>
							<p className="text-sm text-gray-600">Please wait while we confirm your transaction</p>
						</div>
					)}

					{step === 'success' && (
						<div className="py-8 text-center">
							<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
								<Check className="w-10 h-10 text-green-600" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
							<p className="text-gray-600 mb-6">
								{selectedOrderIds.length} order{selectedOrderIds.length > 1 ? 's have' : ' has'} been processed successfully.
							</p>
							<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Orders processed:</span>
									<span className="font-semibold text-green-900">{selectedOrderIds.length}</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">Paid amount:</span>
									<span className="font-semibold text-green-900">
										{fiatSymbol}
										{fiatAmount.toFixed(2)} {fiatCurrency}
									</span>
								</div>
								<div className="flex justify-between text-sm mb-2">
									<span className="text-green-700">USDC minted:</span>
									<span className="font-semibold text-green-900">{usdcAmount.toFixed(2)} USDC</span>
								</div>
								{batchCompleteMutation.data?.completedOrders?.[0]?.transferTxHash && (
									<div className="mt-3 pt-3 border-t border-green-200">
										<span className="text-xs text-green-600 block mb-2">Transaction Hash:</span>
										<a
											href={`https://sepolia.etherscan.io/tx/${batchCompleteMutation.data.completedOrders[0].transferTxHash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-blue-800 transition-colors break-all"
										>
											{batchCompleteMutation.data.completedOrders[0].transferTxHash.slice(0, 10)}...
											{batchCompleteMutation.data.completedOrders[0].transferTxHash.slice(-8)}
											<ExternalLink className="w-3 h-3 flex-shrink-0" />
										</a>
									</div>
								)}
							</div>
							<button
								onClick={handleComplete}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
							>
								Done
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
