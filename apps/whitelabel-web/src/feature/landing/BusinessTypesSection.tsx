import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import {
	ShoppingBag,
	CreditCard,
	Briefcase,
	Palette,
	Car,
	TrendingUp,
	Coins,
	Wallet,
	PiggyBank,
	Store,
} from "lucide-react"

export function BusinessTypesSection() {
	const sectionRef = useRef(null)
	const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

	const businessTypes = [
		{
			tag: "Financial Services",
			title: "Fintech",
			description:
				"User wallets and payment processing funds earn yield during settlement periods. Optimize treasury management with automated yield generation.",
			icon: CreditCard,
			secondaryIcon: TrendingUp,
			bgGradient: "from-gray-100 to-gray-50",
			accentColor: "gray",
			tagBg: "bg-gray-100",
			tagText: "text-gray-700",
		},
		{
			tag: "Workforce Solutions",
			title: "Freelance Platforms",
			description:
				"Project escrow and milestone payments earn yield until release. Freelancer earnings accumulate returns while waiting for withdrawal.",
			icon: Briefcase,
			secondaryIcon: Coins,
			bgGradient: "from-orange-100 to-orange-50",
			accentColor: "orange",
			tagBg: "bg-orange-100",
			tagText: "text-orange-700",
		},
		{
			tag: "Creative Economy",
			title: "Creator Platforms",
			description:
				"Creator revenue earns yield until withdrawal. Boost creator retention by offering competitive returns on their earnings.",
			icon: Palette,
			secondaryIcon: Wallet,
			bgGradient: "from-blue-100 to-blue-50",
			accentColor: "blue",
			tagBg: "bg-blue-100",
			tagText: "text-blue-700",
		},
		{
			tag: "Mobility & Logistics",
			title: "Gig Worker Platforms",
			description:
				"Escrow funds and driver earnings earn yield until payout. Better than 0% checking accounts, creating a competitive advantage.",
			icon: Car,
			secondaryIcon: PiggyBank,
			bgGradient: "from-gray-100 to-gray-50",
			accentColor: "gray",
			tagBg: "bg-gray-100",
			tagText: "text-gray-700",
		},
		{
			tag: "Retail & Commerce",
			title: "E-commerce",
			description:
				"Enable merchants to earn yield on idle balances. Seller pending payouts and treasury funds generate returns while waiting for settlement.",
			icon: ShoppingBag,
			secondaryIcon: Store,
			bgGradient: "from-orange-100 to-orange-50",
			accentColor: "orange",
			tagBg: "bg-orange-100",
			tagText: "text-orange-700",
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

		const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
		if (!firstCard) return

		const cardWidth = firstCard.offsetWidth
		const gap = 24
		const oneSetWidth = businessTypes.length * (cardWidth + gap) - gap

		scroller.scrollLeft = oneSetWidth

		const handleScroll = () => {
			if (!scroller || isHoveringRef.current) return

			if (scroller.scrollLeft >= oneSetWidth * 2 - 10) {
				scroller.scrollLeft = oneSetWidth
			} else if (scroller.scrollLeft <= 10) {
				scroller.scrollLeft = oneSetWidth
			}
		}

		scroller.addEventListener("scroll", handleScroll)
		return () => scroller.removeEventListener("scroll", handleScroll)
	}, [businessTypes.length])

	useEffect(() => {
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

			const step = (firstCard.offsetWidth ?? 400) + 24
			scroller.scrollBy({
				left: step,
				behavior: "smooth",
			})
		}, 3000)

		return () => {
			if (autoScrollIntervalRef.current) {
				clearInterval(autoScrollIntervalRef.current)
				autoScrollIntervalRef.current = null
			}
		}
	}, [shouldAutoScroll])

	const handleCardHover = (cardElement: HTMLElement) => {
		isHoveringRef.current = true
		setIsHovering(true)
		setShouldAutoScroll(false)

		if (autoScrollIntervalRef.current) {
			clearInterval(autoScrollIntervalRef.current)
			autoScrollIntervalRef.current = null
		}

		const scroller = scrollerRef.current
		if (!scroller) return

		const cardRect = cardElement.getBoundingClientRect()
		const scrollerRect = scroller.getBoundingClientRect()
		const cardCenter = cardRect.left + cardRect.width / 2
		const scrollerCenter = scrollerRect.left + scrollerRect.width / 2

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
		setTimeout(() => {
			setShouldAutoScroll(true)
		}, 500)
	}

	const scrollByCard = (direction: "left" | "right") => {
		const scroller = scrollerRef.current
		if (!scroller) return

		const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
		const step = (firstCard?.offsetWidth ?? 320) + 24

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
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
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
				ease: [0.22, 1, 0.36, 1] as const,
			},
		}),
	}

	// Decorative illustration component
	const CardIllustration = ({
		icon: Icon,
		secondaryIcon: SecondaryIcon,
		accentColor,
	}: {
		icon: React.ElementType
		secondaryIcon: React.ElementType
		accentColor: string
	}) => {
		const colorMap: Record<string, { primary: string; secondary: string; tertiary: string; bg: string }> = {
			gray: {
				primary: "from-gray-600 to-gray-700",
				secondary: "bg-gray-200",
				tertiary: "bg-gray-300",
				bg: "from-gray-100/80 to-gray-50/50",
			},
			orange: {
				primary: "from-orange-400 to-orange-500",
				secondary: "bg-orange-200",
				tertiary: "bg-orange-300",
				bg: "from-orange-100/80 to-orange-50/50",
			},
			blue: {
				primary: "from-blue-400 to-blue-500",
				secondary: "bg-blue-200",
				tertiary: "bg-blue-300",
				bg: "from-blue-100/80 to-blue-50/50",
			},
		}

		const colors = colorMap[accentColor] || colorMap.gray

		return (
			<div className={`relative w-full h-48 rounded-2xl bg-gradient-to-br ${colors.bg} overflow-hidden`}>
				{/* Decorative shapes */}
				<motion.div
					className={`absolute top-4 right-4 w-16 h-16 ${colors.secondary} rounded-full opacity-60`}
					animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
					transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className={`absolute bottom-8 left-8 w-10 h-10 ${colors.tertiary} rounded-lg opacity-50 rotate-12`}
					animate={{ rotate: [12, 20, 12], y: [0, -3, 0] }}
					transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
				/>
				<motion.div
					className={`absolute top-12 left-6 w-6 h-6 ${colors.secondary} rounded-full opacity-40`}
					animate={{ scale: [1, 1.2, 1] }}
					transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
				/>

				{/* Main icon container */}
				<motion.div
					className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br ${colors.primary} rounded-2xl shadow-lg flex items-center justify-center`}
					whileHover={{ scale: 1.1, rotate: 5 }}
					transition={{ type: "spring" as const, stiffness: 300 }}
				>
					<Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
				</motion.div>

				{/* Secondary floating icon */}
				<motion.div
					className="absolute bottom-4 right-6 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center"
					animate={{ y: [0, -4, 0] }}
					transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
				>
					<SecondaryIcon className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
				</motion.div>

				{/* Decorative coins/elements */}
				<motion.div
					className={`absolute top-6 right-20 w-8 h-8 bg-gradient-to-br ${colors.primary} rounded-full shadow-sm opacity-80`}
					animate={{ y: [0, -6, 0], x: [0, 2, 0] }}
					transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
				/>
			</div>
		)
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
					<motion.h2 className="text-5xl font-bold text-gray-950 mb-6" variants={titleVariants}>
						Support Any Platform
					</motion.h2>
					<motion.p className="text-xl text-gray-700 max-w-3xl mx-auto" variants={titleVariants}>
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
							const originalIdx = idx % businessTypes.length

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
											type: "spring" as const,
											stiffness: 300,
											damping: 20,
										},
									}}
									className={`snap-center flex-shrink-0 w-[380px] sm:w-[420px] lg:w-[460px] bg-gradient-to-br ${type.bgGradient} rounded-3xl overflow-hidden border border-white/50 cursor-pointer`}
									onMouseEnter={(e) => handleCardHover(e.currentTarget)}
									onMouseLeave={handleCardLeave}
								>
									{/* Illustration Area */}
									<div className="p-6 pb-0">
										<CardIllustration
											icon={type.icon}
											secondaryIcon={type.secondaryIcon}
											accentColor={type.accentColor}
										/>
									</div>

									{/* Content Area */}
									<div className="p-6 pt-5">
										{/* Tag */}
										<motion.span
											className={`inline-block px-3 py-1 ${type.tagBg} ${type.tagText} text-sm font-medium rounded-full mb-3`}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
											transition={{ delay: originalIdx * 0.1 + 0.3 }}
										>
											• {type.tag}
										</motion.span>

										{/* Title */}
										<h3 className="text-2xl font-bold text-gray-950 mb-3">{type.title}</h3>

										{/* Description */}
										<p className="text-gray-600 text-base leading-relaxed line-clamp-3">{type.description}</p>
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
