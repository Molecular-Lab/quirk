import { useState } from 'react'
import { Copy, Eye, EyeOff, Plus, Trash2, Book, Code } from 'lucide-react'

// Mock API keys
const MOCK_API_KEYS = [
	{
		id: '1',
		name: 'Production API Key',
		key: 'pk_live_1234567890abcdef',
		created: '2024-11-01',
		lastUsed: '2 hours ago',
	},
	{
		id: '2',
		name: 'Development API Key',
		key: 'pk_test_abcdef1234567890',
		created: '2024-10-15',
		lastUsed: '1 day ago',
	},
]

const DOCUMENTATION_SECTIONS = [
	{
		title: 'Getting Started',
		icon: Book,
		items: [
			{ name: 'Quick Start Guide', link: '#quickstart' },
			{ name: 'Authentication', link: '#auth' },
			{ name: 'API Overview', link: '#overview' },
		],
	},
	{
		title: 'API Reference',
		icon: Code,
		items: [
			{ name: 'Deposits API', link: '#deposits' },
			{ name: 'Withdrawals API', link: '#withdrawals' },
			{ name: 'Portfolio Management', link: '#portfolio' },
			{ name: 'User Management', link: '#users' },
		],
	},
	{
		title: 'SDK & Libraries',
		icon: Code,
		items: [
			{ name: 'JavaScript/TypeScript SDK', link: '#js-sdk' },
			{ name: 'Python SDK', link: '#python-sdk' },
			{ name: 'Go SDK', link: '#go-sdk' },
		],
	},
]

