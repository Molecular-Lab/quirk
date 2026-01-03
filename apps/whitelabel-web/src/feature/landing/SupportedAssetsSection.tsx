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
				delayChildren: 0.2
			}
		}
	}

	const titleVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 40, scale: 0.9 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const logoVariants = {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: "spring",
				stiffness: 200,
				damping: 15
			}
		}
	}

	return (
		<section className="pt-20 pb-32 bg-white overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				<motion.div className="text-center mb-12" variants={titleVariants}>
					<motion.h3
						className="text-5xl font-bold text-gray-950 mb-4"
						variants={titleVariants}
					>
						Supported Assets
					</motion.h3>
				</motion.div>

				{/* Protocol Cards */}
				<motion.div
					className="flex gap-6 justify-center pb-4"
					variants={containerVariants}
				>
					{protocols.map((protocol, idx) => (
						<motion.div
							key={idx}
							variants={cardVariants}
							whileHover={{
								y: -8,
								scale: 1.02,
								boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
								borderColor: "#93c5fd",
								transition: {
									type: "spring",
									stiffness: 300,
									damping: 20
								}
							}}
							className="flex-shrink-0 w-[240px] bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center cursor-pointer"
						>
							<div className="flex flex-col items-center justify-center gap-4 w-full">
								<motion.div
									variants={logoVariants}
									whileHover={{
										scale: 1.1,
										rotate: 5,
										transition: { type: "spring", stiffness: 400 }
									}}
									className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm"
								>
									{protocol.logo ? (
										<motion.img
											src={protocol.logo}
											alt={protocol.name}
											className="w-14 h-14"
											whileHover={{ scale: 1.1 }}
										/>
									) : protocol.icon === "+" ? (
										<motion.span
											className="text-4xl font-bold text-gray-500"
											animate={{
												scale: [1, 1.1, 1],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut"
											}}
										>
											{protocol.icon}
										</motion.span>
									) : (
										<span className="text-4xl">{protocol.icon}</span>
									)}
								</motion.div>
								<div className="text-center">
									<span className="block text-xl font-bold text-gray-950">{protocol.name}</span>
									{protocol.description && (
										<motion.span
											className="text-sm text-gray-600 mt-1 block"
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
