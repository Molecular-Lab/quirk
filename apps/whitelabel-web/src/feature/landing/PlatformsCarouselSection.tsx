import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import {
	Smartphone,
	Globe,
	CreditCard,
	Wallet,
	Building2,
	ShoppingBag,
} from "lucide-react"

const platforms = [
	{
		title: "Mobile Wallets",
		subtitle: "iOS & Android",
		description:
			"Embed yield directly into your mobile wallet app. Users earn while they hold, no extra steps required.",
		icon: Smartphone,
		examples: ["Trust Wallet", "MetaMask Mobile", "Coinbase Wallet"],
	},
	{
		title: "Web Applications",
		subtitle: "DeFi & CeFi",
		description:
			"Add yield capabilities to any web platform. One SDK integration, instant earning infrastructure.",
		icon: Globe,
		examples: ["DEX Platforms", "Portfolio Trackers", "Trading Apps"],
	},
	{
		title: "Payment Apps",
		subtitle: "Fintech",
		description:
			"Turn idle balances into yield-generating assets. Give your users a reason to keep funds in your app.",
		icon: CreditCard,
		examples: ["Neobanks", "Payment Processors", "Remittance Apps"],
	},
	{
		title: "Custodial Services",
		subtitle: "Institutional",
		description:
			"Offer yield to your custody clients. Enterprise-grade security meets DeFi returns.",
		icon: Wallet,
		examples: ["Custody Providers", "Asset Managers", "Family Offices"],
	},
	{
		title: "Banking Platforms",
		subtitle: "TradFi",
		description:
			"Bridge traditional banking with DeFi yields. Compliant, regulated, and ready for scale.",
		icon: Building2,
		examples: ["Digital Banks", "Credit Unions", "Savings Apps"],
	},
	{
		title: "E-Commerce",
		subtitle: "Retail",
		description:
			"Let customers earn on their store credit and loyalty points. Transform balances into engagement.",
		icon: ShoppingBag,
		examples: ["Marketplaces", "Loyalty Programs", "Gift Card Platforms"],
	},
]

interface PlatformCardProps {
	platform: (typeof platforms)[0]
	index: number
	progress: any
}

const PlatformCard = ({ platform, index, progress }: PlatformCardProps) => {
	const Icon = platform.icon
	const cardCount = platforms.length

	const start = index / cardCount
	const end = (index + 1) / cardCount

	const opacity = useTransform(
		progress,
		[Math.max(0, start - 0.1), start, end - 0.15, end],
		[0, 1, 1, 0]
	)

	return (
		<motion.div
			style={{ opacity }}
			className="absolute inset-0 flex items-center justify-center p-4"
		>
			{/* Full Card Container - 90vw x 90vh */}
			<div
				className="bg-gray-900 rounded-3xl p-8 lg:p-12 flex flex-col text-white"
				style={{
					width: "90vw",
					height: "90vh",
					maxWidth: "90vw",
					maxHeight: "90vh",
				}}
			>
				{/* Header inside card */}
				<div className="text-center mb-8 lg:mb-12">
					<p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
						Quirk Everywhere
					</p>
					<h2 className="text-3xl lg:text-5xl font-bold text-white">
						Any Platform, Any Scale
					</h2>
				</div>

				{/* Card Content - fills remaining space */}
				<div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center">
					{/* Left: Icon + Index */}
					<div className="flex flex-col items-center lg:items-start gap-6">
						<div className="w-28 h-28 lg:w-36 lg:h-36 bg-gray-800 rounded-3xl flex items-center justify-center">
							<Icon
								className="w-14 h-14 lg:w-20 lg:h-20 text-white"
								strokeWidth={1.5}
							/>
						</div>
						<span className="text-[80px] lg:text-[120px] font-bold text-gray-800 leading-none">
							{String(index + 1).padStart(2, "0")}
						</span>
					</div>

					{/* Center: Content */}
					<div className="flex-1 text-center lg:text-left max-w-2xl">
						<span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
							{platform.subtitle}
						</span>
						<h3 className="text-4xl lg:text-6xl font-bold text-white mt-2 mb-6">
							{platform.title}
						</h3>
						<p className="text-gray-400 text-lg lg:text-xl leading-relaxed mb-8">
							{platform.description}
						</p>

						{/* Examples */}
						<div className="flex flex-wrap gap-3 justify-center lg:justify-start">
							{platform.examples.map((example) => (
								<span
									key={example}
									className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300"
								>
									{example}
								</span>
							))}
						</div>
					</div>

					{/* Right: Visual element */}
					<div className="hidden lg:flex flex-col items-center justify-center">
						<div className="relative">
							{/* Animated rings */}
							<motion.div
								className="absolute inset-0 border-2 border-gray-700 rounded-full"
								style={{ width: 200, height: 200 }}
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.5, 0.2, 0.5],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
							<motion.div
								className="absolute inset-0 border border-gray-800 rounded-full"
								style={{ width: 200, height: 200, margin: -20 }}
								animate={{
									scale: [1.2, 1, 1.2],
									opacity: [0.2, 0.4, 0.2],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.5,
								}}
							/>
							{/* Center Q */}
							<div className="w-[200px] h-[200px] bg-gray-800 rounded-full flex items-center justify-center">
								<span className="text-6xl font-bold text-white">Q</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export const PlatformsCarouselSection = () => {
	const containerRef = useRef(null)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	})

	return (
		<section ref={containerRef} className="bg-white">
			{/* Stacked Cards Container */}
			<div
				className="relative"
				style={{ height: `${platforms.length * 100}vh` }}
			>
				<div className="sticky top-0 h-screen flex items-center justify-center">
					{platforms.map((platform, index) => (
						<PlatformCard
							key={platform.title}
							platform={platform}
							index={index}
							progress={scrollYProgress}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
