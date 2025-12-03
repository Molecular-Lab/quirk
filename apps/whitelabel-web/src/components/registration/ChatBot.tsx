import { useEffect, useRef, useState } from "react"

import type { ChatMessage } from "../../types/registration"

interface ChatBotProps {
	onAnalysisComplete?: (data: { userGoals: string[]; riskTolerance: string; investmentHorizon: string }) => void
}

const MOCK_RESPONSES: Record<number, ChatMessage> = {
	0: {
		id: "0",
		role: "assistant",
		content:
			"👋 Hello! I'm Proxify AI Assistant. I'll help you design the perfect DeFi strategy for your business. Let's start with understanding your goals. What type of business are you running?",
		timestamp: new Date(),
	},
	1: {
		id: "2",
		role: "assistant",
		content:
			"Great! For e-commerce businesses, we typically recommend strategies that balance growth with stability. How many users do you expect to onboard initially?",
		timestamp: new Date(),
	},
	2: {
		id: "4",
		role: "assistant",
		content:
			"Perfect! For 1000-5000 users, we can design a scalable strategy. What's your risk tolerance? (Conservative, Moderate, or Aggressive)",
		timestamp: new Date(),
	},
	3: {
		id: "6",
		role: "assistant",
		content:
			"Excellent choice! A moderate approach balances safety and returns. What's your primary goal: (1) Stable passive income, (2) Growth + liquidity, or (3) Maximum yield?",
		timestamp: new Date(),
	},
	4: {
		id: "8",
		role: "assistant",
		content:
			"✅ Analysis complete!\n\n📊 **Your Profile:**\n- Business: E-commerce\n- Users: 1000-5000\n- Risk: Moderate\n- Goal: Growth + Liquidity\n\n🎯 **Recommended Strategy:** Balanced Portfolio\n- 40% Aave (stable lending)\n- 35% Uniswap V3 (liquidity provision)\n- 25% Compound (money market)\n\nExpected APY: 8-15%\n\nClick 'Next' to customize your execution ratios!",
		timestamp: new Date(),
	},
}

export default function ChatBot({ onAnalysisComplete }: ChatBotProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([MOCK_RESPONSES[0]])
	const [input, setInput] = useState("")
	const [isTyping, setIsTyping] = useState(false)
	const [step, setStep] = useState(0)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleSend = () => {
		if (!input.trim()) return

		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: input,
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setInput("")
		setIsTyping(true)

		// Simulate AI thinking
		setTimeout(() => {
			const nextStep = step + 1
			const response = MOCK_RESPONSES[nextStep]

			if (response) {
				setMessages((prev) => [...prev, response])
				setStep(nextStep)
				setIsTyping(false)

				// If analysis complete
				if (nextStep === 4 && onAnalysisComplete) {
					onAnalysisComplete({
						userGoals: ["Growth", "Liquidity"],
						riskTolerance: "Moderate",
						investmentHorizon: "Medium-term",
					})
				}
			}
		}, 1500)
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border border-gray-200">
			{/* Header */}
			<div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
				<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
					AI
				</div>
				<div>
					<h3 className="font-semibold text-gray-900">Proxify AI Assistant</h3>
					<p className="text-sm text-gray-500">Strategy Analysis & Recommendations</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
					<span className="text-xs text-gray-500">Online</span>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-6 space-y-4">
				{messages.map((message) => (
					<div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							className={`max-w-[80%] rounded-2xl px-4 py-3 ${
								message.role === "user"
									? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
									: "bg-gray-100 text-gray-900"
							}`}
						>
							<div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
							<div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
								{message.timestamp.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
					</div>
				))}

				{isTyping && (
					<div className="flex justify-start">
						<div className="bg-gray-100 rounded-2xl px-4 py-3">
							<div className="flex items-center gap-1">
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="border-t border-gray-200 p-4 bg-gray-50">
				<div className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => {
							setInput(e.target.value)
						}}
						onKeyPress={handleKeyPress}
						placeholder="Type your answer..."
						disabled={step >= 4}
						className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
					<button
						onClick={handleSend}
						disabled={!input.trim() || step >= 4}
						className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						Send
					</button>
				</div>
				{step >= 4 && (
					<p className="text-sm text-green-600 mt-2 text-center font-medium">
						✓ Analysis complete! Ready to proceed to strategy selection.
					</p>
				)}
			</div>
		</div>
	)
}
