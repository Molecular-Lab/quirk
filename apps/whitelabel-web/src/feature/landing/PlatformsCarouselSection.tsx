import { motion, useAnimation } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import {
	Smartphone,
	Globe,
	CreditCard,
	Wallet,
	Building2,
	ShoppingCart,
	Briefcase,
	PenTool,
	Video,
} from "lucide-react"

const platforms = [
	{
		title: "Mobile Wallets",
		subtitle: "iOS & Android",
		description:
			"Embed yield directly into your mobile wallet app. Users earn while they hold.",
		icon: Smartphone,
	},
	{
		title: "Web Apps",
		subtitle: "DeFi & CeFi",
		description:
			"Add yield capabilities to any web platform. One SDK, instant infrastructure.",
		icon: Globe,
	},
	{
		title: "Payment Apps",
		subtitle: "Fintech",
		description:
			"Turn idle balances into yield-generating assets for your users.",
		icon: CreditCard,
	},
	{
		title: "Custodial",
		subtitle: "Institutional",
		description:
			"Offer yield to custody clients with enterprise-grade security.",
		icon: Wallet,
	},
	{
		title: "Banking",
		subtitle: "TradFi",
		description:
			"Bridge traditional banking with DeFi yields. Compliant and scalable.",
		icon: Building2,
	},
	{
		title: "E-Commerce",
		subtitle: "Retail",
		description:
			"Let customers earn on store credit and loyalty points.",
		icon: ShoppingCart,
	},
	{
		title: "Gig Workers",
		subtitle: "Platforms",
		description:
			"Help gig workers earn yield on their earnings between payouts.",
		icon: Briefcase,
	},
	{
		title: "Freelancers",
		subtitle: "Professionals",
		description:
			"Enable freelancers to grow their income with automated yield.",
		icon: PenTool,
	},
	{
		title: "Creators",
		subtitle: "Content",
		description:
			"Let creators earn more from their revenue with embedded yield.",
		icon: Video,
	},
]

export const PlatformsCarouselSection = () => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)
	const controls = useAnimation()

	// Auto-advance carousel
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % platforms.length)
		}, 4000)
		return () => clearInterval(interval)
	}, [])

	// Animate on index change
	useEffect(() => {
		controls.start({
			x: -currentIndex * 100 + "%",
			transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
		})
	}, [currentIndex, controls])

	const goToSlide = (index: number) => {
		setCurrentIndex(index)
	}

	const goNext = () => {
		setCurrentIndex((prev) => (prev + 1) % platforms.length)
	}

	const goPrev = () => {
		setCurrentIndex((prev) => (prev - 1 + platforms.length) % platforms.length)
	}

	return (
		<section className="bg-white py-8">
			<div className="flex items-center justify-center p-4">
				{/* Full Card Container - 90vw x 90vh */}
				<div
					className="bg-gray-900 rounded-3xl p-6 lg:p-10 flex flex-col overflow-hidden"
					style={{ width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" }}
				>
					{/* Header */}
					<div className="text-center mb-6 lg:mb-8 flex-shrink-0">
						<p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
							Quirk Everywhere
						</p>
						<h2 className="text-3xl lg:text-5xl font-bold text-white">
							Any Platform, Any Scale
						</h2>
					</div>

					{/* Carousel Container */}
					<div className="flex-1 relative overflow-hidden min-h-0">
						<motion.div
							ref={containerRef}
							className="flex h-full"
							animate={controls}
							style={{ width: `${platforms.length * 100}%` }}
						>
							{platforms.map((platform, index) => {
								const Icon = platform.icon
								return (
									<div
										key={platform.title}
										className="flex-shrink-0 h-full px-4"
										style={{ width: `${100 / platforms.length}%` }}
									>
										<div className="h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
											{/* Left: Large Icon */}
											<div className="flex-shrink-0">
												<div className="w-40 h-40 lg:w-56 lg:h-56 bg-gray-800 rounded-3xl flex items-center justify-center">
													<Icon
														className="w-20 h-20 lg:w-28 lg:h-28 text-white"
														strokeWidth={1.2}
													/>
												</div>
											</div>

											{/* Center: Content */}
											<div className="text-center lg:text-left max-w-lg">
												<span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
													{platform.subtitle}
												</span>
												<h3 className="text-4xl lg:text-6xl font-bold text-white mt-2 mb-4">
													{platform.title}
												</h3>
												<p className="text-gray-400 text-lg lg:text-xl leading-relaxed">
													{platform.description}
												</p>
											</div>

											{/* Right: Index number */}
											<div className="flex-shrink-0 hidden lg:block">
												<span className="text-[120px] lg:text-[180px] font-bold text-gray-800 leading-none">
													{String(index + 1).padStart(2, "0")}
												</span>
											</div>
										</div>
									</div>
								)
							})}
						</motion.div>
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-center gap-4 mt-6 flex-shrink-0">
						{/* Prev Button */}
						<button
							onClick={goPrev}
							className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
						>
							<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						{/* Dots */}
						<div className="flex gap-2">
							{platforms.map((_, index) => (
								<button
									key={index}
									onClick={() => goToSlide(index)}
									className={`w-2 h-2 rounded-full transition-all duration-300 ${
										index === currentIndex
											? "bg-white w-8"
											: "bg-gray-600 hover:bg-gray-500"
									}`}
								/>
							))}
						</div>

						{/* Next Button */}
						<button
							onClick={goNext}
							className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
						>
							<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}
