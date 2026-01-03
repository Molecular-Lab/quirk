import { motion, useInView, useScroll, useTransform, type Variants } from "framer-motion"
import { useRef, type ReactNode } from "react"

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
	}
}

export const fadeInDown: Variants = {
	hidden: { opacity: 0, y: -30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
	}
}

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.5, ease: "easeOut" }
	}
}

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
	}
}

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -50 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
	}
}

export const slideInRight: Variants = {
	hidden: { opacity: 0, x: 50 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
	}
}

// Staggered container for children
export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1
		}
	}
}

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

interface AnimatedSectionProps {
	children: ReactNode
	className?: string
	delay?: number
	threshold?: number
	once?: boolean
}

/**
 * AnimatedSection - Wraps content with scroll-triggered fade-in-up animation
 */
export function AnimatedSection({
	children,
	className = "",
	delay = 0,
	threshold = 0.2,
	once = true
}: AnimatedSectionProps) {
	const ref = useRef(null)
	const isInView = useInView(ref, { once, amount: threshold })

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={fadeInUp}
			transition={{ delay }}
			className={className}
		>
			{children}
		</motion.div>
	)
}

interface StaggeredContainerProps {
	children: ReactNode
	className?: string
	staggerDelay?: number
	threshold?: number
	once?: boolean
}

/**
 * StaggeredContainer - Container that staggers the animation of its children
 */
export function StaggeredContainer({
	children,
	className = "",
	staggerDelay = 0.1,
	threshold = 0.2,
	once = true
}: StaggeredContainerProps) {
	const ref = useRef(null)
	const isInView = useInView(ref, { once, amount: threshold })

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: staggerDelay,
						delayChildren: 0.1
					}
				}
			}}
			className={className}
		>
			{children}
		</motion.div>
	)
}

interface StaggeredItemProps {
	children: ReactNode
	className?: string
}

/**
 * StaggeredItem - Child of StaggeredContainer with fade-in-up animation
 */
export function StaggeredItem({ children, className = "" }: StaggeredItemProps) {
	return (
		<motion.div variants={fadeInUp} className={className}>
			{children}
		</motion.div>
	)
}

interface TextRevealProps {
	text: string
	className?: string
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
	delay?: number
	staggerDelay?: number
	threshold?: number
	once?: boolean
}

/**
 * TextReveal - Animates text word by word
 */
export function TextReveal({
	text,
	className = "",
	as: Component = "p",
	delay = 0,
	staggerDelay = 0.05,
	threshold = 0.3,
	once = true
}: TextRevealProps) {
	const ref = useRef(null)
	const isInView = useInView(ref, { once, amount: threshold })
	const words = text.split(" ")

	const container: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: staggerDelay,
				delayChildren: delay
			}
		}
	}

	const wordVariant: Variants = {
		hidden: {
			opacity: 0,
			y: 20,
			filter: "blur(4px)"
		},
		visible: {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: {
				duration: 0.4,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={container}
			className={className}
			aria-label={text}
		>
			<Component className={className}>
				{words.map((word, index) => (
					<motion.span
						key={index}
						variants={wordVariant}
						className="inline-block mr-[0.25em]"
					>
						{word}
					</motion.span>
				))}
			</Component>
		</motion.div>
	)
}

interface CharacterRevealProps {
	text: string
	className?: string
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
	delay?: number
	staggerDelay?: number
	threshold?: number
	once?: boolean
}

/**
 * CharacterReveal - Animates text character by character
 */
export function CharacterReveal({
	text,
	className = "",
	as: Component = "p",
	delay = 0,
	staggerDelay = 0.02,
	threshold = 0.3,
	once = true
}: CharacterRevealProps) {
	const ref = useRef(null)
	const isInView = useInView(ref, { once, amount: threshold })
	const characters = text.split("")

	const container: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: staggerDelay,
				delayChildren: delay
			}
		}
	}

	const charVariant: Variants = {
		hidden: {
			opacity: 0,
			y: 10
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
				ease: "easeOut"
			}
		}
	}

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={container}
			aria-label={text}
		>
			<Component className={className}>
				{characters.map((char, index) => (
					<motion.span
						key={index}
						variants={charVariant}
						className="inline-block"
						style={{ whiteSpace: char === " " ? "pre" : "normal" }}
					>
						{char}
					</motion.span>
				))}
			</Component>
		</motion.div>
	)
}

interface FloatingElementProps {
	children: ReactNode
	className?: string
	duration?: number
	distance?: number
	delay?: number
}

/**
 * FloatingElement - Creates a floating/bobbing animation effect
 */
export function FloatingElement({
	children,
	className = "",
	duration = 4,
	distance = 10,
	delay = 0
}: FloatingElementProps) {
	return (
		<motion.div
			className={className}
			animate={{
				y: [-distance, distance, -distance],
			}}
			transition={{
				duration,
				repeat: Infinity,
				repeatType: "loop",
				ease: "easeInOut",
				delay
			}}
		>
			{children}
		</motion.div>
	)
}

