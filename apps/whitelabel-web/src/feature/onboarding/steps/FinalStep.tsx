/**
 * Step 6: Final Step
 * Summary of what you get before account activation
 * Shows real blended APY based on product strategies
 */

import { useEffect, useMemo, useState } from "react"

import { ArrowUpRight, CheckCircle2, Loader2, Rocket } from "lucide-react"

import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"
import { useAPYCache } from "@/hooks/useAPYCache"
import { useAPYCacheStore, type Allocation } from "@/store/apyCacheStore"

interface FinalStepProps {
	productId?: string
}

const benefits = [
	"Institutional-grade custody",
	"Optimized yield strategies",
	"Real-time portfolio tracking",
	"24/7 automated management",
]

export function FinalStep({ productId }: FinalStepProps) {
	const [allocations, setAllocations] = useState<Allocation[]>([])
	const [loadingStrategies, setLoadingStrategies] = useState(false)

	// Fetch and cache APY data
	const { apys, isLoading: loadingAPYs } = useAPYCache("USDC", 8453)

	// Get calculateExpectedAPY from store
	const calculateExpectedAPY = useAPYCacheStore((state) => state.calculateExpectedAPY)

	// Fetch product strategies
	useEffect(() => {
		if (!productId) return

		async function fetchStrategies() {
			setLoadingStrategies(true)
			try {
				const result = await getEffectiveProductStrategies(productId!)
				console.log("[FinalStep] Fetched strategies:", result)

				if (result?.strategies?.lending) {
					const lendingStrategies = result.strategies.lending
					const transformed: Allocation[] = Object.entries(lendingStrategies)
						.filter(([_, value]) => (value as number) > 0)
						.map(([protocol, percentage]) => ({
							protocol: protocol as "aave" | "compound" | "morpho",
							percentage: percentage as number,
						}))

					if (transformed.length > 0) {
						setAllocations(transformed)
					}
				}
			} catch (error) {
				console.error("[FinalStep] Failed to fetch strategies:", error)
			} finally {
				setLoadingStrategies(false)
			}
		}

		fetchStrategies()
	}, [productId])

	// Calculate blended APY
	const expectedAPY = useMemo(() => {
		if (!apys || allocations.length === 0) {
			return null
		}
		return calculateExpectedAPY(allocations)
	}, [allocations, apys, calculateExpectedAPY])

	const isLoadingAPY = loadingStrategies || loadingAPYs

	return (
		<div className="flex flex-col items-center text-center animate-fade-up">
			<div
				className="w-20 h-20 rounded-3xl bg-violet-500 flex items-center justify-center mb-6 animate-scale-in"
				style={{ boxShadow: "0 0 40px -10px rgba(139, 92, 246, 0.5)" }}
			>
				<Rocket className="w-10 h-10 text-white" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-3">You're All Set!</h1>

			<p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xs">
				Start earning yield on your stablecoins with our optimized strategies.
			</p>

			<div className="w-full glass-card rounded-2xl p-5 mb-6">
				<h3 className="font-semibold text-foreground text-left mb-4">What you get:</h3>
				<div className="space-y-3">
					{benefits.map((benefit) => (
						<div key={benefit} className="flex items-center gap-3">
							<CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
							<span className="text-foreground text-sm text-left">{benefit}</span>
						</div>
					))}
				</div>
			</div>

			<div className="w-full bg-gray-100 rounded-2xl p-4 flex items-center justify-between">
				<div className="text-left">
					<p className="text-xs text-muted-foreground">Expected APY</p>
					{isLoadingAPY ? (
						<div className="flex items-center gap-2">
							<Loader2 className="w-4 h-4 animate-spin text-violet-500" />
							<span className="text-sm text-muted-foreground">Loading...</span>
						</div>
					) : (
						<p className="text-xl font-bold text-foreground">
							{expectedAPY ? `${expectedAPY}%` : "—"}
						</p>
					)}
				</div>
				<ArrowUpRight className="w-6 h-6 text-emerald-500" />
			</div>

			<p className="text-xs text-muted-foreground mt-6">
				By opening your account, you agree to our Terms of Service and Privacy Policy
			</p>
		</div>
	)
}
