import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"

// Create React Query client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30000, // 30 seconds
			gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
			refetchOnWindowFocus: false,
			retry: 2,
			refetchInterval: 60000, // Refetch every 60 seconds
		},
	},
})

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</StrictMode>,
)
