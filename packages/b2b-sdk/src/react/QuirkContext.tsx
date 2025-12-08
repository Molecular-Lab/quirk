import { createContext, useContext } from 'react'
import type { QuirkSDK } from '../client'

export interface QuirkContextValue {
	sdk: QuirkSDK
	productId: string
}

export const QuirkContext = createContext<QuirkContextValue | null>(null)

/**
 * Hook to access Quirk SDK context
 * @throws Error if used outside QuirkProvider
 */
export function useQuirkContext(): QuirkContextValue {
	const context = useContext(QuirkContext)

	if (!context) {
		throw new Error(
			'useQuirkContext must be used within a QuirkProvider. ' +
				'Please wrap your app with <QuirkProvider apiKey="..." productId="...">'
		)
	}

	return context
}
