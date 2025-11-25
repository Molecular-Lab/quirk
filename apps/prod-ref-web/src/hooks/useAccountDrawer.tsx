import { PropsWithChildren, createContext, useContext, useState } from "react"

interface AccountDrawerContextValue {
	open: boolean
	setOpen: (value: boolean) => void
	handleOpenDrawer: () => void
}

const AccountDrawerContext = createContext<AccountDrawerContextValue | undefined>(undefined)

export const AccountDrawerProvider = ({ children }: PropsWithChildren) => {
	const [open, setOpen] = useState<boolean>(false)

	const handleOpenDrawer = () => {
		setOpen((prev) => !prev)
	}

	return (
		<AccountDrawerContext.Provider value={{ open, setOpen, handleOpenDrawer }}>
			{children}
		</AccountDrawerContext.Provider>
	)
}

export function useAccountDrawer() {
	const context = useContext(AccountDrawerContext)
	if (context === undefined) {
		throw new Error("useAccountDrawer must be used within an AccountDrawerProvider")
	}
	return context
}
