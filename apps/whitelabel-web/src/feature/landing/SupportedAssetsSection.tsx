import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import usdcLogo from "@/assets/usd-coin-usdc-logo.png"
import usdtLogo from "@/assets/tether-usdt-logo.png"

export function SupportedAssetsSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.3 })

	const protocols = [
		{
			name: "USDC",
			logo: usdcLogo,
		},
		{
			name: "USDT",
			logo: usdtLogo,
		},
		{
			name: "More",
			icon: "+",
			description: "More stablecoins coming soon",
		},
	]

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
				ease: [0.22, 1, 0.36, 1],
			},
		},
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 40, scale: 0.9 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	}

	const logoVariants = {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: "spring",
				stiffness: 200,
				damping: 15,
			},
		},
	}

	return (
		<section className="py-24 lg:py-32 bg-gray-50 overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				<motion.div className="text-center mb-16" variants={titleVariants}>
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Supported Assets
					</h2>
					<p className="text-xl text-gray-600">
						Start earning yield on major stablecoins
					</p>
				</motion.div>

				{/* Asset Cards */}
				<motion.div
					className="flex flex-wrap gap-6 justify-center"
					variants={containerVariants}
				>
					{protocols.map((protocol, idx) => (
						<motion.div
							key={idx}
							variants={cardVariants}
							whileHover={{
								y: -4,
								transition: {
									type: "spring",
									stiffness: 300,
									damping: 20,
								},
							}}
							className="w-[200px] bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:shadow-lg transition-shadow"
						>
							<div className="flex flex-col items-center justify-center gap-4 w-full">
								<motion.div
									variants={logoVariants}
									whileHover={{
										scale: 1.05,
										transition: { type: "spring", stiffness: 400 },
									}}
									className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
								>
									{protocol.logo ? (
										<img
											src={protocol.logo}
											alt={protocol.name}
											className="w-10 h-10"
										/>
									) : protocol.icon === "+" ? (
										<motion.span
											className="text-3xl font-bold text-gray-400"
											animate={{
												scale: [1, 1.1, 1],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										>
											{protocol.icon}
										</motion.span>
									) : (
										<span className="text-3xl">{protocol.icon}</span>
									)}
								</motion.div>
								<div className="text-center">
									<span className="block text-lg font-semibold text-gray-900">
										{protocol.name}
									</span>
									{protocol.description && (
										<motion.span
											className="text-sm text-gray-500 mt-1 block"
											initial={{ opacity: 0 }}
											animate={isInView ? { opacity: 1 } : { opacity: 0 }}
											transition={{ delay: 0.5 }}
										>
											{protocol.description}
										</motion.span>
									)}
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</motion.div>
		</section>
	)
}
