import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
	Code2,
	Bot,
	Shield,
	FileCheck,
	ArrowLeftRight,
} from "lucide-react"
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
	range: [number, number]
	targetScale: number
}

const ServiceCard = ({
	service,
	index,
	progress,
	range,
	targetScale,
}: ServiceCardProps) => {
	const cardRef = useRef(null)
	const isInView = useInView(cardRef, { once: true, margin: "-50px" })
	const Icon = service.icon

	const scale = useTransform(progress, range, [1, targetScale])
	const opacity = useTransform(
		progress,
		[range[0], range[1], range[1] + 0.1],
		[1, 1, 0.3]
	)

	return (
		<div
			ref={cardRef}
			className="h-screen flex items-center justify-center sticky top-0"
			style={{ zIndex: services.length - index }}
		>
			<motion.div
				style={{ scale, opacity }}
				className="w-full max-w-4xl mx-auto px-6"
			>
				<motion.div
					className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-100"
					initial={{ y: 100, opacity: 0 }}
					animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
					transition={{
						duration: 0.6,
						delay: 0.1,
						ease: [0.22, 1, 0.36, 1],
					}}
				>
					<div className="flex flex-col lg:flex-row gap-8 items-center">
						{/* Icon */}
						<div className="flex-shrink-0">
							<div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
								<Icon
									className="w-10 h-10 lg:w-12 lg:h-12 text-gray-800"
									strokeWidth={1.5}
								/>
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 text-center lg:text-left">
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								{service.subtitle}
							</span>
							<h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2 mb-4">
								{service.title}
							</h3>
							<p className="text-gray-600 text-lg leading-relaxed max-w-xl">
								{service.description}
							</p>
						</div>

						{/* Index number */}
						<div className="flex-shrink-0 hidden lg:block">
							<span className="text-8xl font-bold text-gray-100">
								{String(index + 1).padStart(2, "0")}
							</span>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</div>
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
		<section ref={containerRef} className="bg-gray-50">
			{/* Section Header */}
			<div className="py-24 lg:py-32">
				<motion.div
					ref={headerRef}
					className="max-w-7xl mx-auto px-6 text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={
						isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
					}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Explore Our Services
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Everything you need to embed yield infrastructure into your
						platform.
					</p>
				</motion.div>
			</div>

			{/* Stacked Cards */}
			<div className="relative" style={{ height: `${services.length * 100}vh` }}>
				{services.map((service, index) => {
					const targetScale = 1 - (services.length - index) * 0.05
					const rangeStart = index / services.length
					const rangeEnd = (index + 1) / services.length

					return (
						<ServiceCard
							key={service.title}
							service={service}
							index={index}
							progress={scrollYProgress}
							range={[rangeStart, rangeEnd]}
							targetScale={targetScale}
						/>
					)
				})}
			</div>
		</section>
	)
}
