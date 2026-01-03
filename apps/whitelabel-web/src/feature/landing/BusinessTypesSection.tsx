import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { ShoppingBag, CreditCard, Briefcase, Palette, Car } from "lucide-react"

export function BusinessTypesSection() {
	const sectionRef = useRef(null)
	const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

	const businessTypes = [
		{
			title: "Fintech",
			description:
				"User wallets and payment processing funds earn yield during settlement periods. Optimize treasury management with automated yield generation.",
			icon: <CreditCard className="w-6 h-6 text-gray-900" />,
		},
		{
			title: "Freelance Platforms",
			description:
				"Project escrow and milestone payments earn yield until release. Freelancer earnings accumulate returns while waiting for withdrawal, maximizing value for both clients and workers.",
			icon: <Briefcase className="w-6 h-6 text-gray-900" />,
		},
		{
			title: "Creator Platforms",
			description:
				"Creator revenue earns yield until withdrawal. Boost creator retention and satisfaction by offering competitive returns on their earnings while they focus on content.",
			icon: <Palette className="w-6 h-6 text-gray-900" />,
		},
		{
			title: "Gig Worker Platforms",
			description:
				"Escrow funds and driver earnings earn yield until payout. Better than 0% checking accounts, creating a competitive advantage for platform adoption and retention.",
			icon: <Car className="w-6 h-6 text-gray-900" />,
		},
		{
			title: "E-commerce",
			description:
				"Enable merchants to earn yield on idle balances. Seller pending payouts and treasury funds generate returns while waiting for settlement.",
			icon: <ShoppingBag className="w-6 h-6 text-gray-900" />,
		},
	]

	const scrollerRef = useRef<HTMLDivElement>(null)
	const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
	const [isHovering, setIsHovering] = useState(false)
	const isHoveringRef = useRef(false)

	// Duplicate cards for infinite scroll (3 sets for seamless looping)
	const duplicatedCards = [...businessTypes, ...businessTypes, ...businessTypes]

	useEffect(() => {
		const scroller = scrollerRef.current
		if (!scroller) return

		// Calculate the width of one set of cards
		const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
		if (!firstCard) return

		const cardWidth = firstCard.offsetWidth
		const gap = 24 // gap-6 = 24px
		const oneSetWidth = businessTypes.length * (cardWidth + gap) - gap

		// Set initial scroll position to the middle set
		scroller.scrollLeft = oneSetWidth

		const handleScroll = () => {
			if (!scroller || isHoveringRef.current) return

			// If scrolled to the end, jump to the middle set
			if (scroller.scrollLeft >= oneSetWidth * 2 - 10) {
				scroller.scrollLeft = oneSetWidth
			}
			// If scrolled to the beginning, jump to the middle set
			else if (scroller.scrollLeft <= 10) {
				scroller.scrollLeft = oneSetWidth
			}
		}

		scroller.addEventListener("scroll", handleScroll)
		return () => scroller.removeEventListener("scroll", handleScroll)
	}, [businessTypes.length])

	// Auto-scroll functionality
	useEffect(() => {
		// Clear any existing interval first
		if (autoScrollIntervalRef.current) {
			clearInterval(autoScrollIntervalRef.current)
			autoScrollIntervalRef.current = null
		}

		if (!shouldAutoScroll || isHoveringRef.current) {
			return
		}

		const scroller = scrollerRef.current
		if (!scroller) return

		autoScrollIntervalRef.current = setInterval(() => {
			if (!scroller || !shouldAutoScroll || isHoveringRef.current) {
				if (autoScrollIntervalRef.current) {
					clearInterval(autoScrollIntervalRef.current)
					autoScrollIntervalRef.current = null
				}
				return
			}

			const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
			if (!firstCard) return

			const step = (firstCard.offsetWidth ?? 400) + 24 // card width + gap
			scroller.scrollBy({
				left: step,
				behavior: "smooth",
			})
		}, 3000) // Scroll every 3 seconds

		return () => {
			if (autoScrollIntervalRef.current) {
				clearInterval(autoScrollIntervalRef.current)
				autoScrollIntervalRef.current = null
			}
		}
	}, [shouldAutoScroll])

	const handleCardHover = (cardElement: HTMLElement) => {
		// Immediately stop auto-scroll
		isHoveringRef.current = true
		setIsHovering(true)
		setShouldAutoScroll(false)

		// Clear interval immediately
		if (autoScrollIntervalRef.current) {
			clearInterval(autoScrollIntervalRef.current)
			autoScrollIntervalRef.current = null
		}

		// Snap to the hovered card (only if needed)
		const scroller = scrollerRef.current
		if (!scroller) return

		const cardRect = cardElement.getBoundingClientRect()
		const scrollerRect = scroller.getBoundingClientRect()
		const cardCenter = cardRect.left + cardRect.width / 2
		const scrollerCenter = scrollerRect.left + scrollerRect.width / 2

		// Only scroll if card is not already centered
		if (Math.abs(cardCenter - scrollerCenter) > 50) {
			const scrollLeft = scroller.scrollLeft
			const relativeLeft = cardRect.left - scrollerRect.left + scrollLeft

			scroller.scrollTo({
				left: relativeLeft - (scrollerRect.width - cardRect.width) / 2,
				behavior: "smooth",
			})
		}
	}

	const handleCardLeave = () => {
		isHoveringRef.current = false
		setIsHovering(false)
		// Small delay before resuming auto-scroll
		setTimeout(() => {
			setShouldAutoScroll(true)
		}, 500)
	}

	const scrollByCard = (direction: "left" | "right") => {
		const scroller = scrollerRef.current
		if (!scroller) return

		// Use the width of the first card as the scroll step; fall back to 320px.
		const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
		const step = (firstCard?.offsetWidth ?? 320) + 24 // 24px gap from gap-6

		scroller.scrollBy({
			left: direction === "left" ? -step : step,
			behavior: "smooth",
		})
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
		hidden: { opacity: 0, y: 40, scale: 0.95 },
		visible: (index: number) => ({
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
				delay: index * 0.1,
				ease: [0.22, 1, 0.36, 1]
			}
		})
	}

	return (
		<section className="py-24 bg-white overflow-hidden">
			<motion.div
				ref={sectionRef}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-none w-full mx-auto px-6 sm:px-10 lg:px-16"
			>
				{/* Section Header */}
				<motion.div className="mb-12 text-center" variants={titleVariants}>
					<motion.h2
						className="text-5xl font-bold text-gray-950 mb-6"
						variants={titleVariants}
					>
						Support Any Platform
					</motion.h2>
					<motion.p
						className="text-xl text-gray-700 max-w-3xl mx-auto"
						variants={titleVariants}
					>
						From fintech to creators, scale with Quirk's infrastructure.
					</motion.p>
				</motion.div>

				{/* Cards Slider */}
				<div className="relative">
					<motion.div
						className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : { opacity: 0 }}
						transition={{ delay: 0.5 }}
					/>
					<motion.div
						className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : { opacity: 0 }}
						transition={{ delay: 0.5 }}
					/>

					<div
						ref={scrollerRef}
						className={`flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2 sm:px-4 ${isHovering ? "" : "snap-x snap-mandatory"}`}
						onMouseEnter={() => {
							isHoveringRef.current = true
							setIsHovering(true)
							setShouldAutoScroll(false)
							if (autoScrollIntervalRef.current) {
								clearInterval(autoScrollIntervalRef.current)
								autoScrollIntervalRef.current = null
							}
						}}
						onMouseLeave={() => {
							isHoveringRef.current = false
							setIsHovering(false)
							setTimeout(() => {
								setShouldAutoScroll(true)
							}, 500)
						}}
					>
						{duplicatedCards.map((type, idx) => {
							// Cycle through pastel colors: Purple, Orange, Gray
							const bgColors = ["bg-purple-50", "bg-orange-50", "bg-gray-100"]
							const originalIdx = idx % businessTypes.length
							const bgColor = bgColors[originalIdx % bgColors.length]

							return (
								<motion.div
									key={idx}
									data-business-card
									custom={originalIdx}
									variants={cardVariants}
									initial="hidden"
									animate={isInView ? "visible" : "hidden"}
									whileHover={{
										y: -8,
										scale: 1.02,
										boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
										transition: {
											type: "spring",
											stiffness: 300,
											damping: 20
										}
									}}
									className={`snap-center flex-shrink-0 w-[420px] sm:w-[480px] lg:w-[540px] ${bgColor} rounded-3xl p-10 flex flex-col justify-between border border-white/50 cursor-pointer`}
									onMouseEnter={(e) => handleCardHover(e.currentTarget)}
									onMouseLeave={handleCardLeave}
								>
									<div className="flex-1 flex flex-col">
										{/* Icon Header */}
										<div className="flex items-center gap-5 mb-10">
											<motion.div
												className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/50"
												whileHover={{
													scale: 1.1,
													rotate: 5,
													transition: { type: "spring", stiffness: 400 }
												}}
											>
												{type.icon}
											</motion.div>
											<h3 className="text-3xl font-bold text-gray-950">{type.title}</h3>
										</div>

										{/* Description */}
										<div className="flex-1 flex items-start">
											<p className="text-gray-700 text-xl leading-relaxed">
												{type.description}
											</p>
										</div>
									</div>
								</motion.div>
							)
						})}
					</div>

					<div className="pointer-events-none absolute inset-y-0 flex items-center justify-between w-full">
						<motion.button
							type="button"
							onClick={() => scrollByCard("left")}
							className="pointer-events-auto hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200"
							aria-label="Scroll left"
							whileHover={{ scale: 1.1, x: -2 }}
							whileTap={{ scale: 0.95 }}
							initial={{ opacity: 0, x: -20 }}
							animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
							transition={{ delay: 0.6 }}
						>
							<span className="text-2xl font-semibold text-gray-700">‹</span>
						</motion.button>
						<motion.button
							type="button"
							onClick={() => scrollByCard("right")}
							className="pointer-events-auto hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200"
							aria-label="Scroll right"
							whileHover={{ scale: 1.1, x: 2 }}
							whileTap={{ scale: 0.95 }}
							initial={{ opacity: 0, x: 20 }}
							animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
							transition={{ delay: 0.6 }}
						>
							<span className="text-2xl font-semibold text-gray-700">›</span>
						</motion.button>
					</div>
				</div>
			</motion.div>
		</section>
	)
}