interface ParallaxProps {
	children: ReactNode
	className?: string
	speed?: number // 0.5 = half speed, 2 = double speed
	direction?: "up" | "down"
}

/**
 * Parallax - Creates a parallax scroll effect
 */
export function Parallax({
	children,
	className = "",
	speed = 0.5,
	direction = "up"
}: ParallaxProps) {
	const ref = useRef(null)
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	})

	const multiplier = direction === "up" ? -1 : 1
	const y = useTransform(scrollYProgress, [0, 1], [0, 200 * speed * multiplier])

	return (
		<motion.div ref={ref} style={{ y }} className={className}>
			{children}
		</motion.div>
	)
}

interface ScaleOnScrollProps {
	children: ReactNode
	className?: string
}

/**
 * ScaleOnScroll - Scales element based on scroll position
 */
export function ScaleOnScroll({ children, className = "" }: ScaleOnScrollProps) {
	const ref = useRef(null)
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center center"]
	})

	const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
	const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

	return (
		<motion.div ref={ref} style={{ scale, opacity }} className={className}>
			{children}
		</motion.div>
	)
}

interface AnimatedButtonProps {
	children: ReactNode
	className?: string
	onClick?: () => void
	href?: string
	target?: string
	rel?: string
}

/**
 * AnimatedButton - Button with hover and tap animations
 */
export function AnimatedButton({
	children,
	className = "",
	onClick,
	href,
	target,
	rel
}: AnimatedButtonProps) {
	const buttonMotionProps = {
		whileHover: {
			scale: 1.02,
			boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)"
		},
		whileTap: { scale: 0.98 },
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 17
		}
	}

	if (href) {
		return (
			<motion.a
				href={href}
				target={target}
				rel={rel}
				className={className}
				{...buttonMotionProps}
			>
				{children}
			</motion.a>
		)
	}

	return (
		<motion.button
			onClick={onClick}
			className={className}
			{...buttonMotionProps}
		>
			{children}
		</motion.button>
	)
}

interface AnimatedCardProps {
	children: ReactNode
	className?: string
	hoverScale?: number
	onClick?: () => void
}

/**
 * AnimatedCard - Card with smooth hover effects
 */
export function AnimatedCard({
	children,
	className = "",
	hoverScale = 1.02,
	onClick
}: AnimatedCardProps) {
	return (
		<motion.div
			className={className}
			whileHover={{
				scale: hoverScale,
				y: -5,
				boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
			}}
			whileTap={{ scale: 0.98 }}
			transition={{
				type: "spring",
				stiffness: 300,
				damping: 20
			}}
			onClick={onClick}
		>
			{children}
		</motion.div>
	)
}

interface CountUpProps {
	value: number
	suffix?: string
	prefix?: string
	decimals?: number
	duration?: number
	delay?: number
	className?: string
	threshold?: number
	once?: boolean
}

/**
 * CountUp - Animated number counter using framer-motion
 */
export function CountUp({
	value,
	suffix = "",
	prefix = "",
	decimals = 0,
	duration = 2,
	delay = 0,
	className = "",
	threshold = 0.3,
	once = true
}: CountUpProps) {
	const ref = useRef(null)
	const isInView = useInView(ref, { once, amount: threshold })

	return (
		<motion.span
			ref={ref}
			className={className}
			initial={{ opacity: 0 }}
			animate={isInView ? { opacity: 1 } : { opacity: 0 }}
		>
			{prefix}
			<motion.span
				initial={{ opacity: 0 }}
				animate={isInView ? { opacity: 1 } : { opacity: 0 }}
				transition={{ delay }}
			>
				{isInView && (
					<CountNumber
						value={value}
						decimals={decimals}
						duration={duration}
						delay={delay}
					/>
				)}
			</motion.span>
			{suffix}
		</motion.span>
	)
}

function CountNumber({
	value,
	decimals,
	duration,
	delay
}: {
	value: number
	decimals: number
	duration: number
	delay: number
}) {
	const ref = useRef<HTMLSpanElement>(null)

	return (
		<motion.span
			ref={ref}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay }}
		>
			<motion.span
				initial={{ opacity: 1 }}
				animate={{ opacity: 1 }}
			>
				<AnimatedDigits value={value} decimals={decimals} duration={duration} />
			</motion.span>
		</motion.span>
	)
}

function AnimatedDigits({
	value,
	decimals,
	duration
}: {
	value: number
	decimals: number
	duration: number
}) {
	const [displayValue, setDisplayValue] = useState(0)

	useEffect(() => {
		let startTime: number
		let animationFrame: number

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp
			const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

			// Easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)
			setDisplayValue(value * easeOutQuart)

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate)
			}
		}

		animationFrame = requestAnimationFrame(animate)

		return () => cancelAnimationFrame(animationFrame)
	}, [value, duration])

	const formatValue = (val: number) => {
		if (decimals === 0) {
			return Math.round(val).toLocaleString()
		}
		return val.toLocaleString(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		})
	}

	return <>{formatValue(displayValue)}</>
}

// Re-import useState and useEffect that are needed
import { useState, useEffect } from "react"
