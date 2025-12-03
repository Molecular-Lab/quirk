import type { ExecutionRatio } from "../../types/registration"

interface ExecutionRatioSelectorProps {
	ratio: ExecutionRatio
	onChange: (ratio: ExecutionRatio) => void
}

const PROTOCOLS = [
	{ key: "aave" as const, name: "Aave", color: "#B6509E" },
	{ key: "uniswap" as const, name: "Uniswap", color: "#FF007A" },
	{ key: "compound" as const, name: "Compound", color: "#00D395" },
]

export default function ExecutionRatioSelector({ ratio, onChange }: ExecutionRatioSelectorProps) {
	const total = ratio.aave + ratio.uniswap + ratio.compound

	const handleSliderChange = (key: keyof ExecutionRatio, value: number) => {
		const newRatio = { ...ratio, [key]: value }
		const newTotal = newRatio.aave + newRatio.uniswap + newRatio.compound

		// Normalize to 100%
		if (newTotal > 0) {
			const scale = 100 / newTotal
			newRatio.aave = Math.round(newRatio.aave * scale)
			newRatio.uniswap = Math.round(newRatio.uniswap * scale)
			newRatio.compound = Math.round(newRatio.compound * scale)

			// Fix rounding errors
			const finalTotal = newRatio.aave + newRatio.uniswap + newRatio.compound
			if (finalTotal !== 100) {
				newRatio[key] += 100 - finalTotal
			}
		}

		onChange(newRatio)
	}

	const circumference = 2 * Math.PI * 100

	return (
		<div className="bg-white rounded-lg p-8 border border-gray-200">
			<h3 className="text-xl font-bold text-gray-900 mb-2">Execution Ratio Configuration</h3>
			<p className="text-gray-600 mb-8">Customize how your capital is distributed across protocols</p>

			<div className="grid md:grid-cols-2 gap-8">
				{/* Circular Graph */}
				<div className="flex items-center justify-center">
					<div className="relative w-64 h-64">
						<svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
							{/* Background circle */}
							<circle cx="120" cy="120" r="100" fill="none" stroke="#f3f4f6" strokeWidth="40" />

							{/* Protocol segments */}
							{(() => {
								let offset = 0
								return PROTOCOLS.map((protocol) => {
									const percentage = ratio[protocol.key]
									const segmentLength = (percentage / 100) * circumference
									const strokeDasharray = `${segmentLength} ${circumference}`
									const strokeDashoffset = -offset

									offset += segmentLength

									return (
										<circle
											key={protocol.key}
											cx="120"
											cy="120"
											r="100"
											fill="none"
											stroke={protocol.color}
											strokeWidth="40"
											strokeDasharray={strokeDasharray}
											strokeDashoffset={strokeDashoffset}
											className="transition-all duration-300"
										/>
									)
								})
							})()}
						</svg>

						{/* Center total */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center">
								<div className="text-4xl font-bold text-gray-900">{total}%</div>
								<div className="text-sm text-gray-500">Total</div>
							</div>
						</div>
					</div>
				</div>

				{/* Sliders */}
				<div className="space-y-6">
					{PROTOCOLS.map((protocol) => (
						<div key={protocol.key} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 rounded" style={{ backgroundColor: protocol.color }} />
									<span className="font-medium text-gray-900">{protocol.name}</span>
								</div>
								<span className="text-2xl font-bold text-gray-900">{ratio[protocol.key]}%</span>
							</div>

							<div className="relative">
								<input
									type="range"
									min="0"
									max="100"
									value={ratio[protocol.key]}
									onChange={(e) => {
										handleSliderChange(protocol.key, Number(e.target.value))
									}}
									className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
									style={{
										background: `linear-gradient(to right, ${protocol.color} 0%, ${protocol.color} ${ratio[protocol.key]}%, #e5e7eb ${ratio[protocol.key]}%, #e5e7eb 100%)`,
									}}
								/>
							</div>

							{/* Protocol info */}
							<div className="text-xs text-gray-500">
								{protocol.key === "aave" && "Stable lending protocol with proven track record"}
								{protocol.key === "uniswap" && "DEX liquidity provision with dynamic fees"}
								{protocol.key === "compound" && "Money market protocol for algorithmic interest"}
							</div>
						</div>
					))}

					{/* Validation */}
					{total !== 100 && (
						<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
							⚠️ Total must equal 100%. Currently: {total}%
						</div>
					)}

					{total === 100 && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
							✓ Portfolio allocation is balanced
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
