/**
 * User Credentials Store
 * Manages authenticated user's B2B client credentials
 *
 * Stores:
 * - privyOrganizationId (did:privy:xxx) - Primary identifier
 * - productId (prod_xxx) - After client registration
 * - apiKey (sk_live_xxx) - After generating API key
 * - clientId (internal UUID) - Only for reference, NOT used in API calls
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Organization {
	id: string // Internal UUID
	productId: string // prod_xxx - PRIMARY identifier for API calls
	companyName: string
	businessType: string
	description?: string
	websiteUrl?: string
	isActive: boolean
	isSandbox: boolean
	createdAt: string
	updatedAt: string
}

interface UserCredentials {
	// Privy Authentication (one per user)
	privyOrganizationId: string | null // did:privy:xxx
	privyEmail: string | null
	privyWalletAddress: string | null
	walletType: "MANAGED" | "USER_OWNED" | null

	// User's Organizations (MULTIPLE per Privy user)
	organizations: Organization[] // Array of orgs (e.g., GrabPay, GrabFood, GrabMart)
	activeProductId: string | null // Currently selected organization

	// API Credentials (per organization)
	apiKey: string | null // sk_live_xxx
	webhookSecret: string | null // whsec_xxx
}

export interface UserStore extends UserCredentials {
	// Setters
	setPrivyCredentials: (data: {
		privyOrganizationId: string
		privyEmail?: string
		privyWalletAddress?: string
		walletType?: "MANAGED" | "USER_OWNED"
	}) => void

	// Organization Management
	addOrganization: (org: Organization) => void
	setOrganizations: (orgs: Organization[]) => void
	setActiveOrganization: (productId: string) => void
	getActiveOrganization: () => Organization | null
	loadOrganizations: () => Promise<void> // NEW: Fetch from database

	// API Credentials (per organization)
	setApiKey: (apiKey: string, webhookSecret?: string) => void

	// Getters
	isAuthenticated: () => boolean
	hasOrganizations: () => boolean
	hasApiKey: () => boolean

	// Reset
	clearCredentials: () => void
}

const initialState: UserCredentials = {
	privyOrganizationId: null,
	privyEmail: null,
	privyWalletAddress: null,
	walletType: null,
	organizations: [],
	activeProductId: null,
	apiKey: null,
	webhookSecret: null,
}

export const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// Set Privy credentials after login
			setPrivyCredentials: (data) => {
				set({
					privyOrganizationId: data.privyOrganizationId,
					privyEmail: data.privyEmail || null,
					privyWalletAddress: data.privyWalletAddress || null,
					walletType: data.walletType || null,
				})
			},

			// Add a new organization (after creating one)
			addOrganization: (org) => {
				const orgs = get().organizations
				set({
					organizations: [...orgs, org],
					activeProductId: org.productId, // Auto-select new org
				})
			},

			// Set all organizations (after fetching from API)
			setOrganizations: (orgs) => {
				set({
					organizations: orgs,
					activeProductId: orgs.length > 0 ? orgs[0].productId : null,
				})
			},

			// Switch active organization
			setActiveOrganization: (productId) => {
				const org = get().organizations.find((o) => o.productId === productId)
				if (org) {
					set({ activeProductId: productId })

					// Sync to clientContextStore
					import("./clientContextStore").then(({ useClientContext }) => {
						const apiKey = get().apiKey
						console.log("[UserStore] Switching active organization:", {
							productId,
							companyName: org.companyName,
							hasApiKey: !!apiKey,
						})

						useClientContext.getState().setClientContext({
							clientId: org.id,
							productId: org.productId,
							apiKey: apiKey || "",
							companyName: org.companyName,
							businessType: org.businessType,
						})

						console.log("[UserStore] ✅ Synced to clientContextStore")
					})
				}
			},

			// Get currently active organization
			getActiveOrganization: () => {
				const { organizations, activeProductId } = get()
				return organizations.find((o) => o.productId === activeProductId) || null
			},

			// Load all organizations for the authenticated Privy user from database
			loadOrganizations: async () => {
				const privyOrganizationId = get().privyOrganizationId

				if (!privyOrganizationId) {
					console.warn("[UserStore] Cannot load organizations: No Privy user authenticated")
					return
				}

				try {
					// Import b2bApiClient dynamically to avoid circular dependencies
					const { b2bApiClient } = await import("@/api/b2bClient")

					console.log("[UserStore] Loading organizations for Privy ID:", privyOrganizationId)

					const response = await b2bApiClient.listOrganizationsByPrivyId(privyOrganizationId)

					// Response is already an array from the backend
					const organizations = Array.isArray(response) ? response : []

					console.log("[UserStore] Loaded organizations:", {
						count: organizations.length,
						organizations: organizations.map((org: Organization) => ({
							productId: org.productId,
							companyName: org.companyName,
							businessType: org.businessType,
						})),
					})

					// Map response to Organization interface
					const mappedOrgs: Organization[] = organizations.map((org: Organization) => ({
						id: org.id,
						productId: org.productId,
						companyName: org.companyName,
						businessType: org.businessType,
						description: org.description || undefined,
						websiteUrl: org.websiteUrl || undefined,
						isActive: org.isActive,
						isSandbox: org.isSandbox,
						createdAt: org.createdAt,
						updatedAt: org.updatedAt,
					}))

					set({
						organizations: mappedOrgs,
						activeProductId: mappedOrgs.length > 0 ? mappedOrgs[0].productId : null,
					})

					console.log("[UserStore] Organizations loaded successfully:", {
						total: mappedOrgs.length,
						activeProductId: mappedOrgs.length > 0 ? mappedOrgs[0].productId : null,
					})
				} catch (error) {
					console.error("[UserStore] Failed to load organizations:", error)
					// ✅ Keep existing organizations instead of clearing them
					// This prevents losing UI state when API calls fail
				}
			},

			// Set API key for current organization
			setApiKey: (apiKey, webhookSecret) => {
				set({
					apiKey,
					webhookSecret,
				})

				// Sync to clientContextStore
				const activeOrg = get().getActiveOrganization()
				if (activeOrg) {
					import("./clientContextStore").then(({ useClientContext }) => {
						console.log("[UserStore] API key updated, syncing to clientContextStore")

						useClientContext.getState().setClientContext({
							clientId: activeOrg.id,
							productId: activeOrg.productId,
							apiKey: apiKey,
							companyName: activeOrg.companyName,
							businessType: activeOrg.businessType,
						})

						console.log("[UserStore] ✅ API key synced to clientContextStore")
					})
				}
			},

			// Check if user is authenticated with Privy
			isAuthenticated: () => {
				return !!get().privyOrganizationId
			},

			// Check if user has any organizations
			hasOrganizations: () => {
				return get().organizations.length > 0
			},

			// Check if user has API key
			hasApiKey: () => {
				return !!get().apiKey
			},

			// Clear all credentials (logout)
			clearCredentials: () => {
				set(initialState)
			},
		}),
		{
			name: "proxify-user-credentials",
			// Store in localStorage with encryption (optional)
			partialize: (state) =>
				({
					privyOrganizationId: state.privyOrganizationId,
					privyEmail: state.privyEmail,
					privyWalletAddress: state.privyWalletAddress,
					walletType: state.walletType,
					organizations: state.organizations,
					activeProductId: state.activeProductId,
					apiKey: state.apiKey,
					webhookSecret: state.webhookSecret,
				}) as Partial<UserStore>,
		},
	),
)

/**
 * Usage Example:
 *
 * // 1. After Privy login - Set credentials and load organizations
 * const { user } = usePrivy()
 * const { setPrivyCredentials, loadOrganizations } = useUserStore()
 *
 * useEffect(() => {
 *   if (user) {
 *     // Set Privy credentials
 *     setPrivyCredentials({
 *       privyOrganizationId: user.id,
 *       privyEmail: user.email?.address,
 *       privyWalletAddress: user.wallet?.address,
 *       walletType: isNonCustodial ? "USER_OWNED" : "MANAGED"
 *     })
 *
 *     // Fetch all organizations for this Privy user from database
 *     await loadOrganizations() // This will populate organizations[] state
 *   }
 * }, [user])
 *
 * // 2. Create new organization (e.g., GrabPay, GrabFood)
 * const { addOrganization } = useUserStore()
 * const response = await b2bClient.registerClient({
 *   privyOrganizationId: user.id,
 *   companyName: "GrabFood",
 *   businessType: "food_delivery",
 *   walletType: "MANAGED",
 *   // ...
 * })
 * addOrganization(response) // Add to local state immediately
 *
 * // 3. Switch between organizations
 * const { setActiveOrganization, getActiveOrganization, organizations } = useUserStore()
 * setActiveOrganization("prod_grabfood_123") // Switch to GrabFood
 * const activeOrg = getActiveOrganization() // Get current active org
 *
 * // 4. Use active organization for API calls
 * const { activeProductId } = useUserStore()
 * await b2bClient.configureStrategies(activeProductId, { ... })
 *
 * // 5. Display all organizations in UI
 * const { organizations } = useUserStore()
 * organizations.map(org => (
 *   <div key={org.productId}>
 *     <h3>{org.companyName}</h3>
 *     <p>Product ID: {org.productId}</p>
 *     <p>Type: {org.businessType}</p>
 *   </div>
 * ))
 */
