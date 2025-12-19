import { useState } from "react"

import { AlertCircle, Copy, Eye, EyeOff, Key, Plus, Trash2 } from "lucide-react"

import { EnvironmentToggle } from "@/components/environment/EnvironmentToggle"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface APIKey {
	id: string
	name: string
	key: string
	createdAt: string
	lastUsed: string
	status: "active" | "inactive"
}

// TODO: Fetch from API
const mockAPIKeys: APIKey[] = [
	{
		id: "1",
		name: "Production API Key",
		key: "pk_live_abc123xyz789def456ghi012jkl345mno678pqr901",
		createdAt: "2024-01-15",
		lastUsed: "2 hours ago",
		status: "active",
	},
	{
		id: "2",
		name: "Development API Key",
		key: "pk_test_dev456uvw789xyz012abc345def678ghi901jkl234",
		createdAt: "2024-01-10",
		lastUsed: "1 day ago",
		status: "active",
	},
]

export function APIKeysPage() {
	const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys)
	const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [newKeyName, setNewKeyName] = useState("")

	const toggleKeyVisibility = (id: string) => {
		setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }))
	}

	const copyToClipboard = (key: string) => {
		navigator.clipboard.writeText(key)
		// TODO: Show toast notification
		alert("API key copied to clipboard!")
	}

	const deleteKey = (id: string) => {
		if (confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
			setApiKeys((prev) => prev.filter((key) => key.id !== id))
		}
	}

	const createNewKey = () => {
		if (!newKeyName.trim()) {
			alert("Please enter a name for the API key")
			return
		}

		// TODO: Call API to create new key
		const newKey: APIKey = {
			id: Date.now().toString(),
			name: newKeyName,
			key: `pk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
			createdAt: new Date().toISOString().split("T")[0],
			lastUsed: "Never",
			status: "active",
		}

		setApiKeys((prev) => [...prev, newKey])
		setNewKeyName("")
		setShowCreateModal(false)
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
					<p className="text-gray-600 mt-1">Manage your API keys for authentication</p>
				</div>
				<div className="flex items-center gap-4">
					<EnvironmentToggle />
					<button
						onClick={() => {
							setShowCreateModal(true)
						}}
						className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
					>
						<Plus className="w-4 h-4" />
						Create API Key
					</button>
				</div>
			</div>

			{/* Security Notice */}
			<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
				<AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
				<div>
					<p className="font-medium text-amber-900">Keep your API keys secure</p>
					<p className="text-sm text-amber-700 mt-1">
						Never share your secret keys publicly or commit them to version control. Always use environment variables in
						production.
					</p>
				</div>
			</div>

			{/* API Keys List */}
			<div className="space-y-4">
				{apiKeys.map((apiKey) => (
					<div
						key={apiKey.id}
						className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-50 rounded-lg">
									<Key className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
									<p className="text-sm text-gray-600">Created on {apiKey.createdAt}</p>
								</div>
							</div>
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${
									apiKey.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
								}`}
							>
								{apiKey.status}
							</span>
						</div>

						<div className="bg-gray-50 rounded-lg p-4 font-mono text-sm mb-4">
							<div className="flex items-center justify-between">
								<code className="text-gray-900">
									{showKeys[apiKey.id] ? apiKey.key : "•".repeat(apiKey.key.length)}
								</code>
								<div className="flex items-center gap-2">
									<button
										onClick={() => {
											toggleKeyVisibility(apiKey.id)
										}}
										className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
										title={showKeys[apiKey.id] ? "Hide key" : "Show key"}
									>
										{showKeys[apiKey.id] ? (
											<EyeOff className="w-4 h-4 text-gray-600" />
										) : (
											<Eye className="w-4 h-4 text-gray-600" />
										)}
									</button>
									<button
										onClick={() => {
											copyToClipboard(apiKey.key)
										}}
										className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
										title="Copy to clipboard"
									>
										<Copy className="w-4 h-4 text-gray-600" />
									</button>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-600">Last used: {apiKey.lastUsed}</p>
							<button
								onClick={() => {
									deleteKey(apiKey.id)
								}}
								className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
							>
								<Trash2 className="w-4 h-4" />
								Delete
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Create Modal */}
			<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold text-gray-900">Create New API Key</DialogTitle>
					</DialogHeader>
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">API Key Name</label>
						<input
							type="text"
							value={newKeyName}
							onChange={(e) => {
								setNewKeyName(e.target.value)
							}}
							placeholder="e.g., Production API Key"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
						<p className="text-sm text-gray-600 mt-2">Choose a descriptive name to identify this key</p>
					</div>
					<div className="flex gap-3">
						<button
							onClick={() => {
								setShowCreateModal(false)
							}}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={createNewKey}
							className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							Create Key
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
