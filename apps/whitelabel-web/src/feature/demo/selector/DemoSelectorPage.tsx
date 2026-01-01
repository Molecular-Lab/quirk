import { useNavigate } from "@tanstack/react-router"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LandingNavbar } from "@/feature/landing/LandingNavbar"
import { useApiStore } from "@/store/apiStore"
import { useDemoProductStore } from "@/store/demoProductStore"
import { useDemoStore } from "@/store/demoStore"

interface DemoOption {
	id: string
	title: string
	description: string
	icon: string
	features: string[]
	path: string
}

const demoOptions: DemoOption[] = [
	{
		id: "ecommerce",
		title: "E-commerce Platform",
		description: "Merchant earnings & idle cash management",
		icon: "🛍️",
		path: "/demo/ecommerce",
		features: ["Merchant balance tracking", "Pending payouts optimization", "Automatic yield generation"],
	},
	{
		id: "creators",
		title: "Creator Platform",
		description: "Revenue management for content creators",
		icon: "🎨",
		path: "/demo/creators",
		features: ["Creator revenue tracking", "Subscription earnings", "Yield on idle creator funds"],
	},
	{
		id: "gig-workers",
		title: "Gig Workers Platform",
		description: "Payouts & tips management for gig economy",
		icon: "🚗",
		path: "/demo/gig-workers",
		features: ["Pending payouts tracking", "Tips & bonuses management", "Instant yield on earnings"],
	},
]

/**
 * Demo Selector Page - ULTRA SIMPLIFIED
 *
 * Just choose which platform demo to view.
 * Product + persona selection happens IN the platform demo page.
 * This eliminates ALL state persistence issues.
 */
export function DemoSelectorPage() {
	const navigate = useNavigate()
	const { resetDemo } = useDemoStore()
	const { clearSelection } = useDemoProductStore()

	const handleSelectPlatform = (path: string) => {
		console.log("[DemoSelectorPage] 🔄 Platform selected, forcing API key cleanup...")

		// 1. Reset demo state (persona, endUser, etc.)
		resetDemo()

		// 2. Clear product selection
		clearSelection()

		// 3. ✅ FORCE CLEAR ALL API KEY STORAGE
		console.log("[DemoSelectorPage] 🧹 Clearing ALL API key related localStorage...")

		// Clear Zustand apiStore (in-memory)
		const { setApiKey } = useApiStore.getState()
		setApiKey("")

		// Clear demoProductStore API keys (in-memory)
		useDemoProductStore.setState({ apiKeys: {} })

		// Clear direct localStorage keys
		localStorage.removeItem("b2b:api_keys")
		localStorage.removeItem("b2b:api_key")

		// Clear proxify-api-testing localStorage (apiStore persist)
		const apiTestingData = localStorage.getItem("proxify-api-testing")
		if (apiTestingData) {
			try {
				const parsed = JSON.parse(apiTestingData)
				parsed.state.apiKey = null
				localStorage.setItem("proxify-api-testing", JSON.stringify(parsed))
			} catch (e) {
				// If parse fails, just remove it
				localStorage.removeItem("proxify-api-testing")
			}
		}

		console.log("[DemoSelectorPage] ✅ API key cleanup complete, navigating to:", path)
		navigate({ to: path })
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-25 via-white to-white">
			{/* Navbar */}
			<LandingNavbar />

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-950 mb-4">Choose Your Demo</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Select a platform to see how Quirk's Earn-as-a-Service works for different business models.
					</p>
				</div>

				{/* Platform Cards */}
				<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{demoOptions.map((demo) => (
						<Card
							key={demo.id}
							className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
							onClick={() => {
								handleSelectPlatform(demo.path)
							}}
						>
							<CardHeader>
								<div className="text-5xl mb-4">{demo.icon}</div>
								<CardTitle className="text-xl">{demo.title}</CardTitle>
								<CardDescription>{demo.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{demo.features.map((feature, idx) => (
										<li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
											<span className="text-accent mt-0.5">✓</span>
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Info Footer */}
				<div className="mt-12 text-center">
					<p className="text-sm text-gray-500">
						After selecting a platform, you'll choose a product and persona to start the interactive demo.
					</p>
				</div>
			</div>
		</div>
	)
}
