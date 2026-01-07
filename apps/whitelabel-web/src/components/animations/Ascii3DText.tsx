import { useRef, useEffect } from "react"

interface Ascii3DTextProps {
	text?: string
	className?: string
}

export function Ascii3DText({ text = "QUIRK", className }: Ascii3DTextProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>()
	const rotationRef = useRef({ x: 0, y: 0 })

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		// ASCII characters for different brightness levels
		const chars = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."]

		const animate = () => {
			const rect = canvas.getBoundingClientRect()
			const dpr = window.devicePixelRatio || 1
			canvas.width = rect.width * dpr
			canvas.height = rect.height * dpr
			ctx.scale(dpr, dpr)

			const width = rect.width
			const height = rect.height

			// Clear canvas
			ctx.clearRect(0, 0, width, height)

			// Rotate slowly for 3D effect
			rotationRef.current.y += 0.005
			rotationRef.current.x = Math.sin(Date.now() * 0.001) * 0.2

			// 3D ASCII text rendering
			const fontSize = Math.min(width / 6, 120)
			const spacing = fontSize * 0.15

			// Draw the text with 3D ASCII effect
			const textWidth = text.length * fontSize * 0.6
			const startX = (width - textWidth) / 2

			for (let i = 0; i < text.length; i++) {
				const char = text[i]
				const x = startX + i * fontSize * 0.7
				const y = height / 2

				// Create 3D depth effect with multiple layers
				for (let depth = 8; depth >= 0; depth--) {
					const offsetX = Math.cos(rotationRef.current.y) * depth * 3
					const offsetY = Math.sin(rotationRef.current.x) * depth * 2

					// Brightness based on depth (further = darker)
					const brightness = 1 - depth * 0.08
					const charIndex = Math.floor((1 - brightness) * (chars.length - 1))
					const asciiChar = chars[Math.min(charIndex, chars.length - 1)]

					// Purple gradient
					const purple = Math.floor(139 + brightness * 80) // 139-219
					const alpha = 0.3 + brightness * 0.7

					ctx.fillStyle = `rgba(${purple}, 92, 200, ${alpha})`
					ctx.font = `bold ${fontSize}px monospace`
					ctx.textAlign = "center"
					ctx.textBaseline = "middle"

					// Draw ASCII pattern to form the letter
					if (depth === 0) {
						// Front layer: solid character
						ctx.fillText(char, x + offsetX, y + offsetY)
					} else {
						// Depth layers: ASCII pattern
						ctx.fillText(asciiChar, x + offsetX, y + offsetY)
					}
				}
			}

			animationRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [text])

	return <canvas ref={canvasRef} className={`w-full h-full ${className || ""}`} style={{ background: "transparent" }} />
}

export default Ascii3DText
