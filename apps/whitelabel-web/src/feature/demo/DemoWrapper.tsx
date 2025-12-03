/**
 * Demo Wrapper
 * Initializes client context from userStore if available
 * Falls back to manual configuration via DemoSettings
 */

import { useEffect } from "react"

import { useClientContext } from "@/store/clientContextStore"
import { useUserStore } from "@/store/userStore"

import { DemoClientApp } from "./DemoClientApp"

export function DemoWrapper() {
	const { activeProductId, getActiveOrganization, apiKey } = useUserStore()
	const { setClientContext, syncToLocalStorage } = useClientContext()

	// Initialize client context when component mounts or when active product changes
	useEffect(() => {
		const org = getActiveOrganization()

		console.log("[DemoWrapper] Initializing client context:", {
			activeProductId,
			org: org
				? {
						id: org.id,
						productId: org.productId,
						companyName: org.companyName,
					}
				: null,
			hasApiKey: !!apiKey,
		})

		// Only set context if we have all required data
		if (org && activeProductId && apiKey) {
			setClientContext({
				clientId: org.id,
				productId: activeProductId,
				apiKey: apiKey,
				companyName: org.companyName,
				businessType: org.businessType,
			})
		} else {
			console.warn("[DemoWrapper] Missing client context data:", {
				hasOrg: !!org,
				hasProductId: !!activeProductId,
				hasApiKey: !!apiKey,
			})
		}
	}, [activeProductId, apiKey, getActiveOrganization, setClientContext])

	// Sync to localStorage on mount (in case localStorage was cleared)
	useEffect(() => {
		syncToLocalStorage()
	}, [syncToLocalStorage])

	// Always render the app - users can configure settings via the settings button
	return <DemoClientApp />
}
