import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function IntegrationPage() {
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [packageManager, setPackageManager] = useState<"npm" | "pnpm" | "yarn">("npm")

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text)
		setCopiedId(id)
		setTimeout(() => setCopiedId(null), 2000)
	}

	const installCommands = {
		npm: "npm install @quirk/b2b-sdk",
		pnpm: "pnpm install @quirk/b2b-sdk",
		yarn: "yarn add @quirk/b2b-sdk",
	}

	return (
		<div className="h-screen flex flex-col bg-white overflow-hidden">
			{/* Header */}
			<div className="border-b border-gray-200 px-8 py-8">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-4xl font-bold text-gray-900">Quirk SDK Integration</h1>
					<p className="text-gray-600 mt-2 text-lg">
						Embed Earn-as-a-Service in your application with our TypeScript SDK
					</p>
				</div>
			</div>

			{/* Main Content - Centered */}
			<div className="flex-1 overflow-hidden py-12">
				<div className="max-w-6xl mx-auto px-8 h-full">
					<Tabs defaultValue="installation" className="h-full flex flex-row gap-8">
						{/* Left Side - Tabs List */}
						<div className="w-64 flex-shrink-0">
							<h2 className="text-sm font-semibold text-gray-900 mb-4">Try it out</h2>
							<TabsList className="bg-white flex flex-col h-fit w-full items-stretch gap-1 p-0">
								<TabsTrigger
									value="installation"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Installation
								</TabsTrigger>
								<TabsTrigger
									value="provider"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Configure provider
								</TabsTrigger>
								<TabsTrigger
									value="create-user"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Create a user
								</TabsTrigger>
								<TabsTrigger
									value="fiat-deposit"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Create fiat deposit
								</TabsTrigger>
								<TabsTrigger
									value="withdrawal"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Request withdrawal
								</TabsTrigger>
								<TabsTrigger
									value="user-portfolio"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Get user portfolio
								</TabsTrigger>
								<TabsTrigger
									value="stats"
									className="justify-start px-4 py-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 hover:bg-gray-50 rounded-md"
								>
									Get transaction stats
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Right Side - Content */}
						<div className="flex-1 overflow-hidden">
							{/* Installation Tab */}
							<TabsContent value="installation" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Installation</h3>
										<p className="text-gray-600">Install the Quirk React SDK using your package manager of choice:</p>
									</div>

									{/* Package Manager Tabs */}
									<div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
										<button
											onClick={() => setPackageManager("npm")}
											className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
												packageManager === "npm"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-600 hover:text-gray-900"
											}`}
										>
											npm
										</button>
										<button
											onClick={() => setPackageManager("pnpm")}
											className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
												packageManager === "pnpm"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-600 hover:text-gray-900"
											}`}
										>
											pnpm
										</button>
										<button
											onClick={() => setPackageManager("yarn")}
											className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
												packageManager === "yarn"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-600 hover:text-gray-900"
											}`}
										>
											yarn
										</button>
									</div>

									{/* Code Block */}
									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() => copyToClipboard(installCommands[packageManager], "install")}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "install" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-base text-gray-100">
											<code>
												<span className="text-orange-400">{packageManager}</span>{" "}
												{packageManager === "yarn" ? "add" : "install"}{" "}
												<span className="text-blue-300">@quirk/b2b-sdk</span>
											</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							{/* QuirkProvider Config Tab */}
							<TabsContent value="provider" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Configure QuirkProvider</h3>
										<p className="text-gray-600">Wrap your app with QuirkProvider to enable the SDK:</p>
									</div>

									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() =>
												copyToClipboard(
													`import { QuirkProvider } from '@quirk/b2b-sdk'\n\nfunction App() {\n  return (\n    <QuirkProvider\n      productId="your-product-id"\n      apiKey="pk_live_xxxxx"\n    >\n      <YourApp />\n    </QuirkProvider>\n  )\n}`,
													"provider",
												)
											}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "provider" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-sm text-gray-100 leading-relaxed">
											<code>{`import { QuirkProvider } from '@quirk/b2b-sdk'

function App() {
  return (
    <QuirkProvider
      productId="your-product-id"
      apiKey="pk_live_xxxxx"
    >
      <YourApp />
    </QuirkProvider>
  )
}`}</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							{/* Create User Tab */}
							<TabsContent value="create-user" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Create a user</h3>
										<p className="text-gray-600">Use the useQuirk() hook to create or get an existing user</p>
									</div>

									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() =>
												copyToClipboard(
													`import { useQuirk } from '@quirk/b2b-sdk'\n\nfunction MyComponent() {\n  const { createUser } = useQuirk()\n\n  const handleCreateUser = async () => {\n    await createUser({\n      clientUserId: 'user_123',\n      email: 'user@example.com'\n    })\n  }\n}`,
													"create-user",
												)
											}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "create-user" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-sm text-gray-100 leading-relaxed">
											<code>{`import { useQuirk } from '@quirk/b2b-sdk'

