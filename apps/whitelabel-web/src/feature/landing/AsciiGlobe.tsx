import { useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Characters to use for the ASCII effect
const ASCII_CHARS = ["Q", "#", "*", "O", "0", "+", ".", "·"]

interface GlobePointsProps {
	count?: number
	radius?: number
	color?: string
}

function GlobePoints({ count = 2000, radius = 2, color = "#22c55e" }: GlobePointsProps) {
	const meshRef = useRef<THREE.Points>(null)

	// Generate points on a sphere using fibonacci distribution
	const positions = new Float32Array(count * 3)

	const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle

	for (let i = 0; i < count; i++) {
		const y = 1 - (i / (count - 1)) * 2
		const radiusAtY = Math.sqrt(1 - y * y)
		const theta = phi * i

		const x = Math.cos(theta) * radiusAtY
		const z = Math.sin(theta) * radiusAtY

		positions[i * 3] = x * radius
		positions[i * 3 + 1] = y * radius
		positions[i * 3 + 2] = z * radius
	}

	// Rotate the globe
	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.002
			meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
		}
	})

	return (
		<points ref={meshRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={count}
					array={positions}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				color={color}
				size={0.08}
				transparent
				opacity={0.8}
				sizeAttenuation
			/>
		</points>
	)
}

// Main exported component - Three.js version
export function AsciiGlobe({ className }: { className?: string }) {
	return (
		<div className={`w-full h-full ${className || ""}`}>
			<Canvas
				camera={{ position: [0, 0, 5], fov: 50 }}
				style={{ background: "transparent" }}
			>
				<ambientLight intensity={0.5} />
				<GlobePoints count={3000} radius={2} color="#22c55e" />
			</Canvas>
		</div>
	)
}

// Canvas 2D version - more authentic ASCII look like ZeroHash
export function AsciiGlobe2D({ className }: { className?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const angleRef = useRef(0)
	const animationRef = useRef<number>()

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const chars = ["#", "#", "*", "O", "0", "+", "·", "."]

		const animate = () => {
			const ctx = canvas.getContext("2d")
			if (!ctx) {
				animationRef.current = requestAnimationFrame(animate)
				return
			}

			// Set canvas size based on container
			const rect = canvas.getBoundingClientRect()
			const dpr = window.devicePixelRatio || 1
			canvas.width = rect.width * dpr
			canvas.height = rect.height * dpr
			ctx.scale(dpr, dpr)

			const width = rect.width
			const height = rect.height
			const centerX = width / 2
			const centerY = height / 2
			const radius = Math.min(width, height) * 0.42

			// Clear canvas
			ctx.clearRect(0, 0, width, height)

			angleRef.current += 0.003

			const spacing = Math.max(12, Math.floor(radius / 20))

			// Generate and draw sphere
			for (let screenY = -radius; screenY < radius; screenY += spacing) {
				for (let screenX = -radius; screenX < radius; screenX += spacing) {
					const distFromCenter = Math.sqrt(screenX * screenX + screenY * screenY)

					if (distFromCenter < radius * 0.95) {
						// Calculate z on sphere surface
						const zSquared = radius * radius - screenX * screenX - screenY * screenY
						if (zSquared < 0) continue
						const z = Math.sqrt(zSquared)

						// Rotate around Y axis
						const rotatedX = screenX * Math.cos(angleRef.current) - z * Math.sin(angleRef.current)
						const rotatedZ = screenX * Math.sin(angleRef.current) + z * Math.cos(angleRef.current)

						// Only draw front-facing points
						if (rotatedZ > 0) {
							const brightness = rotatedZ / radius
							const charIndex = Math.floor((1 - brightness) * (chars.length - 1))
							const char = chars[Math.min(charIndex, chars.length - 1)]

							const alpha = 0.15 + brightness * 0.85

							// Green gradient based on position
							const greenValue = Math.floor(160 + brightness * 60)
							ctx.fillStyle = `rgba(34, ${greenValue}, 94, ${alpha})`
							ctx.font = `${spacing}px monospace`
							ctx.textAlign = "center"
							ctx.textBaseline = "middle"
							ctx.fillText(char, centerX + rotatedX, centerY + screenY)
						}
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
	}, [])

	return (
		<canvas
			ref={canvasRef}
			className={`w-full h-full ${className || ""}`}
			style={{ background: "transparent" }}
		/>
	)
}

export default AsciiGlobe
