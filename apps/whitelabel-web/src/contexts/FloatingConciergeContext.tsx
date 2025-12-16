import { type ReactNode, createContext, useContext, useState } from "react"

interface FloatingConciergeContextType {
	isOpen: boolean
	setIsOpen: (open: boolean) => void
	openWithContext: (contextMessage: string) => void
	contextMessage: string | null
	clearContext: () => void
}

const FloatingConciergeContext = createContext<FloatingConciergeContextType | undefined>(undefined)

export function FloatingConciergeProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)
	const [contextMessage, setContextMessage] = useState<string | null>(null)

	const openWithContext = (message: string) => {
		setContextMessage(message)
		setIsOpen(true)
	}

	const clearContext = () => {
		setContextMessage(null)
	}

	return (
		<FloatingConciergeContext.Provider
			value={{
				isOpen,
				setIsOpen,
				openWithContext,
				contextMessage,
				clearContext,
			}}
		>
			{children}
		</FloatingConciergeContext.Provider>
	)
}

export function useFloatingConcierge() {
	const context = useContext(FloatingConciergeContext)
	if (context === undefined) {
		throw new Error("useFloatingConcierge must be used within a FloatingConciergeProvider")
	}
	return context
}
