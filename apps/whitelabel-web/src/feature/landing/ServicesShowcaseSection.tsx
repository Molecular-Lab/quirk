import { motion, useInView } from "framer-motion"
import {
	Code2,
	Bot,
	Shield,
	FileCheck,
	ArrowLeftRight,
	Zap,
	TrendingUp,
	Lock,
	CheckCircle2,
	Wallet,
} from "lucide-react"
import { useRef } from "react"

const services = [
	{
		category: "Developer Tools",
		categoryColor: "text-purple-600",
		title: "Instant Earning with Embedded Earn SDK",
		description:
			"Embed yield capabilities directly into your platform. Start offering competitive returns to your users without building complex DeFi infrastructure from scratch.",
		benefits: [
			"Embed yield in minutes",
			"Simple SDK integration",
			"No DeFi expertise required",
		],
		icon: Code2,
		secondaryIcon: Zap,
		gradient: "from-purple-100 to-purple-50",
		accentColor: "bg-purple-500",
		iconBg: "bg-purple-100",
	},
	{
		category: "AI-Powered",
		categoryColor: "text-orange-600",
		title: "Smart Yield Agent",
		description:
			"Let AI optimize your yield strategies in real-time. Our intelligent agent continuously monitors markets and rebalances portfolios for maximum returns.",
		benefits: [
			"Automated yield optimization",
			"Real-time market insights",
			"Predictive rebalancing",
		],
		icon: Bot,
		secondaryIcon: TrendingUp,
		gradient: "from-orange-100 to-orange-50",
		accentColor: "bg-orange-500",
		iconBg: "bg-orange-100",
	},
	{
		category: "Security",
		categoryColor: "text-blue-600",
		title: "MPC Wallet Infrastructure",
		description:
			"Enterprise-grade security with multi-party computation wallets. Your users' funds are protected by institutional-level custody powered by Privy.",
		benefits: [
			"Institutional-grade custody",
			"MPC-powered security",
			"Privy integration",
		],
		icon: Shield,
		secondaryIcon: Lock,
		gradient: "from-blue-100 to-blue-50",
		accentColor: "bg-blue-500",
		iconBg: "bg-blue-100",
	},
	{
		category: "Compliance",
		categoryColor: "text-emerald-600",
		title: "Embedded Compliance Module",
		description:
			"Stay compliant without the complexity. Built-in regulatory compliance handles KYC, AML, and reporting so you can focus on building your product.",
		benefits: [
			"Built-in regulatory compliance",
			"Automated KYC/AML",
			"Audit-ready reporting",
		],
		icon: FileCheck,
		secondaryIcon: CheckCircle2,
		gradient: "from-emerald-100 to-emerald-50",
		accentColor: "bg-emerald-500",
		iconBg: "bg-emerald-100",
	},
	{
		category: "Payments",
		categoryColor: "text-violet-600",
		title: "On/Off Ramp Gateway",
		description:
			"Seamless fiat-to-crypto conversions for your users. Enable easy deposits and withdrawals with our integrated payment gateway.",
		benefits: [
			"Fiat on/off ramps",
			"Seamless conversions",
			"Multiple payment methods",
		],
		icon: ArrowLeftRight,
		secondaryIcon: Wallet,
		gradient: "from-violet-100 to-violet-50",
		accentColor: "bg-violet-500",
		iconBg: "bg-violet-100",
	},
]

interface ServiceCardProps {
	service: (typeof services)[0]
	index: number
	isReversed: boolean
}

