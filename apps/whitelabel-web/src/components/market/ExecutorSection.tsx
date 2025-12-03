/**
 * ExecutorSection - Protocol selection and deployment UI
 * Positioned below AI chat in the left column
 */

import { useState } from "react"

import type { ProtocolData } from "../../hooks/useDeFiProtocols"

interface ExecutorSectionProps {
	protocols: ProtocolData[]
	onDeploy?: (selectedProtocols: string[]) => void
}

export function ExecutorSection({ protocols, onDeploy }: ExecutorSectionProps) {
	const [selectedProtocols, setSelectedProtocols] = useState<string[]>([])

	const toggleProtocol = (protocol: string) => {
		setSelectedProtocols((prev) => (prev.includes(protocol) ? prev.filter((p) => p !== protocol) : [...prev, protocol]))
	}

	const handleDeploy = () => {
		if (selectedProtocols.length > 0 && onDeploy) {
			onDeploy(selectedProtocols)
		}
	}

	return (
		<div className="bg-[#25262b] rounded-2xl border border-gray-800 p-4">
			<div className="mb-4">
				<h3 className="text-lg font-bold text-white mb-1">Executor</h3>
				<p className="text-xs text-gray-400">Select protocols to deploy funds</p>
			</div>

			{/* Protocol Selection */}
			<div className="space-y-2 mb-4">
				{protocols.length === 0 ? (
					<div className="text-center py-4 text-gray-500 text-sm">Loading protocols...</div>
				) : (
					protocols.map((protocol) => {
						const protocolName =
							protocol.protocol === "aave" ? "Aave V3" : protocol.protocol === "compound" ? "Compound V3" : "Morpho"

						const isSelected = selectedProtocols.includes(protocol.protocol)

						return (
							<label
								key={protocol.protocol}
								className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
									isSelected
										? "bg-blue-900/20 border border-blue-600"
										: "bg-[#1a1b1e] border border-gray-800 hover:bg-[#2c2d33] hover:border-gray-600"
								}`}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => {
										toggleProtocol(protocol.protocol)
									}}
									className="w-4 h-4 accent-blue-500"
								/>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">{protocolName}</span>
										<span className="text-green-400 font-bold text-sm">
											{parseFloat(protocol.supplyAPY).toFixed(2)}%
										</span>
									</div>
									<div className="flex items-center gap-2 mt-0.5">
										<span className="text-xs text-gray-500">{protocol.token}</span>
										<span className="text-xs text-gray-600">•</span>
										<span
											className={`text-xs ${
												protocol.status === "healthy"
													? "text-green-400"
													: protocol.status === "warning"
														? "text-yellow-400"
														: "text-red-400"
											}`}
										>
											{protocol.status}
										</span>
									</div>
								</div>
							</label>
						)
					})
				)}
			</div>

			{/* Deploy Button */}
			<button
				onClick={handleDeploy}
				disabled={selectedProtocols.length === 0}
				className={`w-full py-3 rounded-lg font-semibold transition-all ${
					selectedProtocols.length > 0
						? "bg-blue-600 hover:bg-blue-700 text-white"
						: "bg-gray-800 text-gray-500 cursor-not-allowed"
				}`}
			>
				{selectedProtocols.length > 0
					? `Deploy to ${selectedProtocols.length} Protocol${selectedProtocols.length > 1 ? "s" : ""}`
					: "Select Protocols"}
			</button>

			{/* Selection Summary */}
			{selectedProtocols.length > 0 && (
				<div className="mt-3 p-3 bg-[#1a1b1e] rounded-lg border border-gray-800">
					<p className="text-xs text-gray-400 mb-2">Selected:</p>
					<div className="flex flex-wrap gap-2">
						{selectedProtocols.map((p) => {
							const protocolData = protocols.find((protocol) => protocol.protocol === p)
							if (!protocolData) return null

							return (
								<span
									key={p}
									className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1"
								>
									{p === "aave" ? "Aave" : p === "compound" ? "Compound" : "Morpho"}
									<button
										onClick={() => {
											toggleProtocol(p)
										}}
										className="hover:text-blue-300 transition-colors"
									>
										×
									</button>
								</span>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
