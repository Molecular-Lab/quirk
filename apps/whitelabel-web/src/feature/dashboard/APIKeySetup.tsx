import { useState, useEffect } from "react"

import { Copy, Eye, EyeOff, Key, RefreshCw } from "lucide-react"

import { regenerateApiKey } from "@/api/b2bClientHelpers"
import { useClientContextStore } from "@/store/clientContextStore"
import { useEnvironmentStore } from "@/store/environmentStore"
import { useUserStore } from "@/store/userStore"

export function APIKeySetup() {
	const { activeProductId, setApiKey, getActiveOrganization } = useUserStore()
	const { setClientContext } = useClientContextStore()
	const { apiEnvironment } = useEnvironmentStore()
	const [isGenerating, setIsGenerating] = useState(false)
	const [showKey, setShowKey] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [currentApiKey, setCurrentApiKey] = useState<string | null>(null)

	const org = getActiveOrganization()

	// Load API key from localStorage for active product
	useEffect(() => {
		if (activeProductId) {
			const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
			const apiKey = allKeys[activeProductId]
			setCurrentApiKey(apiKey || null)

			console.log("[APIKeySetup] Loaded API key for", activeProductId, ":", !!apiKey)
		} else {
			setCurrentApiKey(null)
		}
	}, [activeProductId])

	const handleGenerateApiKey = async () => {
		if (!activeProductId) {
			setError("No active organization selected")
			return
		}

		setIsGenerating(true)
		setError(null)

		try {
			console.log("[APIKeySetup] Generating API key for:", activeProductId, "in", apiEnvironment, "mode")

			// ✅ Pass environment parameter to regenerate correct API key
			const response = await regenerateApiKey(activeProductId, apiEnvironment)

			console.log("[APIKeySetup] API key generated:", response)

			if (response && typeof response === "object" && "api_key" in response) {
				const newApiKey = response.api_key

				// ✅ Save to multi-org localStorage storage
				const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
				allKeys[activeProductId] = newApiKey
				localStorage.setItem("b2b:api_keys", JSON.stringify(allKeys))

				// Update local state
				setCurrentApiKey(newApiKey)

				// Save to userStore (for backward compatibility)
				setApiKey(newApiKey)

				// Save as current active key
				localStorage.setItem("b2b:api_key", newApiKey)

				// Update clientContextStore
				if (org) {
					setClientContext({
						productId: activeProductId,
						clientId: org.id,
						apiKey: newApiKey,
						companyName: org.companyName,
						businessType: org.businessType,
					})
				}

				console.log("[APIKeySetup] ✅ API key saved to multi-org storage:", {
					productId: activeProductId,
					apiKeyPrefix: newApiKey.substring(0, 12) + "...",
				})
			} else {
				throw new Error("Invalid response from API")
			}
		} catch (err) {
			console.error("[APIKeySetup] Failed to generate API key:", err)
			setError(err instanceof Error ? err.message : "Failed to generate API key")
		} finally {
			setIsGenerating(false)
		}
	}

	const handleCopyKey = () => {
		if (currentApiKey) {
			navigator.clipboard.writeText(currentApiKey)
			setCopied(true)
			setTimeout(() => {
				setCopied(false)
			}, 2000)
		}
	}

	const maskApiKey = (key: string) => {
		if (key.length <= 12) return key
		return `${key.substring(0, 12)}${"•".repeat(key.length - 12)}`
	}

	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2 bg-purple-100 rounded-lg">
					<Key className="w-5 h-5 text-purple-600" />
				</div>
				<div>
					<h3 className="text-lg font-bold text-gray-900">API Key</h3>
					<p className="text-sm text-gray-600">Manage your API key for this organization</p>
				</div>
			</div>

			{currentApiKey ? (
				<>
					{/* Existing API Key */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">Current API Key</label>
						<div className="flex items-center gap-2">
							<div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm">
								{showKey ? currentApiKey : maskApiKey(currentApiKey)}
							</div>
							<button
								onClick={() => {
									setShowKey(!showKey)
								}}
								className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
								title={showKey ? "Hide key" : "Show key"}
							>
								{showKey ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
							</button>
							<button
								onClick={handleCopyKey}
								className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
								title="Copy to clipboard"
							>
								<Copy className="w-5 h-5 text-gray-600" />
							</button>
						</div>
						{copied && <p className="text-xs text-green-600 mt-1">✓ Copied to clipboard</p>}
					</div>

					{/* Regenerate Warning */}
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
						<p className="text-xs text-yellow-800">
							<strong>⚠️ Warning:</strong> Regenerating will invalidate your current API key immediately. Update your
							applications before regenerating.
						</p>
					</div>

					{/* Regenerate Button */}
					<button
						onClick={handleGenerateApiKey}
						disabled={isGenerating}
						className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<RefreshCw className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
						{isGenerating ? "Regenerating..." : "Regenerate API Key"}
					</button>
				</>
			) : (
				<>
					{/* No API Key Yet */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
						<p className="text-sm text-blue-800">
							<strong>ℹ️ No API Key Found</strong>
							<br />
							Generate an API key to start using the API and demo features.
						</p>
					</div>

					<button
						onClick={handleGenerateApiKey}
						disabled={isGenerating}
						className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Key className="w-5 h-5" />
						{isGenerating ? "Generating..." : "Generate API Key"}
					</button>
				</>
			)}

			{error && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}
		</div>
	)
}
