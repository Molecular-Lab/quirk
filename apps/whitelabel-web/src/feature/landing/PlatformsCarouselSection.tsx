import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Smartphone, Globe, CreditCard, Wallet, Building2 } from "lucide-react"

const platforms = [
	{
		title: "E-Commerce",
		subtitle: "Marketplaces",
		description: "Enable buyers and sellers to earn on idle balances. Turn shopping platforms into earning platforms.",
		icon: Globe,
	},
	{
		title: "Gig Workers",
		subtitle: "On-Demand Economy",
		description:
			"Help gig workers earn yield on earnings between jobs. Financial stability for the flexible workforce.",
		icon: Smartphone,
	},
	{
		title: "Creators",
		subtitle: "Content Platforms",
		description: "Empower creators to grow their income passively. Earnings work harder while they create.",
		icon: CreditCard,
	},
	{
		title: "Freelancers",
		subtitle: "Project-Based Work",
		description: "Give freelancers yield on project payments. Bridge the gap between gigs with passive income.",
		icon: Wallet,
	},
	{
		title: "Fintech Apps",
		subtitle: "Digital Banking",
		description: "Integrate yield into digital wallets and banking apps. Competitive returns for modern finance.",
		icon: Building2,
	},
]

export const PlatformsCarouselSection = () => {
	const containerRef = useRef<HTMLDivElement>(null)

	// Scroll-based animation with tighter control
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"], // Start when section enters top, end when it leaves
	})

	// Map scroll progress to horizontal translation
	// Container is 90vw - (p-6 lg:p-10) padding ≈ 86vw usable space
	// Each card: 80vw + gap 1rem between = need to slide (80vw * 4 cards) + (1rem * 4 gaps)
	const x = useTransform(
		scrollYProgress,
		[0.15, 0.85], // Only use middle 70% of scroll range for slower, smoother sliding
		["0vw", "-320vw"], // Slide to show all 5 cards
	)

	return (
		<section ref={containerRef} className="bg-white" style={{ height: `${(platforms.length + 2) * 100}vh` }}>
			<div className="sticky top-0 h-screen flex items-center justify-center p-4">
				{/* Full Card Container - 90vw x 80vh */}
				<div
					className="bg-gray-900 rounded-3xl p-6 lg:p-10 flex flex-col overflow-hidden"
					style={{ width: "90vw", height: "80vh", maxWidth: "90vw", maxHeight: "80vh" }}
				>
					{/* Header */}
					<div className="text-center mb-6 lg:mb-8 flex-shrink-0 z-10">
						<p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Quirk</p>
						<h2 className="text-3xl lg:text-5xl font-medium text-white">Any Platform, Any Scale</h2>
					</div>

					{/* Scrollable Container */}
					<div className="flex-1 relative overflow-hidden flex items-center">
						<motion.div
							className="flex h-full"
							style={{
								x,
								gap: "1rem",
								willChange: "transform",
							}}
						>
							{platforms.map((platform, index) => {
								const Icon = platform.icon
								return (
									<div key={platform.title} className="flex-shrink-0 h-full" style={{ width: "80vw" }}>
										{/* Full height card content - constrained width */}
										<div className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 px-4 lg:px-8">
											{/* Left: Large Icon */}
											<div className="flex-shrink-0">
												<div className="w-32 h-32 lg:w-40 lg:h-40 bg-gray-800 rounded-3xl flex items-center justify-center">
													<Icon className="w-16 h-16 lg:w-20 lg:h-20 text-white" strokeWidth={1.2} />
												</div>
											</div>

											{/* Center: Content - constrained width */}
											<div className="text-center lg:text-left flex-1 max-w-md">
												<span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
													{platform.subtitle}
												</span>
												<h3 className="text-3xl lg:text-4xl font-medium text-white mt-2 mb-4">{platform.title}</h3>
												<p className="text-gray-400 text-base lg:text-lg leading-relaxed">{platform.description}</p>
											</div>

											{/* Right: Index number */}
											<div className="flex-shrink-0 hidden lg:block">
												<span className="text-[100px] lg:text-[120px] font-medium text-gray-800 leading-none">
													{String(index + 1).padStart(2, "0")}
												</span>
											</div>
										</div>
									</div>
								)
							})}
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	)
}
