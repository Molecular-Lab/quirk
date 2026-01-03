import { useState } from "react"

import axios from "axios"

import { ENV } from "@/config/env"

import { useFloatingConcierge } from "../../contexts/FloatingConciergeContext"

interface ProtocolAllocation {
	id: string
	name: string
	allocation: number
	expectedAPY: string
}

interface ContextualAIPanelProps {
	allocations: ProtocolAllocation[]
	strategyMode: "preset" | "custom"
	strategyName?: string
	isVisible?: boolean
}

interface AIAnalysis {
	summary: string
	riskAssessment: string
	recommendations: string[]
	timestamp: Date
}

export function ContextualAIPanel({
	allocations,
	strategyMode,
	strategyName,
	isVisible = true,
}: ContextualAIPanelProps) {
	const { openWithContext } = useFloatingConcierge()
	const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [sessionId] = useState(() => `contextual-${Date.now()}`)

	const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation, 0)
	const isValid = totalAllocation === 100

	const analyzeStrategy = async () => {
		if (!isValid) {
			alert("Please ensure your allocation totals 100% before analyzing")
			return
		}

		setIsAnalyzing(true)
		setError(null)

		// Prepare strategy context for AI
		const strategyContext = {
			mode: strategyMode,
			name: strategyName || `${strategyMode === "preset" ? "Preset" : "Custom"} Strategy`,
			allocations: allocations.map((a) => ({
				protocol: a.name,
				percentage: a.allocation,
				expectedAPY: a.expectedAPY,
			})),
			totalAllocation,
		}

		const prompt = `Analyze this yield strategy:

Strategy Name: ${strategyContext.name}
Type: ${strategyContext.mode === "preset" ? "Preset Strategy" : "Custom Strategy"}

Protocol Allocations:
${strategyContext.allocations.map((a) => `- ${a.protocol}: ${a.percentage}% (APY: ${a.expectedAPY}%)`).join("\n")}

Please provide:
1. A brief summary of this strategy's characteristics
2. Risk assessment (considering protocol diversification and allocation balance)
3. 2-3 specific recommendations for improvement

Keep the response concise and actionable.`

		try {
			const response = await axios.post(`${ENV.AGENT_API_URL}/agent`, {
				message: prompt,
				session_id: sessionId,
			})

			// Parse AI response (simple text parsing for now)
			const aiResponse = response.data.response

			setAnalysis({
				summary: aiResponse,
				riskAssessment: "Analyzing...",
				recommendations: [],
				timestamp: new Date(),
			})
		} catch (err) {
			console.error("Failed to analyze strategy:", err)
			setError("Unable to connect to AI agent. Please ensure the agent server is running on localhost:8000.")
		} finally {
			setIsAnalyzing(false)
		}
	}

	const calculateBlendedAPY = () => {
		const totalAPY = allocations.reduce((sum, alloc) => {
			const apy = parseFloat(alloc.expectedAPY) || 0
			return sum + (apy * alloc.allocation) / 100
		}, 0)
		return totalAPY.toFixed(2)
	}

	if (!isVisible) return null

	return (
		<div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
						<span className="text-white text-lg">🤖</span>
					</div>
					<div>
						<h3 className="text-white font-bold text-lg">AI Strategy Advisor</h3>
						<p className="text-white/80 text-xs">Get personalized insights</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 space-y-4">
				{/* Strategy Overview */}
				<div className="bg-gray-50 rounded-xl p-4">
					<p className="text-xs font-semibold text-gray-500 mb-2">CURRENT STRATEGY</p>
					<div className="space-y-2">
						{allocations.map((alloc) => (
							<div key={alloc.id} className="flex justify-between items-center">
								<span className="text-sm text-gray-700">{alloc.name}</span>
								<span className="text-sm font-semibold text-gray-900">{alloc.allocation}%</span>
							</div>
						))}
					</div>
					<div className="mt-3 pt-3 border-t border-gray-200">
						<div className="flex justify-between items-center">
							<span className="text-sm font-semibold text-gray-700">Expected APY</span>
							<span className="text-lg font-bold text-green-600">{calculateBlendedAPY()}%</span>
						</div>
					</div>
				</div>

				{/* Analysis Section */}
				{!analysis && !error && (
					<div className="text-center py-6">
						<div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl">💡</span>
						</div>
						<p className="text-sm text-gray-600 mb-4">
							Get AI-powered insights on your strategy's risk profile, diversification, and potential improvements.
						</p>
						<button
							onClick={analyzeStrategy}
							disabled={isAnalyzing || !isValid}
							className={`w-full py-3 rounded-xl font-semibold transition-all ${
								isAnalyzing || !isValid
									? "bg-gray-200 text-gray-400 cursor-not-allowed"
									: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md"
							}`}
						>
							{isAnalyzing ? (
								<span className="flex items-center justify-center gap-2">
									<span className="animate-spin">⚙️</span> Analyzing...
								</span>
							) : (
								"🔍 Analyze Strategy"
							)}
						</button>
						{!isValid && <p className="text-xs text-amber-600 mt-2">⚠ Allocation must total 100% to analyze</p>}
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4">
						<p className="text-sm text-red-700 mb-3">⚠️ {error}</p>
						<button
							onClick={analyzeStrategy}
							className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
						>
							Try Again
						</button>
					</div>
				)}

				{/* Analysis Results */}
				{analysis && (
					<div className="space-y-4">
						<div className="bg-green-50 border border-green-200 rounded-xl p-4">
							<div className="flex items-start gap-3">
								<span className="text-2xl">✨</span>
								<div className="flex-1">
									<p className="text-sm font-semibold text-green-900 mb-2">AI Analysis</p>
									<p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between text-xs text-gray-500">
							<span>Analyzed at {analysis.timestamp.toLocaleTimeString()}</span>
							<button onClick={analyzeStrategy} className="text-green-600 hover:text-green-700 font-medium">
								↻ Re-analyze
							</button>
						</div>
					</div>
				)}

				{/* Quick Tips */}
				{!analysis && !error && !isAnalyzing && (
					<div className="border-t border-gray-200 pt-4">
						<p className="text-xs font-semibold text-gray-500 mb-3">QUICK TIPS</p>
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<span className="text-green-600 text-xs">•</span>
								<p className="text-xs text-gray-600">Diversify across 2-3 protocols for better risk management</p>
							</div>
							<div className="flex items-start gap-2">
								<span className="text-green-600 text-xs">•</span>
								<p className="text-xs text-gray-600">Higher APY often means higher risk - balance carefully</p>
							</div>
							<div className="flex items-start gap-2">
								<span className="text-green-600 text-xs">•</span>
								<p className="text-xs text-gray-600">Consider protocol TVL and utilization rates</p>
							</div>
						</div>
					</div>
				)}

				{/* Ask AI Button - Links to FloatingConcierge */}
				<div className="border-t border-gray-200 pt-4">
					<button
						onClick={() => {
							// Prepare comprehensive strategy context
							const strategyContext = {
								mode: strategyMode,
								name: strategyName || `${strategyMode === "preset" ? "Preset" : "Custom"} Strategy`,
								allocations: allocations.map((a) => ({
									protocol: a.name,
									percentage: a.allocation,
									expectedAPY: a.expectedAPY,
								})),
								blendedAPY: calculateBlendedAPY(),
								totalAllocation,
							}

							const contextMessage = `I'd like to discuss my yield strategy:

**${strategyContext.name}** (${strategyContext.mode === "preset" ? "Preset Strategy" : "Custom Strategy"})

**Allocations:**
${strategyContext.allocations.map((a) => `• ${a.protocol}: ${a.percentage}% (Expected APY: ${a.expectedAPY}%)`).join("\n")}

**Expected Blended APY:** ${strategyContext.blendedAPY}%

Can you help me understand this strategy better and suggest any improvements?`

							openWithContext(contextMessage)
						}}
						disabled={!isValid}
						className={`w-full py-3 rounded-xl transition-colors font-medium text-sm ${
							isValid ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-50 text-gray-400 cursor-not-allowed"
						}`}
					>
						💬 Ask AI About This Strategy
					</button>
					{!isValid && (
						<p className="text-xs text-amber-600 mt-2 text-center">⚠ Complete your 100% allocation to ask AI</p>
					)}
				</div>
			</div>
		</div>
	)
}
