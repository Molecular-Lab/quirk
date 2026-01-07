import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { TrendingUp, DollarSign, Zap, PieChart, Globe, Check } from "lucide-react"

const benefits = {
	growth: {
		id: "growth",
		title: "30× Stablecoin Growth",
		icon: TrendingUp,
	},
	dormant: {
		id: "dormant",
		title: "Turn $135B Idle Capital into Revenue",
		icon: DollarSign,
	},
	sdk: {
		id: "sdk",
		title: "Plug & Play SDK Integration",
		icon: Zap,
	},
	yield: {
		id: "yield",
		title: "Multi-Strategy DeFi Yields",
		icon: PieChart,
	},
	borderless: {
		id: "borderless",
		title: "24/7 Borderless Finance",
		icon: Globe,
	},
}

const comparisonData = [
	{ feature: "Yield Earning", fiat: "0.1% savings account", stablecoin: "5% DeFi yield", advantage: true },
	{ feature: "Transfer Speed", fiat: "1-3 business days", stablecoin: "< 1 minute", advantage: true },
	{
		feature: "Global Access",
		fiat: "Limited by banks & borders",
		stablecoin: "180+ countries instantly",
		advantage: true,
	},
	{ feature: "Operating Hours", fiat: "9am-5pm weekdays", stablecoin: "24/7/365", advantage: true },
	{ feature: "Cross-Border Fees", fiat: "3-7% fees + delays", stablecoin: "< 0.1% fees", advantage: true },
	{ feature: "Programmable Money", fiat: "No", stablecoin: "Smart contracts", advantage: true },
	{ feature: "Transparency", fiat: "Opaque intermediaries", stablecoin: "On-chain, auditable", advantage: true },
	{ feature: "Settlement", fiat: "T+2 to T+5 days", stablecoin: "Instant finality", advantage: true },
	{
		feature: "Idle Capital",
		fiat: "Loses to inflation (7-14 days)",
		stablecoin: "Earns yield automatically",
		advantage: true,
	},
	{ feature: "Integration", fiat: "Complex banking APIs", stablecoin: "Simple plug & play SDK", advantage: true },
]

interface BenefitCardProps {
	benefit: {
		id: string
		title: string
		icon: any
	}
	className?: string
}

const BenefitCard = ({ benefit, className = "" }: BenefitCardProps) => {
	const Icon = benefit.icon

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
		},
	}

	return (
		<motion.div
			variants={itemVariants}
			className={`bg-gray-50 rounded-3xl p-12 lg:p-16 hover:shadow-lg transition-shadow relative flex items-center justify-center ${className}`}
			whileHover={{ y: -4, scale: 1.01 }}
		>
			<div className="text-center">
				<div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
					<Icon className="w-10 h-10 text-white" />
				</div>
				<h3 className="text-2xl lg:text-3xl font-normal text-gray-900 leading-tight">{benefit.title}</h3>
			</div>
		</motion.div>
	)
}

const ComparisonTableCard = () => {
	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
		},
	}

	return (
		<motion.div variants={itemVariants} className="lg:col-span-3 bg-gray-900 rounded-2xl p-8 lg:p-12">
			<div className="text-center mb-8">
				<h3 className="text-3xl lg:text-4xl font-medium text-white">Stablecoins vs Traditional Finance</h3>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-700">
							<th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
							<th className="text-left py-4 px-6 text-gray-400 font-medium">Traditional Fiat Banking</th>
							<th className="text-left py-4 px-6 text-gray-400 font-medium">Stablecoins (USDC)</th>
						</tr>
					</thead>
					<tbody>
						{comparisonData.map((row, index) => (
							<motion.tr
								key={row.feature}
								className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.1 * index }}
							>
								<td className="py-4 px-6 text-white font-normal">{row.feature}</td>
								<td className="py-4 px-6 text-gray-400">{row.fiat}</td>
								<td className="py-4 px-6 text-white font-normal">
									<div className="flex items-center gap-2">
										{row.stablecoin}
										{row.advantage && <Check className="w-5 h-5 flex-shrink-0 text-green-400" />}
									</div>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	)
}

export function WhyStablecoinSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.2 })

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	}

	const titleVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	return (
		<section className="py-24 lg:py-32 bg-white overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				{/* Header */}
				<motion.div className="text-center mb-16" variants={titleVariants}>
					<h2 className="text-4xl lg:text-5xl font-medium text-gray-900">WHY QUIRK?</h2>
				</motion.div>

				{/* Row 1: Stablecoin (35%) + Stacked Cards (65%) */}
				<div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6 lg:mb-8">
					{/* Stablecoin Growth - 35% width */}
					<div className="lg:w-[35%]">
						<BenefitCard benefit={benefits.growth} className="h-full min-h-[300px]" />
					</div>

					{/* Right stacked cards - 65% width */}
					<div className="lg:w-[65%] flex flex-col gap-6 lg:gap-8">
						<BenefitCard benefit={benefits.dormant} />
						<BenefitCard benefit={benefits.sdk} />
					</div>
				</div>

				{/* Row 2: Borderless (65%) + Multi-Strategy (35%) */}
				<div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6 lg:mb-8">
					{/* Borderless - 65% width */}
					<div className="lg:w-[65%]">
						<BenefitCard benefit={benefits.borderless} className="h-full min-h-[300px]" />
					</div>

					{/* Multi-Strategy - 35% width */}
					<div className="lg:w-[35%]">
						<BenefitCard benefit={benefits.yield} className="h-full min-h-[300px]" />
					</div>
				</div>

				{/* Comparison Table - Full Width */}
				<ComparisonTableCard />
			</motion.div>
		</section>
	)
}
