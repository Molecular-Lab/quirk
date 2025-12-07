import { Book, Code, ExternalLink, Search } from "lucide-react"

const apiEndpoints = [
	{
		category: "Wallets",
		endpoints: [
			{
				method: "POST",
				path: "/api/v1/wallets/create",
				description: "Create a new custodial wallet for a user",
			},
			{
				method: "GET",
				path: "/api/v1/wallets/:address",
				description: "Get wallet details by address",
			},
			{
				method: "GET",
				path: "/api/v1/wallets/:address/balance",
				description: "Get wallet balance",
			},
		],
	},
	{
		category: "Transactions",
		endpoints: [
			{
				method: "POST",
				path: "/api/v1/transactions/transfer",
				description: "Transfer tokens between wallets",
			},
			{
				method: "GET",
				path: "/api/v1/transactions/:txHash",
				description: "Get transaction details",
			},
			{
				method: "GET",
				path: "/api/v1/transactions/history",
				description: "Get transaction history for a wallet",
			},
		],
	},
	{
		category: "DeFi",
		endpoints: [
			{
				method: "POST",
				path: "/api/v1/defi/deposit",
				description: "Deposit funds into a DeFi protocol",
			},
			{
				method: "POST",
				path: "/api/v1/defi/withdraw",
				description: "Withdraw funds from a DeFi protocol",
			},
			{
				method: "GET",
				path: "/api/v1/defi/positions",
				description: "Get user DeFi positions",
			},
		],
	},
]

const codeExamples = [
	{
		title: "Create Wallet",
		language: "TypeScript",
		code: `import { ProxifyClient } from '@proxify/sdk';

const client = new ProxifyClient({
  apiKey: 'your_api_key_here'
});

const wallet = await client.wallets.create({
  userId: 'user_123',
  metadata: {
    email: 'user@example.com'
  }
});

console.log('Wallet created:', wallet.address);`,
	},
	{
		title: "Transfer Tokens",
		language: "TypeScript",
		code: `const transfer = await client.transactions.transfer({
  from: '0x123...',
  to: '0x456...',
  amount: '100',
  token: 'USDC'
});

console.log('Transfer hash:', transfer.txHash);`,
	},
]

export function DocumentationPage() {
	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
					<p className="text-gray-600 mt-1">API reference and integration guides</p>
				</div>
				<a
					href="https://docs.proxify.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
				>
					<Book className="w-4 h-4" />
					Full Documentation
					<ExternalLink className="w-4 h-4" />
				</a>
			</div>

			{/* Quick Start */}
			<div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
				<h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white rounded-lg p-4">
						<div className="text-blue-600 font-bold text-lg mb-2">1</div>
						<h4 className="font-semibold text-gray-900 mb-1">Get API Key</h4>
						<p className="text-sm text-gray-600">Create your API key from the API Keys page</p>
					</div>
					<div className="bg-white rounded-lg p-4">
						<div className="text-blue-600 font-bold text-lg mb-2">2</div>
						<h4 className="font-semibold text-gray-900 mb-1">Install SDK</h4>
						<p className="text-sm text-gray-600">npm install @proxify/sdk</p>
					</div>
					<div className="bg-white rounded-lg p-4">
						<div className="text-blue-600 font-bold text-lg mb-2">3</div>
						<h4 className="font-semibold text-gray-900 mb-1">Start Building</h4>
						<p className="text-sm text-gray-600">Initialize the client and start creating wallets</p>
					</div>
				</div>
			</div>

			{/* API Endpoints */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-semibold text-gray-900">API Endpoints</h3>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search endpoints..."
							className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>
				</div>

				<div className="space-y-6">
					{apiEndpoints.map((category) => (
						<div key={category.category}>
							<h4 className="font-semibold text-gray-900 mb-3">{category.category}</h4>
							<div className="space-y-2">
								{category.endpoints.map((endpoint, idx) => (
									<div
										key={idx}
										className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
									>
										<span
											className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
												endpoint.method === "GET" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
											}`}
										>
											{endpoint.method}
										</span>
										<div className="flex-1">
											<code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
											<p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
										</div>
										<ExternalLink className="w-4 h-4 text-gray-400" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Code Examples */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<h3 className="text-xl font-semibold text-gray-900 mb-6">Code Examples</h3>
				<div className="space-y-4">
					{codeExamples.map((example, idx) => (
						<div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
							<div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
								<div className="flex items-center gap-2">
									<Code className="w-4 h-4 text-gray-600" />
									<span className="font-medium text-gray-900">{example.title}</span>
									<span className="text-sm text-gray-600">({example.language})</span>
								</div>
								<button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Copy</button>
							</div>
							<pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
								<code className="text-sm">{example.code}</code>
							</pre>
						</div>
					))}
				</div>
			</div>

			{/* SDK Resources */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">SDKs & Libraries</h3>
					<div className="space-y-3">
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<div>
								<p className="font-medium text-gray-900">JavaScript / TypeScript</p>
								<p className="text-sm text-gray-600">npm install @proxify/sdk</p>
							</div>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<div>
								<p className="font-medium text-gray-900">Python</p>
								<p className="text-sm text-gray-600">pip install proxify</p>
							</div>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<div>
								<p className="font-medium text-gray-900">Go</p>
								<p className="text-sm text-gray-600">go get github.com/proxify/sdk</p>
							</div>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
					</div>
				</div>

				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
					<div className="space-y-3">
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<p className="font-medium text-gray-900">API Reference</p>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<p className="font-medium text-gray-900">Integration Guides</p>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<p className="font-medium text-gray-900">Example Projects</p>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
						<a
							href="#"
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
						>
							<p className="font-medium text-gray-900">Community Discord</p>
							<ExternalLink className="w-4 h-4 text-gray-400" />
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}
