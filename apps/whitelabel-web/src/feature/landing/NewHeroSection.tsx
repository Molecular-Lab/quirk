import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { AnimatedButton, FloatingElement } from "@/components/animations"
import { AsciiGlobe2D } from "./AsciiGlobe"

export function NewHeroSection() {
	const containerRef = useRef(null)
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"]
	})

	const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
	const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

	// Word animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.3
			}
		}
	}

	const wordVariants = {
		hidden: {
			opacity: 0,
			y: 40,
			filter: "blur(8px)"
		},
		visible: {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const subtitleVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.8,
				delay: 0.8,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const buttonVariants = {
		hidden: { opacity: 0, y: 20, scale: 0.9 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.6,
				delay: 1.1,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const headlineWords = "Earn Anywhere Everywhere with Stablecoin".split(" ")

	return (
		<section
			ref={containerRef}
			className="relative min-h-[100vh] flex items-center overflow-hidden"
		>
			{/* Animated gradient background - Soft purple/green */}
			<motion.div
				className="absolute inset-0 opacity-40"
				style={{ y: backgroundY }}
			>
				<img
					src="/Loop Background GIF by Trakto.gif"
					className="w-full h-full object-cover"
					alt=""
				/>
			</motion.div>

			{/* Overlay to soften with purple/green tones */}
			<div className="absolute inset-0 bg-gradient-to-b from-purple-50/60 via-green-50/40 to-white/95" />

			{/* Animated decorative gradients */}
			<FloatingElement
				className="absolute top-20 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-blue-100/25 via-purple-100/20 to-cyan-100/15 rounded-full blur-[120px]"
				duration={8}
				distance={30}
				delay={0}
			/>
			<FloatingElement
				className="absolute bottom-0 -left-20 w-[700px] h-[700px] bg-gradient-to-tr from-purple-100/20 via-blue-100/15 to-transparent rounded-full blur-[120px]"
				duration={10}
				distance={25}
				delay={2}
			/>
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-white/20 to-white/90" />

			{/* Animated floating shapes */}
			<FloatingElement
				className="absolute top-1/4 left-[10%] w-4 h-4 rounded-full bg-purple-300/40"
				duration={5}
				distance={15}
				delay={0.5}
			/>
			<FloatingElement
				className="absolute top-1/3 right-[15%] w-3 h-3 rounded-full bg-blue-300/40"
				duration={4}
				distance={12}
				delay={1}
			/>
			<FloatingElement
				className="absolute bottom-1/3 left-[20%] w-2 h-2 rounded-full bg-green-300/50"
				duration={6}
				distance={18}
				delay={1.5}
			/>
			<FloatingElement
				className="absolute top-1/2 right-[25%] w-5 h-5 rounded-full bg-purple-200/30"
				duration={7}
				distance={20}
				delay={0.8}
			/>

			<motion.div
				className="relative z-10 max-w-7xl mx-auto px-6"
				style={{ y: textY, opacity }}
			>
				<div className="text-center w-full mx-auto">
					{/* Animated headline - word by word */}
					<motion.h1
						className="text-8xl font-bold text-gray-950 mb-8 leading-tight"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{headlineWords.map((word, index) => (
							<motion.span
								key={index}
								variants={wordVariants}
								className="inline-block mr-[0.25em]"
							>
								{word}
							</motion.span>
						))}
					</motion.h1>

					{/* Animated subtitle */}
					<motion.p
						className="text-3xl text-gray-700 mb-12 leading-relaxed max-w-6xl mx-auto"
						variants={subtitleVariants}
						initial="hidden"
						animate="visible"
					>
						Turn idle balances into active revenue streams with
						institutional-grade custody and compliance.
					</motion.p>

					{/* Animated CTA button */}
					<motion.div
						className="flex items-center justify-center"
						variants={buttonVariants}
						initial="hidden"
						animate="visible"
					>
						<AnimatedButton
							href="https://tally.so/r/VLGvyj"
							target="_blank"
							rel="noopener noreferrer"
							className="bg-gray-900 text-white px-10 py-5 rounded-lg font-medium text-xl shadow-lg hover:bg-gray-800 transition-colors inline-block"
						>
							Join Our Waitlist
						</AnimatedButton>
					</motion.div>
				</div>
			</motion.div>

			{/* ASCII Globe - positioned at bottom, showing partial sphere */}
			<motion.div
				className="absolute bottom-0 left-0 right-0 h-[50vh] overflow-hidden pointer-events-none"
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
			>
				{/* Gradient fade at top to blend with hero content */}
				<div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent z-10" />
				<div className="w-full h-[80vh] translate-y-[30%]">
					<AsciiGlobe2D className="opacity-60" />
				</div>
			</motion.div>

			{/* Scroll indicator */}
			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.5, duration: 0.6 }}
			>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
					className="w-6 h-10 rounded-full border-2 border-gray-400 flex items-start justify-center p-2"
				>
					<motion.div
						className="w-1.5 h-1.5 rounded-full bg-gray-500"
						animate={{ y: [0, 12, 0] }}
						transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
					/>
				</motion.div>
			</motion.div>
		</section>
	)
}
