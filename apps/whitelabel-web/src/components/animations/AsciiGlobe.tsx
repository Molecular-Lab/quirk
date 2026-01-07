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
				<bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
			</bufferGeometry>
			<pointsMaterial color={color} size={0.08} transparent opacity={0.8} sizeAttenuation />
		</points>
	)
}

// Main exported component - Three.js version
export function AsciiGlobe({ className }: { className?: string }) {
	return (
		<div className={`w-full h-full ${className || ""}`}>
			<Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: "transparent" }}>
				<ambientLight intensity={0.5} />
				<GlobePoints count={3000} radius={2} color="#22c55e" />
			</Canvas>
		</div>
	)
}

// Canvas 2D version - more authentic ASCII look like ZeroHash
// INCREASED WIDTH SCALING
export function AsciiGlobe2D({ className }: { className?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const angleYRef = useRef(0) // Y-axis rotation for continuous spinning
	const particlesRef = useRef<Array<{ x: number; y: number; z: number; char: string; speed: number }>>([])
	const animationRef = useRef<number>()

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const chars = ["#", "#", "*", "O", "0", "+", "·", "."]

		// Initialize particles for infinite falling
		const initParticles = (radius: number, count: number = 2000) => {
			const particles = []
			const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle

			for (let i = 0; i < count; i++) {
				const y = 1 - (i / (count - 1)) * 2
				const radiusAtY = Math.sqrt(1 - y * y)
				const theta = phi * i

				const x = Math.cos(theta) * radiusAtY
				const z = Math.sin(theta) * radiusAtY

				particles.push({
					x: x * radius,
					y: y * radius,
					z: z * radius,
					char: chars[Math.floor(Math.random() * chars.length)],
					speed: 0.3 + Math.random() * 0.3, // Random speed for each particle
				})
			}
			return particles
		}

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
			// Reduced size: Use 35% of screen width for radius
			const radius = width * 0.35

			// Initialize particles if not yet created or if canvas size changed
			if (particlesRef.current.length === 0) {
				particlesRef.current = initParticles(radius)
			}

			// Clear canvas
			ctx.clearRect(0, 0, width, height)

			// Continuous Y-axis rotation for infinite spinning (MUCH SLOWER)
			angleYRef.current += 0.0008 // Slow, gentle rotation

			// Update and draw particles with infinite falling
			particlesRef.current.forEach((particle) => {
				// Move particle down (falling effect)
				particle.y -= particle.speed

				// Reset to top when particle falls below the sphere (infinite loop)
				if (particle.y < -radius) {
					particle.y = radius
					particle.char = chars[Math.floor(Math.random() * chars.length)] // New character
				}

				// Apply Y-axis rotation for spinning
				const cosY = Math.cos(angleYRef.current)
				const sinY = Math.sin(angleYRef.current)
				const rotatedX = particle.x * cosY - particle.z * sinY
				const rotatedZ = particle.x * sinY + particle.z * cosY
				const rotatedY = particle.y

				// Only draw front-facing points
				if (rotatedZ > 0) {
					// Project 3D to 2D
					const scale = 1 + rotatedZ / (radius * 2)
					const screenX = rotatedX * scale
					const screenY = rotatedY * scale

					// Calculate brightness based on depth
					const brightness = Math.max(0, Math.min(1, (rotatedZ + radius) / (radius * 2)))

					const alpha = 0.2 + brightness * 0.8

					// Claude orange gradient based on depth
					// Base: #DE7356 (claude-orange-500)
					// Light: #EFAB95 (claude-orange-300)
					const orangeR = Math.floor(222 + brightness * 17) // 222-239
					const orangeG = Math.floor(115 + brightness * 56) // 115-171
					const orangeB = Math.floor(86 + brightness * 63) // 86-149
					ctx.fillStyle = `rgba(${orangeR}, ${orangeG}, ${orangeB}, ${alpha})`

					const fontSize = Math.max(8, 14 * scale)
					ctx.font = `${fontSize}px monospace`
					ctx.textAlign = "center"
					ctx.textBaseline = "middle"
					ctx.fillText(particle.char, centerX + screenX, centerY + screenY)
				}
			})

			animationRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [])

	return <canvas ref={canvasRef} className={`w-full h-full ${className || ""}`} style={{ background: "transparent" }} />
}

export default AsciiGlobe
