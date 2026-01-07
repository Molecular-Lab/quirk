import { useEffect, useRef, useState } from "react"

interface UseScrollAnimationOptions {
	threshold?: number
	rootMargin?: string
	/** Only trigger animation once (default: true) */
	once?: boolean
}

/**
 * Hook to detect when an element scrolls into view.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
	const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", once = true } = options
	const ref = useRef<HTMLElement>(null)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const element = ref.current
		if (!element) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true)
					if (once) {
						observer.unobserve(element)
					}
				} else if (!once) {
					setIsVisible(false)
				}
			},
			{ threshold, rootMargin },
		)

		observer.observe(element)

		return () => {
			observer.disconnect()
		}
	}, [threshold, rootMargin, once])

	return { ref, isVisible }
}

/**
 * CSS class generator for fade-in-up animation
 */
export function getAnimationClasses(isVisible: boolean, delay: number = 0): string {
	const baseClasses = "transition-all duration-700 ease-out"
	const delayClass = delay > 0 ? `delay-[${delay}ms]` : ""

	if (isVisible) {
		return `${baseClasses} ${delayClass} opacity-100 translate-y-0`
	}
	return `${baseClasses} ${delayClass} opacity-0 translate-y-8`
}
