import { PropsWithChildren, createContext, useContext, useState } from "react"

interface PhisingWarningContextType {
	hideBanner: boolean
	setHideBanner: (hideBanner: boolean) => void
}

export const PhisingWarningContext = createContext<PhisingWarningContextType>({
	hideBanner: false,
	setHideBanner: () => {},
})

export const PhisingWarningProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [hideBanner, setHideBanner] = useState(false)

	return (
		<PhisingWarningContext.Provider
			value={{
				hideBanner,
				setHideBanner,
			}}
		>
			{children}
		</PhisingWarningContext.Provider>
	)
}

export const usePhisingWarning = (): PhisingWarningContextType => {
	const { hideBanner, setHideBanner } = useContext(PhisingWarningContext)

	return { hideBanner, setHideBanner }
}
