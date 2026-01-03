import {
	motion,
	useScroll,
	useTransform,
	useMotionValue,
	animate,
} from "framer-motion"
import { useRef, useEffect, useState } from "react"

const milestones = [
	{ id: 1, label: "Idle Capital" },
	{ id: 2, label: "Connect Quirk" },
	{ id: 3, label: "Earn Yield" },
	{ id: 4, label: "Revenue" },
]

// Data for each step - what to show in cards
const stepData = [
	{
		quirkless: { label: "Idle Capital", value: "$50M", subtext: "sitting unused" },
		quirk: { label: "Idle Capital", value: "$50M", subtext: "ready to earn" },
	},
	{
		quirkless: { label: "Your Options", value: "0", subtext: "yield solutions" },
		quirk: { label: "Integration", value: "1", subtext: "SDK to embed" },
	},
	{
		quirkless: { label: "Annual Yield", value: "0%", subtext: "APY" },
		quirk: { label: "Annual Yield", value: "5%", subtext: "APY", highlight: true },
	},
	{
		quirkless: { label: "Lost Revenue", value: "$0", subtext: "per year" },
		quirk: { label: "Your Revenue", value: "$2.5M", subtext: "per year (90% share)", highlight: true },
	},
]

export function HowItWorksSection() {
	const containerRef = useRef<HTMLDivElement>(null)
	const [activeStep, setActiveStep] = useState(0)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			const step = Math.min(Math.floor(value * milestones.length), milestones.length - 1)
			setActiveStep(step)
		})
		return unsubscribe
	}, [scrollYProgress])

	const currentData = stepData[activeStep]

	return (
		<section ref={containerRef} className="bg-white">
			{/* Tall scroll container - 4 steps = 400vh for slower scroll */}
			<div className="relative" style={{ height: "400vh" }}>
				{/* Sticky content that stays in view */}
				<div className="sticky top-0 h-screen flex items-center justify-center p-4">
					{/* Full Card Container - 90vw x 90vh */}
					<div
						className="bg-gray-100 rounded-3xl p-6 lg:p-10 flex flex-col"
						style={{ width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" }}
					>
						{/* Header inside card */}
						<div className="text-center mb-6 lg:mb-8">
							<h2 className="text-4xl lg:text-6xl font-bold text-gray-900">
								How Quirk Works
							</h2>
						</div>

						{/* Main Layout: Steps + Cards */}
						<div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
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
														index <= activeStep
															? "border-gray-900 bg-gray-900"
															: "border-gray-400 bg-white"
													}`}
												>
													<span className={`text-sm font-bold ${index <= activeStep ? "text-white" : "text-gray-400"}`}>
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
							<div className="flex-1 grid lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
								{/* QUIRKLESS Card */}
								<motion.div
									className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 flex flex-col justify-center items-center text-center overflow-hidden"
									key={`quirkless-${activeStep}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
								>
									<p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
										Quirkless
									</p>

									<p className="text-sm text-gray-500 mb-2">
										{currentData.quirkless.label}
									</p>

									<motion.p
										className="text-6xl lg:text-8xl xl:text-9xl font-bold text-gray-300 leading-none"
										key={`quirkless-value-${activeStep}`}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
									>
										{currentData.quirkless.value}
									</motion.p>

									<p className="text-base text-gray-400 mt-4">
										{currentData.quirkless.subtext}
									</p>
								</motion.div>

								{/* QUIRK Card */}
								<motion.div
									className="bg-gray-900 rounded-2xl p-6 lg:p-8 text-white flex flex-col justify-center items-center text-center overflow-hidden"
									key={`quirk-${activeStep}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: 0.1 }}
								>
									<p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
										Quirk
									</p>

									<p className="text-sm text-gray-400 mb-2">
										{currentData.quirk.label}
									</p>

									<motion.p
										className={`text-6xl lg:text-8xl xl:text-9xl font-bold leading-none ${
											currentData.quirk.highlight ? "text-green-400" : "text-white"
										}`}
										key={`quirk-value-${activeStep}`}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
									>
										{currentData.quirk.value}
									</motion.p>

									<p className="text-base text-gray-500 mt-4">
										{currentData.quirk.subtext}
									</p>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
