import { PropsWithChildren } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { isAPIError } from "@rabbitswap/api-core/client"

const retryCount = 3

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount: number, error: Error) => {
				// Max retries reached
				if (failureCount >= retryCount) {
					return false
				}

				// Retry only if it's server error
				if (isAPIError(error) && error.status < 500) {
					return false
				}

				return true
			},
			retryDelay: (failureCount: number) => {
				return (failureCount + 1) * 3000
			},
			refetchOnWindowFocus: false,
			staleTime: 1 * 60 * 1000, // 1 minute
		},
	},
})

export const QueryProvider = ({ children }: PropsWithChildren) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
