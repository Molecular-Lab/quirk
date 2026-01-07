import { motion, useScroll } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { milestones, stepData } from "./howItWorksData"

export function HowItWorksWeb() {
	const containerRef = useRef<HTMLDivElement>(null)
	const [activeStep, setActiveStep] = useState(-1) // Start with -1 (no step active)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end start"], // Start activating when section center hits viewport center
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			// Before scroll starts (value < 0.05), no step is active
			if (value < 0.05) {
				setActiveStep(-1)
				return
			}

			// Map scroll progress to steps (0-4)
			// Adjust value to start from 0 after initial threshold
			const adjustedValue = (value - 0.05) / 0.95 // Normalize 0.05-1.0 to 0-1
			const rawStep = adjustedValue * milestones.length

			// Force last step at 75%+ to ensure it activates
			const step = adjustedValue >= 0.75 ? milestones.length - 1 : Math.min(Math.floor(rawStep), milestones.length - 1)

			setActiveStep(step)
		})
		return unsubscribe
	}, [scrollYProgress])

	const currentData = activeStep >= 0 ? stepData[activeStep] : null

	return (
		<section ref={containerRef} className="bg-claude-bg-50">
			{/* Tall scroll container - 4 steps = 400vh for slower scroll */}
			<div className="relative" style={{ height: "400vh" }}>
				{/* Sticky content that stays in view */}
				<div className="sticky top-0 h-screen flex items-center justify-center p-4">
					{/* Full Card Container - 90vw x 90vh */}
					<div
						className="bg-claude-bg-100 rounded-3xl p-6 lg:p-10 flex flex-col"
						style={{ width: "90vw", height: "80vh", maxWidth: "90vw", maxHeight: "80vh" }}
					>
						{/* Header inside card */}
						<div className="text-center mb-6 lg:mb-8">
							<h2 className="text-2xl lg:text-4xl font-normal text-claude-gray-900">How Quirk Works</h2>
						</div>

						{/* Main Layout: Steps + Cards */}
						<div className="flex-1 flex flex-row gap-6 lg:gap-8 min-h-0">
							{/* Left: Milestone Steps with Vertical Line */}
							<div className="lg:w-56 flex-shrink-0">
								<div className="relative h-full flex flex-col justify-center">
									{/* Vertical Line Background */}
									<div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300" />

									{/* Vertical Line Progress */}
									<motion.div
										className="absolute left-5 top-0 w-0.5 bg-gray-900 origin-top transition-all duration-500"
										style={{
											height: `${Math.min(((activeStep + 1) / milestones.length) * 100, 100)}%`,
										}}
									/>

									<div className="space-y-12 relative">
										{milestones.map((milestone, index) => (
											<motion.div
												key={milestone.id}
												className="flex items-center gap-4"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.2 + index * 0.1 }}
											>
												<div
													className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${
														index <= activeStep ? "border-gray-900 bg-gray-900" : "border-gray-400 bg-white"
													}`}
												>
													<span
														className={`text-sm font-medium ${index <= activeStep ? "text-white" : "text-gray-400"}`}
													>
														{index + 1}
													</span>
												</div>
												<span
													className={`text-base font-medium transition-colors duration-300 ${
														index <= activeStep ? "text-gray-900" : "text-gray-400"
													}`}
												>
													{milestone.label}
												</span>
											</motion.div>
										))}
									</div>
								</div>
							</div>

							{/* Right: Two Big Cards with Standalone Numbers */}
							<div className="flex-1 grid grid-cols-2 gap-4 lg:gap-6 min-h-0">
								{/* QUIRKLESS Card - Static container */}
								<div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 flex flex-col justify-center items-center text-center overflow-hidden">
									<p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Quirkless</p>
									{currentData ? (
										<>
											<p className="text-sm text-gray-500 mb-2">{currentData.quirkless.label}</p>
											<motion.p
												className="text-6xl lg:text-8xl xl:text-9xl font-medium text-gray-300 leading-none"
												key={`quirkless-value-${activeStep}`}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
											>
												{currentData.quirkless.value}
											</motion.p>
											<p className="text-base text-gray-400 mt-4">{currentData.quirkless.subtext}</p>
										</>
									) : (
										<p className="text-gray-400 text-lg">Scroll to begin</p>
									)}
								</div>

								{/* QUIRK Card - Static container */}
								<div className="bg-gray-900 rounded-2xl p-6 lg:p-8 text-white flex flex-col justify-center items-center text-center overflow-hidden">
									<p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">Quirk</p>
									{currentData ? (
										<>
											<p className="text-sm text-gray-400 mb-2">{currentData.quirk.label}</p>
											{currentData.quirk.breakdown ? (
												<motion.div
													className="w-full space-y-4"
													key={`quirk-breakdown-${activeStep}`}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
												>
													{currentData.quirk.breakdown.map((item, idx) => (
														<motion.div
															key={item.label}
															className="flex justify-between items-center px-4 py-3 bg-gray-800/50 rounded-xl"
															initial={{ opacity: 0, x: -20 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{ delay: 0.1 * idx, duration: 0.3 }}
														>
															<span className="text-sm text-gray-400">{item.label}</span>
															<span className={`text-2xl lg:text-3xl font-medium ${item.color}`}>{item.value}</span>
														</motion.div>
													))}
												</motion.div>
											) : (
												<motion.p
													className={`text-6xl lg:text-8xl xl:text-9xl font-medium leading-none ${
														currentData.quirk.highlight ? "text-green-500" : "text-white"
													}`}
													key={`quirk-value-${activeStep}`}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
												>
													{currentData.quirk.value}
												</motion.p>
											)}
											<p className="text-base text-gray-500 mt-4">{currentData.quirk.subtext}</p>
										</>
									) : (
										<p className="text-gray-500 text-lg">Scroll to begin</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