export function IntegrationPage() {
	const [apiKeys, setApiKeys] = useState(MOCK_API_KEYS)
	const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
	const [activeTab, setActiveTab] = useState<'api-keys' | 'docs'>('docs')

	const toggleKeyVisibility = (keyId: string) => {
		setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		// TODO: Show toast notification
		console.log('Copied to clipboard:', text)
	}

	const deleteKey = (keyId: string) => {
		setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
	}

	const maskKey = (key: string, visible: boolean) => {
		if (visible) return key
		return key.slice(0, 10) + '••••••••••••••••'
	}

	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-[32px] font-bold text-gray-900 mb-2">Integration</h1>
					<p className="text-gray-600">
						Documentation and API keys for integrating Proxify into your application
					</p>
				</div>

				{/* Tabs */}
				<div className="mb-8 border-b border-gray-200">
					<div className="flex gap-8">
						<button
							onClick={() => setActiveTab('docs')}
							className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
								activeTab === 'docs'
									? 'text-blue-600'
									: 'text-gray-500 hover:text-gray-700'
							}`}
						>
							Documentation
							{activeTab === 'docs' && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
							)}
						</button>
						<button
							onClick={() => setActiveTab('api-keys')}
							className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
								activeTab === 'api-keys'
									? 'text-blue-600'
									: 'text-gray-500 hover:text-gray-700'
							}`}
						>
							API Keys
							{activeTab === 'api-keys' && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
							)}
						</button>
					</div>
				</div>

				{/* Documentation Tab */}
				{activeTab === 'docs' && (
					<div className="grid lg:grid-cols-4 gap-8">
						{/* Sidebar Navigation */}
						<div className="lg:col-span-1">
							<div className="bg-gray-50 rounded-2xl p-4 space-y-6 sticky top-8">
								{DOCUMENTATION_SECTIONS.map((section) => (
									<div key={section.title}>
										<div className="flex items-center gap-2 mb-3">
											<section.icon className="w-4 h-4 text-gray-600" />
											<h3 className="font-semibold text-sm text-gray-900">
												{section.title}
											</h3>
										</div>
										<div className="space-y-1">
											{section.items.map((item) => (
												<a
													key={item.name}
													href={item.link}
													className="block px-2 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
												>
													{item.name}
												</a>
											))}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Main Documentation Content */}
						<div className="lg:col-span-3 space-y-8">
							{/* Quick Start */}
							<div className="bg-gray-50 rounded-2xl p-6">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
								<p className="text-gray-600 mb-6">
									Get started with Proxify API in minutes. Install the SDK and start accepting
									deposits.
								</p>

								<div className="bg-gray-900 rounded-lg p-4 mb-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs text-gray-400">Install via npm</span>
										<button
											onClick={() => copyToClipboard('npm install @proxify/b2b-client')}
											className="text-gray-400 hover:text-white"
										>
											<Copy className="w-4 h-4" />
										</button>
									</div>
									<code className="text-sm text-green-400 font-mono">
										npm install @proxify/b2b-client
									</code>
								</div>

								<div className="bg-gray-900 rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs text-gray-400">Initialize Client</span>
										<button
											onClick={() =>
												copyToClipboard(`import { ProxifyB2BClient } from '@proxify/b2b-client'

const client = new ProxifyB2BClient()

// Create deposit
const deposit = await client.deposits.create({
  type: 'external',
  userId: 'user_123',
  amount: 100,
  currency: 'USD',
  method: 'apple_pay'
})`)
											}
											className="text-gray-400 hover:text-white"
										>
											<Copy className="w-4 h-4" />
										</button>
									</div>
									<pre className="text-sm text-gray-300 font-mono overflow-x-auto">
										{`import { ProxifyB2BClient } from '@proxify/b2b-client'

const client = new ProxifyB2BClient()

// Create deposit
const deposit = await client.deposits.create({
  type: 'external',
  userId: 'user_123',
  amount: 100,
  currency: 'USD',
  method: 'apple_pay'
})`}
									</pre>
								</div>
							</div>

							{/* API Endpoints */}
							<div className="bg-gray-50 rounded-2xl p-6">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">API Endpoints</h2>
								<div className="space-y-4">
									<div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
										<div className="flex items-center gap-3 mb-2">
											<span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
												POST
											</span>
											<code className="text-sm font-mono text-gray-900">
												/api/v1/deposits
											</code>
										</div>
										<p className="text-sm text-gray-600">Create a new deposit transaction</p>
									</div>

									<div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
										<div className="flex items-center gap-3 mb-2">
											<span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">
												GET
											</span>
											<code className="text-sm font-mono text-gray-900">
												/api/v1/deposits/:orderId
											</code>
										</div>
										<p className="text-sm text-gray-600">Get deposit status by order ID</p>
									</div>

									<div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
										<div className="flex items-center gap-3 mb-2">
											<span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">
												GET
											</span>
											<code className="text-sm font-mono text-gray-900">
												/api/v1/deposits/client-balance
											</code>
										</div>
										<p className="text-sm text-gray-600">Get client prepaid balance</p>
									</div>
								</div>
							</div>

							{/* Webhooks */}
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks</h2>
								<p className="text-gray-600 mb-4">
									Configure webhooks to receive real-time notifications about deposit status
									changes.
								</p>
								<div className="bg-white rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-2">Event Types:</h3>
									<ul className="space-y-1 text-sm text-gray-600">
										<li>• <code>deposit.completed</code> - Deposit successfully processed</li>
										<li>• <code>deposit.failed</code> - Deposit failed</li>
										<li>• <code>withdrawal.completed</code> - Withdrawal completed</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* API Keys Tab */}
				{activeTab === 'api-keys' && (
					<div>
						<div className="flex items-center justify-between mb-6">
							<p className="text-gray-600">
								Manage your API keys for accessing Proxify services
							</p>
							<button
								onClick={() => console.log('Create new API key')}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
							>
								<Plus className="w-4 h-4" />
								Create New Key
							</button>
						</div>

						<div className="space-y-4">
							{apiKeys.map((apiKey) => (
								<div
									key={apiKey.id}
									className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between mb-4">
										<div>
											<h3 className="font-bold text-gray-900 mb-1">{apiKey.name}</h3>
											<div className="text-sm text-gray-500">
												Created {apiKey.created} • Last used {apiKey.lastUsed}
											</div>
										</div>
										<button
											onClick={() => deleteKey(apiKey.id)}
											className="text-red-500 hover:text-red-700 transition-colors"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>

									<div className="bg-white rounded-lg p-4 border border-gray-200">
										<div className="flex items-center gap-2">
											<code className="flex-1 text-sm font-mono text-gray-900">
												{maskKey(apiKey.key, visibleKeys[apiKey.id] || false)}
											</code>
											<button
												onClick={() => toggleKeyVisibility(apiKey.id)}
												className="text-gray-400 hover:text-gray-600"
											>
												{visibleKeys[apiKey.id] ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</button>
											<button
												onClick={() => copyToClipboard(apiKey.key)}
												className="text-gray-400 hover:text-gray-600"
											>
												<Copy className="w-4 h-4" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>

						{apiKeys.length === 0 && (
							<div className="text-center py-12">
								<p className="text-gray-500 mb-4">No API keys yet</p>
								<button
									onClick={() => console.log('Create first API key')}
									className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
								>
									Create Your First API Key
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
