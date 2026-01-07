/**
 * Contact Page - Demo Request
 * Features:
 * - Video section at top
 * - Scroll down to see form
 * - Form centered on page
 */

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { DemoRequestForm } from "./components/DemoRequestForm"
import { Navbar } from "./Navbar"

export function ContactPage() {
	const scrollToForm = () => {
		const formSection = document.getElementById("demo-form")
		if (formSection) {
			formSection.scrollIntoView({ behavior: "smooth" })
		}
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<Navbar />

			{/* Video Section */}
			<section className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-claude-orange-50 to-claude-100">
				<div className="container mx-auto px-4 py-20">
					{/* Title */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12"
					>
						<h1 className="text-2xl md:text-4xl font-medium text-gray-900 mb-6">See Quirk in Action</h1>
						<p className="text-sm md:text-md text-gray-600 max-w-2xl mx-auto">
							Watch how Quirk helps businesses like yours integrate DeFi yield in minutes
						</p>
					</motion.div>

					{/* Video Embed */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="max-w-4xl mx-auto"
					>
						<div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
							{/* Placeholder for video - replace with actual YouTube/Vimeo embed */}
							<iframe
								className="w-full h-full"
								src="https://www.youtube.com/embed/dQw4w9WgXcQ"
								title="Quirk Demo Video"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>

							{/* Alternative: Custom video placeholder if no URL yet */}
							{/* <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white text-lg">Demo video coming soon</p>
              </div> */}
						</div>
					</motion.div>

					{/* Scroll Indicator */}
					<motion.button
						onClick={scrollToForm}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
					>
						<span className="text-sm font-medium">Scroll for demo request</span>
						<motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
							<ChevronDown className="w-6 h-6" />
						</motion.div>
					</motion.button>
				</div>
			</section>

			{/* Form Section */}
			<section id="demo-form" className="py-20 px-4">
				<div className="container mx-auto max-w-2xl">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12"
					>
						<motion.button
							whileHover={{ scale: 1.04 }}
							whileTap={{ scale: 0.94 }}
							className="inline-flex items-center gap-2 mb-4 px-4 py-1 rounded-full bg-claude-orange-100/80 border border-white/20 text-claude-orange-500 text-xs font-medium cursor-pointer hover:scale-[1.04] transition-all"
						>
							CONTACT US
						</motion.button>
						<h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6">Let's Talk</h2>
						<p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto mb-8">
							Reach out to the Quirk team for product inquiries, support,
							<br />
							or partnership opportunities. We're here to help.
						</p>
						<motion.div
							animate={{ y: [0, 8, 0] }}
							transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
							className="flex justify-center"
						>
							<ChevronDown className="w-6 h-6 text-gray-400" />
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<DemoRequestForm />
					</motion.div>
				</div>
			</section>
		</div>
	)
}
