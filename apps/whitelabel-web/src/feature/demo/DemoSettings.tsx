import { useState } from 'react'
import { Settings, X, Check } from 'lucide-react'
import { useClientContext } from '@/store/clientContextStore'

export function DemoSettings() {
	const [isOpen, setIsOpen] = useState(false)
	const [clientId, setClientId] = useState('')
	const [productId, setProductId] = useState('')
	const [apiKey, setApiKey] = useState('')
	const [saved, setSaved] = useState(false)

	const { setClientContext } = useClientContext()

	const handleSave = () => {
		if (!clientId.trim() || !productId.trim() || !apiKey.trim()) {
			alert('Please enter Client ID, Product ID, and API Key')
			return
		}

		// Save to centralized clientContextStore
		// This automatically syncs to localStorage for b2bApiClient
		setClientContext({
			clientId: clientId.trim(),
			productId: productId.trim(),
			apiKey: apiKey.trim(),
		})

		console.log('[DemoSettings] ✅ Saved to clientContextStore:', {
			clientId: clientId.trim(),
			productId: productId.trim(),
			apiKey: apiKey.trim().substring(0, 12) + '...',
		})

		setSaved(true)
		setTimeout(() => {
			setSaved(false)
			setIsOpen(false)
		}, 1500)
	}

	return (
		<>
			{/* Settings Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-6 right-6 p-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-all z-50"
				title="Demo Settings"
			>
				<Settings className="w-6 h-6" />
			</button>

			{/* Settings Panel */}
			{isOpen && (
				<div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-gray-900">Demo Settings</h3>
						<button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					<div className="space-y-4">
						{/* Client ID Input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
							<input
								type="text"
								value={clientId}
								onChange={(e) => setClientId(e.target.value)}
								placeholder="9be8eac3-a21d-4f1a-a846-65751d6d6fa9"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 mt-1">UUID from database (client_organizations.id)</p>
						</div>

						{/* Product ID Input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
							<input
								type="text"
								value={productId}
								onChange={(e) => setProductId(e.target.value)}
								placeholder="test_product_001"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 mt-1">Your organization's product ID</p>
						</div>

						{/* API Key Input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
							<input
								type="text"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="test_pk_..."
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 mt-1">Generated API key for authentication</p>
						</div>

						{/* Quick Copy Values */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-xs font-medium text-blue-800 mb-2">Default Test Values:</p>
							<div className="space-y-1">
								<p className="text-xs font-mono text-blue-700">Client ID: 9be8eac3-a21d-4f1a-a846-65751d6d6fa9</p>
								<p className="text-xs font-mono text-blue-700">Product ID: test_product_001</p>
								<p className="text-xs font-mono text-blue-700">API Key: test_pk_2a2463f87bfd6756822f48698fedd4ef</p>
							</div>
						</div>

						{/* Save Button */}
						<button
							onClick={handleSave}
							disabled={saved}
							className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{saved ? (
								<>
									<Check className="w-5 h-5" />
									Saved!
								</>
							) : (
								'Save Settings'
							)}
						</button>
					</div>
				</div>
			)}
		</>
	)
}
