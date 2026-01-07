import { useEffect, useRef, useState } from "react"

import { motion, useScroll } from "framer-motion"

import { milestones, stepData } from "./howItWorksData"

export function HowItWorksMobile() {
	const containerRef = useRef<HTMLDivElement>(null)
	const [activeStep, setActiveStep] = useState(-1) // Start with -1 (no step active)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end start"],
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			// Before scroll starts (value < 0.05), no step is active
			if (value < 0.05) {
				setActiveStep(-1)
				return
			}

			// Map scroll progress to steps (0-4)
			const adjustedValue = (value - 0.05) / 0.95
			const rawStep = adjustedValue * milestones.length

			// Force last step at 75%+ to ensure it activates
			const step = adjustedValue >= 0.75 ? milestones.length - 1 : Math.min(Math.floor(rawStep), milestones.length - 1)

			setActiveStep(step)
		})
		return unsubscribe
	}, [scrollYProgress])

	const currentData = activeStep >= 0 ? stepData[activeStep] : null

	return (
		<section ref={containerRef} className="bg-claude-bg-50 ">
			{/* Tall scroll container - 4 steps = 400vh for slower scroll */}
			<div className="relative" style={{ height: "450vh" }}>
				{/* Sticky content that stays in view */}
				<div className="sticky top-0 h-screen flex items-center justify-center p-4">
					{/* Full Card Container - 90vw x 90vh */}
					<div className="bg-claude-bg-200/90 rounded-3xl p-6 flex flex-col h-fit w-full">
						{/* Header inside card */}
						<div className="text-center mb-4">
							<h2 className="text-2xl font-normal text-claude-gray-900">How it work</h2>
						</div>

						{/* Current Stage Indicator - Only show current stage */}
						<div className="text-center mb-3">
							{currentData && activeStep >= 0 ? (
								<motion.div
									className="flex items-center justify-center gap-3 text-gray-800"
									key={`stage-${activeStep}`}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
								>
									<span>────</span>
									<p>{milestones[activeStep].label}</p>
									<span>────</span>
								</motion.div>
							) : (
								<p className="text-lg font-medium text-gray-400">Scroll to begin</p>
							)}
						</div>

						{/* Cards Container - Vertical Stack */}
						<div className="flex flex-col gap-4 min-h-0 justify-center">
							{/* QUIRKLESS Card - Top */}
							<div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[220px]">
								<p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">Quirkless</p>
								{currentData ? (
									<>
										<p className="text-base text-gray-500 mb-4">{currentData.quirkless.label}</p>
										<motion.p
											className="text-5xl font-medium text-gray-300 leading-none"
											key={`quirkless-mobile-${activeStep}`}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
										>
											{currentData.quirkless.value}
										</motion.p>
										<p className="text-sm text-gray-400 mt-5">{currentData.quirkless.subtext}</p>
									</>
								) : (
									<p className="text-gray-400 text-base">Scroll to begin</p>
								)}
							</div>

							{/* QUIRK Card - Bottom */}
							<div className="bg-gray-900 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center min-h-[220px]">
								<p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">Quirk</p>
								{currentData ? (
									<>
										<p className="text-base text-gray-400 mb-4">{currentData.quirk.label}</p>
										{currentData.quirk.breakdown ? (
											<motion.div
												className="w-full space-y-3"
												key={`quirk-mobile-breakdown-${activeStep}`}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
											>
												{currentData.quirk.breakdown.map((item, idx) => (
													<motion.div
														key={item.label}
														className="flex justify-between items-center px-4 py-3 bg-gray-800/50 rounded-lg"
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: 0.1 * idx, duration: 0.3 }}
													>
														<span className="text-sm text-gray-400">{item.label}</span>
														<span className={`text-xl font-medium ${item.color}`}>{item.value}</span>
													</motion.div>
												))}
											</motion.div>
										) : (
											<motion.p
												className={`text-5xl font-medium leading-none ${
													currentData.quirk.highlight ? "text-green-500" : "text-white"
												}`}
												key={`quirk-mobile-value-${activeStep}`}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
											>
												{currentData.quirk.value}
											</motion.p>
										)}
										<p className="text-sm text-gray-500 mt-5">{currentData.quirk.subtext}</p>
									</>
								) : (
									<p className="text-gray-500 text-base">Scroll to begin</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
