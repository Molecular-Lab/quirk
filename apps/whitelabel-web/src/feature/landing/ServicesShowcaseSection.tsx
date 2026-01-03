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

	// Each card fades out completely as the next one comes in
	const start = index / cardCount
	const end = (index + 1) / cardCount

	const opacity = useTransform(progress, [start, end - 0.1, end], [1, 1, 0])
	const scale = useTransform(progress, [start, end], [1, 0.9])
	const y = useTransform(progress, [start, end], [0, -50])

	return (
		<motion.div
			style={{ opacity, scale, y }}
			className="absolute inset-0 flex items-center justify-center px-6"
		>
			<div className="w-full max-w-5xl">
				<div className="bg-gray-100 rounded-3xl p-10 lg:p-16">
					<div className="flex flex-col lg:flex-row gap-10 items-center">
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
						<div className="flex-1 text-center lg:text-left">
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
								{service.subtitle}
							</span>
							<h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-5">
								{service.title}
							</h3>
							<p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-2xl">
								{service.description}
							</p>
						</div>

						{/* Index number */}
						<div className="flex-shrink-0">
							<span className="text-[120px] lg:text-[160px] font-bold text-gray-200 leading-none">
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
			<div className="py-20 lg:py-28">
				<motion.div
					ref={headerRef}
					className="max-w-7xl mx-auto px-6 text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={
						isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
					}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
						Explore Our Services
					</h2>
					<p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
						Everything you need to embed yield infrastructure into your
						platform.
					</p>
				</motion.div>
			</div>

			{/* Stacked Cards Container */}
			<div
				className="relative"
				style={{ height: `${(services.length + 0.5) * 100}vh` }}
			>
				<div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
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
