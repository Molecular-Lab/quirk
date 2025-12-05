import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useFloatingConcierge } from "../../contexts/FloatingConciergeContext"

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || "http://localhost:8000"

interface ChatMessage {
	role: "user" | "assistant"
	content: string
	timestamp: Date
}

export function FloatingConcierge() {
	const { isOpen, setIsOpen: setContextIsOpen, contextMessage, clearContext } = useFloatingConcierge()
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
		{
			role: "assistant",
			content: "👋 Hi! I'm your AI yield advisor. Ask me about DeFi protocols, risk levels, or strategies.",
			timestamp: new Date(),
		},
	])
	const [chatInput, setChatInput] = useState("")
	const [isSending, setIsSending] = useState(false)
	const [sessionId] = useState(() => `session-${Date.now()}`)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const hasProcessedContext = useRef(false)

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (isOpen) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
		}
	}, [chatMessages, isOpen])

	// Handle context message from ContextualAIPanel
	useEffect(() => {
		if (isOpen && contextMessage && !hasProcessedContext.current) {
			hasProcessedContext.current = true
			setChatInput(contextMessage)
			// Auto-send the context message
			setTimeout(() => {
				sendMessageWithText(contextMessage)
				clearContext()
			}, 500)
		}
		if (!isOpen) {
			hasProcessedContext.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, contextMessage])

	const sendMessageWithText = async (messageText: string) => {
		if (!messageText.trim() || isSending) return

		const userMessage: ChatMessage = {
			role: "user",
			content: messageText,
			timestamp: new Date(),
		}

		setChatMessages((prev) => [...prev, userMessage])
		setChatInput("")
		setIsSending(true)

		try {
			const response = await axios.post(`${AGENT_API_URL}/agent`, {
				message: messageText,
				session_id: sessionId,
			})

			const assistantMessage: ChatMessage = {
				role: "assistant",
				content: response.data.response,
				timestamp: new Date(),
			}

			setChatMessages((prev) => [...prev, assistantMessage])
		} catch (error) {
			console.error("Failed to send message to agent:", error)
			const errorMessage: ChatMessage = {
				role: "assistant",
				content:
					"⚠️ Sorry, I'm having trouble connecting to the agent service. Please make sure the agent server is running on localhost:8000.",
				timestamp: new Date(),
			}
			setChatMessages((prev) => [...prev, errorMessage])
		} finally {
			setIsSending(false)
		}
	}

	const sendMessage = async () => {
		if (!chatInput.trim() || isSending) return
		await sendMessageWithText(chatInput)
	}

	const SUGGESTED_QUESTIONS = [
		"What is the risk of Morpho?",
		"Compare AAVE vs Compound",
		"Why is Morpho's APY higher?",
		"Explain conservative strategy",
	]

	return (
		<div className="fixed bottom-6 right-6 z-50">
			{!isOpen ? (
				// Minimized Square Button
				<button
					onClick={() => setContextIsOpen(true)}
					className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
						/>
					</svg>
					<span className="text-[10px] font-semibold">AI</span>
				</button>
			) : (
				// Expanded Square Chat Window
				<div className="w-[420px] h-[600px] bg-white rounded-3xl border-2 border-gray-200 shadow-2xl flex flex-col overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
								<span className="text-white text-sm font-bold">AI</span>
							</div>
							<div>
								<h3 className="text-white font-bold text-lg">Yield Advisor</h3>
								<p className="text-white/80 text-xs">Powered by Proxify Agent</p>
							</div>
						</div>
						<button
							onClick={() => setContextIsOpen(false)}
							className="text-white/80 hover:text-white transition-colors"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Chat Messages */}
					<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
						{chatMessages.map((msg, idx) => (
							<div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
								{msg.role === "assistant" && (
									<div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
										<span className="text-white text-xs font-bold">AI</span>
									</div>
								)}
								<div
									className={`max-w-[75%] rounded-2xl px-4 py-3 ${
										msg.role === "user" ? "bg-green-500 text-white" : "bg-white text-gray-800 border border-gray-200"
									}`}
								>
									<p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
									<p
										className={`text-[10px] mt-1 ${msg.role === "user" ? "text-green-100" : "text-gray-400"}`}
									>
										{msg.timestamp.toLocaleTimeString()}
									</p>
								</div>
								{msg.role === "user" && (
									<div className="w-8 h-8 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
										<span className="text-white text-xs font-bold">U</span>
									</div>
								)}
							</div>
						))}

						{/* Typing indicator */}
						{isSending && (
							<div className="flex gap-3 justify-start">
								<div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<span className="text-white text-xs font-bold">AI</span>
								</div>
								<div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
									</div>
								</div>
							</div>
						)}

						{/* Suggested Questions */}
						{chatMessages.length === 1 && (
							<div className="space-y-2">
								<p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
								<div className="flex flex-wrap gap-2">
									{SUGGESTED_QUESTIONS.map((question) => (
										<button
											key={question}
											onClick={() => {
												setChatInput(question)
												sendMessage()
											}}
											className="text-xs px-3 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
										>
											{question}
										</button>
									))}
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* Input Area */}
					<div className="p-4 bg-white border-t border-gray-200">
						<div className="flex gap-2">
							<input
								type="text"
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault()
										sendMessage()
									}
								}}
								placeholder="Ask about protocols, risk levels..."
								disabled={isSending}
								className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
							/>
							<button
								onClick={sendMessage}
								disabled={isSending || !chatInput.trim()}
								className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
							>
								{isSending ? "..." : "Send"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

