import { useEffect, useState } from "react"
import { ArrowDown, TrendingUp, DollarSign, Clock } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

export function HowItWorksSection() {
	const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
	const [animated, setAnimated] = useState(false)

	useEffect(() => {
		if (isVisible) {
			// Delay animation slightly after section becomes visible
			const timer = setTimeout(() => setAnimated(true), 300)
			return () => clearTimeout(timer)
		}
	}, [isVisible])

	const FlowStep = ({
		icon: Icon,
		text,
		delay = 0,
		highlight = false,
	}: {
		icon: React.ElementType
		text: string
		delay?: number
		highlight?: boolean
	}) => (
		<div
			className={`flex flex-col items-center gap-3 transition-all duration-700 ${
				animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
			}`}
			style={{ transitionDelay: `${delay}ms` }}
		>
			<div
				className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
					highlight
						? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110"
						: "bg-white border-2 border-gray-200 text-gray-700"
				}`}
			>
				<Icon className="w-8 h-8" />
			</div>
			<p className={`text-lg font-medium text-center ${highlight ? "text-gray-950 font-semibold" : "text-gray-700"}`}>
				{text}
			</p>
		</div>
	)

	const AnimatedNumber = ({ value, suffix = "", delay = 0, decimals = 0 }: { value: number; suffix?: string; delay?: number; decimals?: number }) => {
		const [displayValue, setDisplayValue] = useState(0)

		useEffect(() => {
			if (!animated) return

			let interval: NodeJS.Timeout | null = null
			const timer = setTimeout(() => {
				const duration = 2000
				const steps = 60
				const increment = value / steps
				let current = 0

				interval = setInterval(() => {
					current += increment
					if (current >= value) {
						setDisplayValue(value)
						if (interval) clearInterval(interval)
					} else {
						setDisplayValue(current)
					}
				}, duration / steps)
			}, delay)

			return () => {
				clearTimeout(timer)
				if (interval) clearInterval(interval)
			}
		}, [animated, value, delay])

		const formatValue = (val: number) => {
			if (decimals === 0) {
				return val.toLocaleString(undefined, { maximumFractionDigits: 0 })
			}
			return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
		}

		return (
			<span>
				{formatValue(displayValue)}
				{suffix}
			</span>
		)
	}

	return (
		<section className="py-24 bg-gradient-to-b from-white to-blue-50/20">
			<div
				ref={ref as React.RefObject<HTMLDivElement>}
				className={`max-w-7xl mx-auto px-6 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
			>
				<div className="text-center mb-16">
					<h2 className="text-6xl font-bold text-gray-950 mb-4">How It Works</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Transform idle funds into revenue-generating assets with Quirk's automated yield infrastructure
					</p>
				</div>

				<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Before Section */}
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border-2 border-gray-200 shadow-lg">
						<div className="text-center mb-8">
							<h3 className="text-4xl font-bold text-gray-950 mb-2">Before</h3>
							<div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto" />
						</div>

						<div className="space-y-6">
							<FlowStep icon={DollarSign} text="Operational Float: $50M" delay={100} />
							<div className="flex justify-center">
								<ArrowDown className="w-6 h-6 text-gray-400" />
							</div>
							<FlowStep icon={Clock} text="14 days idle" delay={200} />
							<div className="flex justify-center">
								<ArrowDown className="w-6 h-6 text-gray-400" />
							</div>
							<FlowStep icon={DollarSign} text="User Payout" delay={300} />
						</div>

						<div className="mt-10 pt-8 border-t-2 border-gray-200">
							<div className="text-center">
								<p className="text-sm text-gray-500 mb-2">Platform Revenue</p>
								<p className="text-5xl font-bold text-gray-400">
									<AnimatedNumber value={0} suffix="/year" delay={400} />
								</p>
							</div>
						</div>
					</div>

					{/* After Section */}
					<div className="bg-gradient-to-br from-purple-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border-2 border-purple-200 shadow-xl relative overflow-hidden">
						{/* Decorative gradient overlay */}
						<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400" />
						
						<div className="text-center mb-8">
							<h3 className="text-4xl font-bold text-gray-950 mb-2">After</h3>
							<div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto" />
						</div>

						<div className="space-y-6">
							<FlowStep icon={DollarSign} text="Operational Float: $50M" delay={500} />
							<div className="flex justify-center">
								<ArrowDown className="w-6 h-6 text-purple-500 animate-pulse" />
							</div>
							<FlowStep icon={TrendingUp} text="Quirk Stablecoin Yield (5%)" delay={600} highlight />
							<div className="flex justify-center">
								<ArrowDown className="w-6 h-6 text-purple-500 animate-pulse" />
							</div>
							<FlowStep icon={Clock} text="Auto Withdraw on demand" delay={700} />
							<div className="flex justify-center">
								<ArrowDown className="w-6 h-6 text-purple-500 animate-pulse" />
							</div>
							<FlowStep icon={DollarSign} text="User Payout" delay={800} />
						</div>

						<div className="mt-10 pt-8 border-t-2 border-purple-200/50">
							<div className="space-y-4">
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-1">Gross Revenue</p>
									<p className="text-4xl font-bold text-gray-950">
										$<AnimatedNumber value={2.5} suffix="M/year" delay={900} decimals={1} />
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200/30">
									<div className="text-center">
										<p className="text-xs text-gray-600 mb-1">Platform</p>
										<p className="text-2xl font-bold text-purple-600">
											$<AnimatedNumber value={2.25} suffix="M" delay={1000} decimals={2} />
										</p>
										<p className="text-xs text-gray-500 mt-1">(90%)</p>
									</div>
									<div className="text-center">
										<p className="text-xs text-gray-600 mb-1">Quirk</p>
										<p className="text-2xl font-bold text-blue-600">
											$<AnimatedNumber value={250} suffix="k" delay={1100} />
										</p>
										<p className="text-xs text-gray-500 mt-1">(10%)</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</section>
	)
}

