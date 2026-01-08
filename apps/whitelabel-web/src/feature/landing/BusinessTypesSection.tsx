import React, { useRef } from "react"

import { motion, useInView } from "framer-motion"
import {
	Briefcase,
	Camera,
	Car,
	CreditCard,
	DollarSign,
	Laptop,
	Palette,
	PiggyBank,
	ShoppingBag,
	Store,
} from "lucide-react"

import { useResponsive } from "@/hooks"

export function BusinessTypesSection() {
	const sectionRef = useRef(null)
	const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
	const [activeIndex, setActiveIndex] = React.useState(0)

	const businessTypes = [
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
		{
			tag: "Mobility & Logistics",
			title: "Gig Worker Platforms",
			description:
				"Escrow funds and driver earnings earn yield until payout. Better than 0% checking accounts, creating a competitive advantage.",
			icon: Car,
			secondaryIcon: DollarSign,
			bgGradient: "from-green-100 to-green-50",
			accentColor: "green",
			tagBg: "bg-green-100",
			tagText: "text-green-700",
		},
		{
			tag: "Creative Economy",
			title: "Creator Platforms",
			description:
				"Creator revenue earns yield until withdrawal. Boost creator retention by offering competitive returns on their earnings.",
			icon: Palette,
			secondaryIcon: Camera,
			bgGradient: "from-red-100 to-red-50",
			accentColor: "red",
			tagBg: "bg-red-100",
			tagText: "text-red-700",
		},
		{
			tag: "Workforce Solutions",
			title: "Freelance Platforms",
			description:
				"Project escrow and milestone payments earn yield until release. Freelancer earnings accumulate returns while waiting for withdrawal.",
			icon: Briefcase,
			secondaryIcon: Laptop,
			bgGradient: "from-blue-100 to-blue-50",
			accentColor: "blue",
			tagBg: "bg-blue-100",
			tagText: "text-blue-700",
		},
		{
			tag: "Financial Services",
			title: "Fintech",
			description:
				"User wallets and payment processing funds earn yield during settlement periods. Optimize treasury management with automated yield generation.",
			icon: CreditCard,
			secondaryIcon: PiggyBank,
			bgGradient: "from-purple-100 to-purple-50",
			accentColor: "purple",
			tagBg: "bg-purple-100",
			tagText: "text-purple-700",
		},
	]

	const scrollerRef = useRef<HTMLDivElement>(null)

	const scrollByCard = (direction: "left" | "right") => {
		const scroller = scrollerRef.current
		if (!scroller) return

		const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
		const step = (firstCard?.offsetWidth ?? 320) + 24

		scroller.scrollBy({
			left: direction === "left" ? -step : step,
			behavior: "smooth",
		})

		// Update active index
		const newIndex =
			direction === "left" ? Math.max(0, activeIndex - 1) : Math.min(businessTypes.length - 1, activeIndex + 1)
		setActiveIndex(newIndex)
	}

	// Track scroll position to update active indicator
	React.useEffect(() => {
		const scroller = scrollerRef.current
		if (!scroller) return

		const handleScroll = () => {
			const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
			if (!firstCard) return

			const cardWidth = firstCard.offsetWidth + 24 // card width + gap
			const scrollLeft = scroller.scrollLeft
			const index = Math.round(scrollLeft / cardWidth)
			setActiveIndex(Math.min(Math.max(0, index), businessTypes.length - 1))
		}

		scroller.addEventListener("scroll", handleScroll)
		return () => {
			scroller.removeEventListener("scroll", handleScroll)
		}
	}, [businessTypes.length])

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
		const { isMd } = useResponsive()
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
			green: {
				primary: "from-green-400 to-green-500",
				secondary: "bg-green-200",
				tertiary: "bg-green-300",
				bg: "from-green-100/80 to-green-50/50",
			},
			red: {
				primary: "from-red-400 to-red-500",
				secondary: "bg-red-200",
				tertiary: "bg-red-300",
				bg: "from-red-100/80 to-red-50/50",
			},
			purple: {
				primary: "from-purple-400 to-purple-500",
				secondary: "bg-purple-200",
				tertiary: "bg-purple-300",
				bg: "from-purple-100/80 to-purple-50/50",
			},
		}

		const colors = colorMap[accentColor] || colorMap.gray

		return (
			<div
				className={`relative w-full ${!isMd ? "h-36" : "h-48"} rounded-2xl bg-gradient-to-br ${colors.bg} overflow-hidden`}
			>
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
		<section className="py-24 bg-claude-bg-50 overflow-hidden">
			<motion.div
				ref={sectionRef}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-none w-full mx-auto px-6 sm:px-10 lg:px-16"
			>
				{/* Section Header */}
				<motion.div className="mb-12 text-center" variants={titleVariants}>
					<motion.h2 className="text-2xl lg:text-4xl text-gray-950 mb-3" variants={titleVariants}>
						Support Any Platform
					</motion.h2>
					<motion.p className="text-base lg:text-lg text-gray-700 max-w-3xl mx-auto" variants={titleVariants}>
						From fintech to creators, scale with Quirk's infrastructure.
					</motion.p>
				</motion.div>

				{/* Cards Slider */}
				<div className="relative">
					<motion.div
						className="hidden md:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-claude-bg-50 to-transparent pointer-events-none z-10"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : { opacity: 0 }}
						transition={{ delay: 0.5 }}
					/>
					<motion.div
						className="hidden md:block absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-claude-bg-50 to-transparent pointer-events-none z-10"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : { opacity: 0 }}
						transition={{ delay: 0.5 }}
					/>

					<div
						ref={scrollerRef}
						className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2 sm:px-4 snap-x snap-mandatory"
					>
						{businessTypes.map((type, idx) => (
							<motion.div
								key={idx}
								data-business-card
								custom={idx}
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
								className={`snap-center flex-shrink-0 w-full md:w-[420px] lg:w-[460px] bg-gradient-to-br ${type.bgGradient} rounded-3xl overflow-hidden border border-white/50 cursor-pointer`}
							>
								{/* Illustration Area */}
								<div className="p-4 md:p-6 pb-0">
									<CardIllustration
										icon={type.icon}
										secondaryIcon={type.secondaryIcon}
										accentColor={type.accentColor}
									/>
								</div>

								{/* Content Area */}
								<div className="p-4 md:p-6 pt-4 md:pt-5">
									{/* Tag */}
									<motion.span
										className={`inline-block px-2.5 py-1 ${type.tagBg} ${type.tagText} text-xs md:text-sm font-medium rounded-full mb-2 md:mb-3`}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
										transition={{ delay: idx * 0.1 + 0.3 }}
									>
										• {type.tag}
									</motion.span>

									{/* Title */}
									<h3 className="text-xl md:text-2xl font-bold text-gray-950 mb-2 md:mb-3">{type.title}</h3>

									{/* Description */}
									<p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
										{type.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>

					<div className="pointer-events-none absolute inset-y-0 flex items-center justify-between w-full">
						<motion.button
							type="button"
							onClick={() => {
								scrollByCard("left")
							}}
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
							onClick={() => {
								scrollByCard("right")
							}}
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

					{/* Sliding indicators (visible on mobile) */}
					<motion.div
						className="flex justify-center gap-2 mt-6 md:hidden"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : { opacity: 0 }}
						transition={{ delay: 0.7 }}
					>
						{businessTypes.map((_, idx) => (
							<motion.button
								key={idx}
								onClick={() => {
									const scroller = scrollerRef.current
									if (!scroller) return
									const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
									const cardWidth = (firstCard?.offsetWidth ?? 320) + 24
									scroller.scrollTo({
										left: idx * cardWidth,
										behavior: "smooth",
									})
									setActiveIndex(idx)
								}}
								className={`h-2 rounded-full transition-all duration-300 ${
									idx === activeIndex ? "w-8 bg-gray-800" : "w-2 bg-gray-300"
								}`}
								whileTap={{ scale: 0.9 }}
								aria-label={`Go to slide ${idx + 1}`}
							/>
						))}
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
