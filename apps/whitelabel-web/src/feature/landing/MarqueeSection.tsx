import { motion } from "framer-motion"

export function MarqueeSection() {
	// Create repeated text for seamless scroll
	const marqueeText = "WHY QUIRK? · "
	const repeatedText = Array(10).fill(marqueeText).join("")

	return (
		<section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative">
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute inset-0" style={{
					backgroundImage: `repeating-linear-gradient(
						90deg,
						transparent,
						transparent 50px,
						rgba(255,255,255,0.1) 50px,
						rgba(255,255,255,0.1) 51px
					)`
				}} />
			</div>

			{/* Marquee container */}
			<div className="relative">
				{/* First row - moves left */}
				<motion.div
					className="flex whitespace-nowrap"
					animate={{ x: ["0%", "-50%"] }}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear"
					}}
				>
					<span className="text-6xl md:text-8xl font-bold text-white/20 tracking-wider">
						{repeatedText}
					</span>
				</motion.div>

				{/* Center content overlay */}
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center"
					>
						<h2 className="text-4xl md:text-6xl font-bold text-white mb-2">
							WHY QUIRK?
						</h2>
						<p className="text-white/80 text-lg md:text-xl">
							The infrastructure that powers yield
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
