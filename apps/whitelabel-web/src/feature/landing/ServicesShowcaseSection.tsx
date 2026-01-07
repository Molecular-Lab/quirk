import { motion } from "framer-motion"

import { FeaturesGridSection } from "./FeaturesGridSection"

export const CoreServicesSection = () => {
	return (
		<section className="bg-claude-bg-50">
			<div className="max-w-7xl mx-auto px-6 text-center">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<motion.button
						whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.94 }}
						className="inline-flex items-center gap-2 mb-4 px-4 py-1 rounded-full bg-claude-orange-100/80 border border-white/20 text-claude-orange-500 text-xs font-medium cursor-pointer hover:scale-[1.04] transition-all"
					>
						Solution
					</motion.button>
					<h2 className="text-2xl lg:text-4xl text-claude-gray-900 mb-3">Simplifying Complexity</h2>
					<p className="text-base lg:text-lg text-claude-gray-800 max-w-2xl mx-auto px-4">
						Quirk makes it effortless to bring your business into on-chain
					</p>
					<p className="text-md lg:text-lg text-claude-gray-800 max-w-2xl mx-auto px-4 mb-1">
						Abstracting away complexity so you can activate new revenue streams globally
					</p>
				</motion.div>
			</div>
			<FeaturesGridSection />
		</section>
	)
}