function MyComponent() {
  const { createUser } = useQuirk()

  const handleCreateUser = async () => {
    await createUser({
      clientUserId: 'user_123',
      email: 'user@example.com'
    })
  }
}`}</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							{/* Create Fiat Deposit Tab */}
							<TabsContent value="fiat-deposit" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Create fiat deposit</h3>
										<p className="text-gray-600">Use the useQuirkTransaction() hook to create a fiat deposit</p>
									</div>

									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() =>
												copyToClipboard(
													`import { useQuirkTransaction } from '@quirk/b2b-sdk'\n\nfunction MyComponent() {\n  const { deposit } = useQuirkTransaction()\n\n  const handleDeposit = async () => {\n    await deposit.createFiat({\n      userId: 'user_123',\n      amount: '1000.00',\n      currency: 'USD'\n    })\n  }\n}`,
													"fiat-deposit",
												)
											}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "fiat-deposit" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-sm text-gray-100 leading-relaxed">
											<code>{`import { useQuirkTransaction } from '@quirk/b2b-sdk'

function MyComponent() {
  const { deposit } = useQuirkTransaction()

  const handleDeposit = async () => {
    await deposit.createFiat({
      userId: 'user_123',
      amount: '1000.00',
      currency: 'USD'
    })
  }
}`}</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							{/* Request Withdrawal Tab */}
							<TabsContent value="withdrawal" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Request withdrawal</h3>
										<p className="text-gray-600">Use the useQuirkTransaction() hook to request a withdrawal</p>
									</div>

									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() =>
												copyToClipboard(
													`import { useQuirkTransaction } from '@quirk/b2b-sdk'\n\nfunction MyComponent() {\n  const { withdraw } = useQuirkTransaction()\n\n  const handleWithdraw = async () => {\n    await withdraw.create({\n      userId: 'user_123',\n      amount: '500.00'\n    })\n  }\n}`,
													"withdrawal",
												)
											}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "withdrawal" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-sm text-gray-100 leading-relaxed">
											<code>{`import { useQuirkTransaction } from '@quirk/b2b-sdk'

function MyComponent() {
  const { withdraw } = useQuirkTransaction()

  const handleWithdraw = async () => {
    await withdraw.create({
      userId: 'user_123',
      amount: '500.00'
    })
  }
}`}</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							{/* Get User Portfolio Tab */}
							<TabsContent value="user-portfolio" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Get user portfolio</h3>
										<p className="text-gray-600">Use the useQuirk() hook to retrieve user balance and portfolio information</p>
									</div>

									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() =>
												copyToClipboard(
													`import { useQuirk } from '@quirk/b2b-sdk'\n\nfunction MyComponent() {\n  const { getUserPortfolio } = useQuirk()\n\n  const loadUserPortfolio = async () => {\n    const portfolio = await getUserPortfolio('user_123')\n    // Returns portfolio with total value and vault details\n    console.log(portfolio.totalValue)\n    console.log(portfolio.vaults)\n  }\n}`,
													"user-portfolio",
												)
											}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "user-portfolio" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-sm text-gray-100 leading-relaxed">
											<code>{`import { useQuirk } from '@quirk/b2b-sdk'

function MyComponent() {
  const { getUserPortfolio } = useQuirk()

  const loadUserPortfolio = async () => {
    const portfolio = await getUserPortfolio('user_123')
    // Returns portfolio with total value and vault details
    console.log(portfolio.totalValue)
    console.log(portfolio.vaults)
  }
}`}</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							{/* Get Stats Tab */}
							<TabsContent value="stats" className="h-full mt-0 overflow-auto">
								<div className="space-y-6">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">Get transaction stats</h3>
										<p className="text-gray-600">
											Use the useQuirkTransaction() hook to retrieve deposit and withdrawal statistics
										</p>
									</div>

									<div className="relative bg-[#1e293b] rounded-xl p-8 border border-gray-200">
										<button
											onClick={() =>
												copyToClipboard(
													`import { useQuirkTransaction } from '@quirk/b2b-sdk'\n\nfunction MyComponent() {\n  const { stats } = useQuirkTransaction()\n\n  const loadStats = async () => {\n    const deposits = await stats.getDeposits()\n    const withdrawals = await stats.getWithdrawals()\n  }\n}`,
													"stats",
												)
											}
											className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-md transition-colors"
										>
											{copiedId === "stats" ? (
												<Check className="w-4 h-4 text-green-400" />
											) : (
												<Copy className="w-4 h-4 text-gray-400" />
											)}
										</button>
										<pre className="text-sm text-gray-100 leading-relaxed">
											<code>{`import { useQuirkTransaction } from '@quirk/b2b-sdk'

function MyComponent() {
  const { stats } = useQuirkTransaction()

  const loadStats = async () => {
    const deposits = await stats.getDeposits()
    const withdrawals = await stats.getWithdrawals()
  }
}`}</code>
										</pre>
									</div>
								</div>
							</TabsContent>
						</div>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
