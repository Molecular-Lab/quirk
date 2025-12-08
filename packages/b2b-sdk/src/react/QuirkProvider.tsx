import React, { useMemo, type ReactNode } from 'react'
import { QuirkSDK } from '../client'
import { QuirkContext } from './QuirkContext'

export interface QuirkProviderProps {
	/**
	 * Your Quirk API key (prod_pk_xxx or test_pk_xxx)
	 * Get this from your Quirk Dashboard after registration
	 */
	apiKey: string

	/**
	 * Your product/client ID
	 */
	productId: string

	/**
	 * Environment to use
	 * @default 'production'
	 */
	environment?: 'production' | 'sandbox'

	/**
	 * Custom base URL (optional, for self-hosted deployments)
	 */
	baseURL?: string

	children: ReactNode
}

/**
 * Quirk Provider Component
 *
 * Wrap your app with this provider to enable Quirk hooks
 *
 * @example
 * ```tsx
 * import { QuirkProvider } from '@quirk/b2b-sdk'
 *
 * function App() {
 *   return (
 *     <QuirkProvider
 *       apiKey={import.meta.env.VITE_QUIRK_API_KEY}
 *       productId={import.meta.env.VITE_QUIRK_PRODUCT_ID}
 *     >
 *       <YourApp />
 *     </QuirkProvider>
 *   )
 * }
 * ```
 */
export function QuirkProvider({ apiKey, productId, environment = 'production', baseURL, children }: QuirkProviderProps) {
	// Validate required props
	if (!apiKey) {
		return (
			<div style={{ padding: '20px', backgroundColor: '#fee', border: '2px solid #c00', borderRadius: '8px' }}>
				<h3 style={{ margin: '0 0 10px 0', color: '#c00' }}>⚠️ Quirk Configuration Error</h3>
				<p style={{ margin: 0 }}>
					<strong>apiKey</strong> is required for QuirkProvider.
					<br />
					Please provide your API key from the Quirk Dashboard.
				</p>
			</div>
		)
	}

	if (!productId) {
		return (
			<div style={{ padding: '20px', backgroundColor: '#fee', border: '2px solid #c00', borderRadius: '8px' }}>
				<h3 style={{ margin: '0 0 10px 0', color: '#c00' }}>⚠️ Quirk Configuration Error</h3>
				<p style={{ margin: 0 }}>
					<strong>productId</strong> is required for QuirkProvider.
					<br />
					Please provide your product/client ID.
				</p>
			</div>
		)
	}

	// Create SDK instance (memoized to prevent re-creation on re-renders)
	const sdk = useMemo(() => {
		return new QuirkSDK({
			apiKey,
			environment,
			baseURL,
		})
	}, [apiKey, environment, baseURL])

	const value = useMemo(
		() => ({
			sdk,
			productId,
		}),
		[sdk, productId]
	)

	return <QuirkContext.Provider value={value}>{children}</QuirkContext.Provider>
}
