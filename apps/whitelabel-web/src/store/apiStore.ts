/**
 * API Testing Store
 * Manages API testing state and credentials
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { ENV } from "@/config/env"
import { useUserStore } from "./userStore"

export interface ApiTestRequest {
	method: "GET" | "POST" | "PUT" | "DELETE"
	endpoint: string
	body?: string
	description?: string
}

export interface ApiTestResult {
	request: ApiTestRequest
	response: {
		status: number
		statusText: string
		data: any
		headers: Record<string, string>
		timing: number
	}
	timestamp: string
}

export interface ApiTestState {
	// API Credentials
	apiKey: string | null
	baseUrl: string

	// Current Test
	currentRequest: ApiTestRequest | null
	isLoading: boolean
	error: string | null

	// Test History
	history: ApiTestResult[]

	// Setters
	setApiKey: (apiKey: string) => void
	setBaseUrl: (url: string) => void
	setCurrentRequest: (request: ApiTestRequest) => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	addToHistory: (result: ApiTestResult) => void
	clearHistory: () => void

	// Sync with userStore
	syncFromUserStore: () => void
}

const initialState = {
	apiKey: null,
	baseUrl: ENV.API_URL,
	currentRequest: null,
	isLoading: false,
	error: null,
	history: [],
}

export const useApiStore = create<ApiTestState>()(
	persist(
		(set, get) => ({
			...initialState,

			setApiKey: (apiKey) => {
				set({ apiKey })
				// Also sync to localStorage for b2bApiClient
				localStorage.setItem("b2b:api_key", apiKey)
			},

			setBaseUrl: (url) => set({ baseUrl: url }),

			setCurrentRequest: (request) => set({ currentRequest: request }),

			setLoading: (loading) => set({ isLoading: loading }),

			setError: (error) => set({ error }),

			addToHistory: (result) => {
				const history = get().history
				set({
					history: [result, ...history].slice(0, 50), // Keep last 50
				})
			},

			clearHistory: () => set({ history: [] }),

			// Sync API key from userStore
			syncFromUserStore: () => {
				const userApiKey = useUserStore.getState().apiKey
				if (userApiKey) {
					set({ apiKey: userApiKey })
					localStorage.setItem("b2b:api_key", userApiKey)
				}
			},
		}),
		{
			name: "proxify-api-testing",
			partialize: (state) => ({
				// ✅ apiKey NOT persisted - force fresh load
				baseUrl: state.baseUrl,
				history: state.history,
			}),
		},
	),
)

/**
 * Hook to get API key from multiple sources
 * Priority: apiStore > userStore > localStorage
 */
export function useApiKey(): string | null {
	const apiStoreKey = useApiStore((state) => state.apiKey)

	// Try localStorage as fallback
	if (!apiStoreKey) {
		return localStorage.getItem("b2b:api_key")
	}

	return apiStoreKey
}

/**
 * Sync API key from userStore (call this on app init)
 */
export function syncApiKeyFromUserStore() {
	const userApiKey = useUserStore.getState().apiKey
	if (userApiKey) {
		useApiStore.getState().setApiKey(userApiKey)
	}
}