const ServiceCard = ({ service, index, isReversed }: ServiceCardProps) => {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, margin: "-100px" })

	const Icon = service.icon
	const SecondaryIcon = service.secondaryIcon

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 60 }}
			animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
			transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
			className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-16 items-center`}
		>
			{/* Illustration Side */}
			<div className="flex-1 w-full">
				<motion.div
					className={`relative bg-gradient-to-br ${service.gradient} rounded-3xl p-8 lg:p-12 aspect-square max-w-md mx-auto overflow-hidden`}
					whileHover={{ scale: 1.02 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
				>
					{/* Floating decorative elements */}
					<motion.div
						className={`absolute top-6 right-6 w-12 h-12 ${service.accentColor} rounded-xl opacity-20`}
						animate={{
							y: [0, -10, 0],
							rotate: [0, 5, 0],
						}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<motion.div
						className={`absolute bottom-12 left-6 w-8 h-8 ${service.accentColor} rounded-full opacity-30`}
						animate={{
							y: [0, 10, 0],
							x: [0, 5, 0],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.5,
						}}
					/>
					<motion.div
						className={`absolute top-1/3 left-8 w-6 h-6 ${service.accentColor} rounded-lg opacity-20`}
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 10, 0],
						}}
						transition={{
							duration: 3.5,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 1,
						}}
					/>

					{/* Main icon container */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							className={`w-32 h-32 lg:w-40 lg:h-40 ${service.iconBg} rounded-3xl flex items-center justify-center shadow-lg`}
							initial={{ scale: 0.8, opacity: 0 }}
							animate={
								isInView
									? { scale: 1, opacity: 1 }
									: { scale: 0.8, opacity: 0 }
							}
							transition={{ duration: 0.5, delay: 0.3 }}
						>
							<Icon
								className={`w-16 h-16 lg:w-20 lg:h-20 ${service.categoryColor}`}
								strokeWidth={1.5}
							/>
						</motion.div>
					</div>

					{/* Secondary floating icon */}
					<motion.div
						className="absolute bottom-8 right-8 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md"
						animate={{
							y: [0, -8, 0],
						}}
						transition={{
							duration: 2.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<SecondaryIcon
							className={`w-7 h-7 ${service.categoryColor}`}
							strokeWidth={1.5}
						/>
					</motion.div>
				</motion.div>
			</div>

			{/* Content Side */}
			<div className="flex-1 w-full lg:max-w-lg">
				<motion.div
					initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
					animate={
						isInView
							? { opacity: 1, x: 0 }
							: { opacity: 0, x: isReversed ? -30 : 30 }
					}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					{/* Category tag */}
					<div className="flex items-center gap-2 mb-4">
						<span className={`w-2 h-2 rounded-full ${service.accentColor}`} />
						<span className={`text-sm font-medium ${service.categoryColor}`}>
							{service.category}
						</span>
					</div>

					{/* Title */}
					<h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
						{service.title}
					</h3>

					{/* Description */}
					<p className="text-gray-600 text-lg mb-6 leading-relaxed">
						{service.description}
					</p>

					{/* Benefits */}
					<ul className="space-y-3">
						{service.benefits.map((benefit, i) => (
							<motion.li
								key={i}
								className="flex items-center gap-3"
								initial={{ opacity: 0, x: -20 }}
								animate={
									isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
								}
								transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
							>
								<span
									className={`w-6 h-6 rounded-full ${service.accentColor} flex items-center justify-center`}
								>
									<CheckCircle2 className="w-4 h-4 text-white" />
								</span>
								<span className="text-gray-700 font-medium">{benefit}</span>
							</motion.li>
						))}
					</ul>
				</motion.div>
			</div>
		</motion.div>
	)
}

export const ServicesShowcaseSection = () => {
	const headerRef = useRef(null)
	const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

	return (
		<section className="py-24 lg:py-32 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				{/* Section Header */}
				<motion.div
					ref={headerRef}
					className="text-center mb-20"
					initial={{ opacity: 0, y: 30 }}
					animate={
						isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
					}
					transition={{ duration: 0.6 }}
				>
					<motion.div
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={
							isHeaderInView
								? { opacity: 1, scale: 1 }
								: { opacity: 0, scale: 0.9 }
						}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<Zap className="w-4 h-4 text-purple-600" />
						<span className="text-sm font-medium text-purple-600">
							Core Features
						</span>
					</motion.div>
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Everything You Need to
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
							Embed Yield Anywhere
						</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						From SDK integration to compliance, we provide the complete
						infrastructure for yield-as-a-service.
					</p>
				</motion.div>

				{/* Service Cards */}
				<div className="space-y-24 lg:space-y-32">
					{services.map((service, index) => (
						<ServiceCard
							key={service.title}
							service={service}
							index={index}
							isReversed={index % 2 === 1}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
