import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Zap, Shield, LayoutDashboard, Bot } from "lucide-react"

export function CustomizeEarnSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.2 })

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
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

	const cardVariants = {
		hidden: { opacity: 0, y: 40 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	const iconVariants = {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: "spring" as const,
				stiffness: 200,
				damping: 15,
				delay: 0.2,
			},
		},
	}

	const features = [
		{
			icon: Zap,
			title: "Fast Integration",
			description: "Embed our SDK in minutes. Start offering yield without complex infrastructure.",
		},
		{
			icon: Shield,
			title: "Secure Custody",
			description: "Institutional-grade MPC custody powered by Privy. Funds are always protected.",
		},
		{
			icon: LayoutDashboard,
			title: "White-Label Dashboard",
			description: "Fully branded analytics and portfolio tracking for your clients.",
		},
		{
			icon: Bot,
			title: "Agent Analytics",
			description: "AI-powered market insights and predictive modeling to optimize yield.",
		},
	]

	return (
		<section className="py-32 bg-white overflow-hidden">
			<div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
				<motion.div
					ref={ref}
					variants={containerVariants}
					initial="hidden"
					animate={isInView ? "visible" : "hidden"}
					className="grid lg:grid-cols-2 gap-20 items-start"
				>
					{/* Left Column: Text Content */}
					<motion.div className="flex flex-col space-y-12 max-w-2xl" variants={titleVariants}>
						<motion.h2
							className="text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]"
							variants={titleVariants}
						>
							Customize Earn Solution At Scale
						</motion.h2>
						<motion.p className="text-xl text-gray-600 leading-relaxed max-w-xl" variants={titleVariants}>
							Build your own yield product with our institutional-grade infrastructure.
						</motion.p>
					</motion.div>

					{/* Right Column: Feature Cards Grid */}
					<motion.div className="grid sm:grid-cols-2 gap-x-12 gap-y-16" variants={containerVariants}>
						{features.map((feature, index) => (
							<motion.div
								key={index}
								variants={cardVariants}
								whileHover={{
									x: 5,
									transition: { duration: 0.2 },
								}}
								className="group flex flex-col items-start space-y-6 border-l-2 border-gray-200 pl-8 hover:border-gray-400 transition-colors duration-300"
							>
								<motion.div
									variants={iconVariants}
									whileHover={{
										scale: 1.1,
										rotate: 5,
										transition: { type: "spring" as const, stiffness: 400 },
									}}
									className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-gray-100 group-hover:shadow-md transition-all duration-300"
								>
									<feature.icon className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
								</motion.div>
								<div className="space-y-4">
									<h3 className="text-3xl font-normal text-gray-900 group-hover:text-gray-700 transition-colors">
										{feature.title}
									</h3>
									<p className="text-gray-500 text-lg leading-relaxed">{feature.description}</p>
								</div>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}
