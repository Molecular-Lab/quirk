import React, { useEffect, useRef, useState } from "react"

import { motion } from "framer-motion"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

interface AnimateChangeInHeightProps extends PropsWithClassName {
	children: React.ReactNode
	motionClassName?: string
}

export const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
	children,
	className,
	motionClassName,
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [height, setHeight] = useState<number | "auto">("auto")
	const lastChange = useRef<number>(0)

	const [disableAnimation, setDisableAnimation] = useState(false)

	useEffect(() => {
		if (containerRef.current) {
			const resizeObserver = new ResizeObserver((entries) => {
				// We only have one entry, so we can use entries[0].
				const observedHeight = entries[0]?.contentRect.height
				setHeight(observedHeight!)

				// if there is a consecutive change in height within 20ms, disable the animation
				if (Date.now() - lastChange.current < 20) {
					setDisableAnimation(true)
				} else {
					setDisableAnimation(false)
				}

				lastChange.current = Date.now()
			})

			resizeObserver.observe(containerRef.current)

			return () => {
				// Cleanup the observer when the component is unmounted
				resizeObserver.disconnect()
			}
		}
		return
	}, [])

	return (
		<motion.div
			style={{ height }}
			animate={{ height }}
			transition={{ duration: disableAnimation ? 0 : 0.2, ease: "linear" }}
			className={cn("overflow-hidden", motionClassName)}
		>
			<div ref={containerRef} className={className}>
				{children}
			</div>
		</motion.div>
	)
}
