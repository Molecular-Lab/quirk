import { motion, useScroll, useTransform } from "framer-motion"
import { Code2, Bot, Shield, FileCheck, ArrowLeftRight } from "lucide-react"
import { useRef } from "react"

const services = [
	{
		title: "Embedded Earn",
		subtitle: "Instant Earning",
		description:
			"Embed yield capabilities directly into your platform. Start offering competitive returns to your users without building complex DeFi infrastructure.",
		icon: Code2,
	},
	{
		title: "AI-Agent Powered",
		subtitle: "Optimize Your Yield Strategies",
		description:
			"Real-time DeFi market data analysis. Our intelligent agent continuously monitors markets and rebalances portfolios for maximum returns.",
		icon: Bot,
	},
	{
		title: "MPC Wallet Infrastructure",
		subtitle: "Institutional Grade Custody",
		description:
			"Enterprise-grade security with multi-party computation wallets. Your users' funds are protected by institutional-level custody.",
		icon: Shield,
	},
	{
		title: "Embedded Compliance",
		subtitle: "Regulatory Ready",
		description:
			"Built-in regulatory compliance handles KYC, AML, and reporting so you can focus on building your product without compliance headaches.",
		icon: FileCheck,
	},
	{
		title: "On/Off Ramp Gateway",
		subtitle: "Easy Onboarding",
		description:
			"Seamless fiat-to-crypto conversions for your users. Enable easy deposits and withdrawals with our integrated payment gateway.",
		icon: ArrowLeftRight,
	},
]

interface ServiceCardProps {
	service: (typeof services)[0]
	index: number
	progress: any
}

const ServiceCard = ({ service, index, progress }: ServiceCardProps) => {
	const Icon = service.icon
	const cardCount = services.length

	const start = index / cardCount
	const end = (index + 1) / cardCount

	// Card becomes visible when it's "active", fades out as next card comes
	const opacity = useTransform(
		progress,
		[
			Math.max(0, start - 0.1),
			start,
			end - 0.15,
			end,
		],
		[0, 1, 1, 0]
	)

	return (
		<motion.div
			style={{ opacity }}
			className="absolute inset-0 flex items-center justify-center p-4"
		>
			{/* Full Card Container - 90vw x 90vh */}
			<div
				className="bg-gray-50 rounded-3xl p-8 lg:p-12 flex flex-col"
				style={{ width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" }}
			>
				{/* Header inside card */}
				<div className="text-center mb-8 lg:mb-12">
					<h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2">
						Explore Our Services
					</h2>
					<p className="text-base lg:text-lg text-gray-600">
						Everything you need to embed yield infrastructure into your platform.
					</p>
				</div>

				{/* Card Content - fills remaining space */}
				<div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-center">
					{/* Icon */}
					<div className="flex-shrink-0">
						<div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-3xl flex items-center justify-center shadow-sm">
							<Icon
								className="w-12 h-12 lg:w-16 lg:h-16 text-gray-800"
								strokeWidth={1.5}
							/>
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 text-center lg:text-left max-w-2xl">
						<span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
							{service.subtitle}
						</span>
						<h3 className="text-3xl lg:text-5xl font-bold text-gray-900 mt-2 mb-4">
							{service.title}
						</h3>
						<p className="text-gray-600 text-lg lg:text-xl leading-relaxed">
							{service.description}
						</p>
					</div>

					{/* Index number */}
					<div className="flex-shrink-0">
						<span className="text-[100px] lg:text-[180px] font-bold text-gray-200 leading-none">
							{String(index + 1).padStart(2, "0")}
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export const ServicesShowcaseSection = () => {
	const containerRef = useRef(null)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	})

	return (
		<section ref={containerRef} className="bg-white">
			{/* Stacked Cards Container - Header is inside sticky area */}
			<div
				className="relative"
				style={{ height: `${services.length * 100}vh` }}
			>
				<div className="sticky top-0 h-screen flex items-center justify-center">
					{services.map((service, index) => (
						<ServiceCard
							key={service.title}
							service={service}
							index={index}
							progress={scrollYProgress}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
