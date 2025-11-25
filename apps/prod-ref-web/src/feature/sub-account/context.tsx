import { PropsWithChildren, createContext, useContext, useState } from "react"

import { AccountMode } from "@/feature/sub-account/types"

interface AccountModeContextType {
	accountMode: AccountMode
	setAccountMode: (accountMode: AccountMode) => void
}

export const AccountModeContext = createContext<AccountModeContextType>({
	accountMode: "main",
	setAccountMode: () => {},
})

export const AccountModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [accountMode, setAccountMode] = useState<AccountMode>("main")

	return <AccountModeContext.Provider value={{ accountMode, setAccountMode }}>{children}</AccountModeContext.Provider>
}

export const useAccountMode = () => {
	const context = useContext(AccountModeContext)

	return context
}
