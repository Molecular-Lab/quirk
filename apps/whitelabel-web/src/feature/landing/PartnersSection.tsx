import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function PartnersSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.3 })

	// Partner/Protocol logos - using text placeholders that could be replaced with actual logos
	const partners = [
		{ name: "Aave", category: "DeFi" },
		{ name: "Compound", category: "Lending" },
		{ name: "Privy", category: "Auth" },
		{ name: "Circle", category: "USDC" },
		{ name: "Chainlink", category: "Oracle" },
		{ name: "Ethereum", category: "L1" },
	]

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2
			}
		}
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1] as const
			}
		}
	}

	return (
		<section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				{/* Header */}
				<motion.div
					className="text-center mb-12"
					variants={itemVariants}
				>
					<p className="text-white/90 text-xl md:text-2xl max-w-2xl mx-auto">
						Integrated with leading protocols to provide seamless yield generation
					</p>
				</motion.div>

				{/* Logos Grid */}
				<motion.div
					className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
					variants={containerVariants}
				>
					{partners.map((partner, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							whileHover={{ scale: 1.1, y: -5 }}
							className="group cursor-pointer"
						>
							<div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
								<p className="text-2xl md:text-3xl font-bold text-white/90 group-hover:text-white transition-colors">
									{partner.name}
								</p>
								<p className="text-sm text-white/50 mt-1">{partner.category}</p>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Scrolling logos row */}
				<motion.div
					className="mt-16 overflow-hidden"
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : { opacity: 0 }}
					transition={{ delay: 0.5 }}
				>
					<motion.div
						className="flex gap-16 items-center"
						animate={{ x: ["0%", "-50%"] }}
						transition={{
							duration: 30,
							repeat: Infinity,
							ease: "linear"
						}}
					>
						{[...partners, ...partners].map((partner, index) => (
							<div
								key={index}
								className="flex-shrink-0 text-white/30 text-xl font-semibold whitespace-nowrap"
							>
								{partner.name}
							</div>
						))}
					</motion.div>
				</motion.div>
			</motion.div>
		</section>
	)
}
