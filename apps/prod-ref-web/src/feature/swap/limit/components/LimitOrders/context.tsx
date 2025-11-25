import { createContext, useContext } from "react"

export const LimitOrderTableContext = createContext({
	showOnlyThisPair: true,
	setShowOnlyThisPair: (_: boolean) => {},
})

export const useLimitOrderTable = () => {
	const ctx = useContext(LimitOrderTableContext)
	return ctx
}
