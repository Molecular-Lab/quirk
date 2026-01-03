import { motion, useScroll, useTransform, useInView } from "framer-motion"
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
			className="absolute inset-0 flex items-center justify-center"
		>
			<div className="w-full px-4 lg:px-8" style={{ maxWidth: "90vw" }}>
				<div className="bg-gray-50 rounded-3xl p-8 lg:p-14">
					<div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
						{/* Icon */}
						<div className="flex-shrink-0">
							<div className="w-20 h-20 lg:w-28 lg:h-28 bg-white rounded-3xl flex items-center justify-center shadow-sm">
								<Icon
									className="w-10 h-10 lg:w-14 lg:h-14 text-gray-800"
									strokeWidth={1.5}
								/>
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 text-center lg:text-left">
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
								{service.subtitle}
							</span>
							<h3 className="text-2xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
								{service.title}
							</h3>
							<p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-2xl">
								{service.description}
							</p>
						</div>

						{/* Index number */}
						<div className="flex-shrink-0">
							<span className="text-[80px] lg:text-[140px] font-bold text-gray-200 leading-none">
								{String(index + 1).padStart(2, "0")}
							</span>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export const ServicesShowcaseSection = () => {
	const containerRef = useRef(null)
	const headerRef = useRef(null)
	const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	})

	return (
		<section ref={containerRef} className="bg-white">
			{/* Section Header */}
			<div className="py-16 lg:py-24">
				<motion.div
					ref={headerRef}
					className="max-w-7xl mx-auto px-6 text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={
						isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
					}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
						Explore Our Services
					</h2>
					<p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
						Everything you need to embed yield infrastructure into your
						platform.
					</p>
				</motion.div>
			</div>

			{/* Stacked Cards Container */}
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
