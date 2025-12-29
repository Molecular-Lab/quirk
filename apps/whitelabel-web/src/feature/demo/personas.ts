/**
 * Demo Persona Definitions
 *
 * Defines end-user personas (Bob, Alice) for demo testing
 * Each persona has unique characteristics, balances, and behavior patterns
 */

export type PersonaType = "bob" | "alice"
export type VisualizationType = "ecommerce" | "creators" | "gig-workers"

export interface PersonaProfile {
	id: PersonaType
	name: string
	email: string
	avatar: string
	balance: number
	description: string
	riskProfile: "conservative" | "moderate" | "aggressive"
}

/**
 * Pre-defined demo personas
 */
export const DEMO_PERSONAS: Record<PersonaType, PersonaProfile> = {
	bob: {
		id: "bob",
		name: "Bob",
		email: "bob@example.com",
		avatar: "👨‍💼",
		balance: 1000,
		description: "Conservative investor - Focus on stability",
		riskProfile: "conservative",
	},
	alice: {
		id: "alice",
		name: "Alice",
		email: "alice@example.com",
		avatar: "👩‍💼",
		balance: 5000,
		description: "Active trader - Seeks growth opportunities",
		riskProfile: "aggressive",
	},
}

/**
 * Generate Static Key for demo end-user identification
 * Format: {privyUserId}:{visualizationType}:{persona}:{environment}
 *
 * Examples:
 * - did:privy:abc123:gig-workers:bob:sandbox
 * - did:privy:xyz789:ecommerce:alice:production
 *
 * This Static Key is used directly as `clientUserId` when calling the API.
 * Each combination of (privyUser, platform, persona, environment) gets a unique end_user.
 *
 * @param privyUserId - Privy user ID (e.g., "did:privy:abc123")
 * @param visualizationType - Demo platform type (ecommerce/creators/gig-workers)
 * @param persona - Persona type (bob/alice)
 * @param environment - Environment type (sandbox/production)
 */
export function generateDemoClientUserId(
	privyUserId: string,
	visualizationType: VisualizationType,
	persona: PersonaType,
	environment: "sandbox" | "production",
): string {
	return `${privyUserId}:${visualizationType}:${persona}:${environment}`
}

/**
 * Parse demo client_user_id back to components
 * Format: {privyUserId}:{visualizationType}:{persona}:{environment}
 * Backwards compatible with old 3-part format (defaults to 'sandbox')
 *
 * @param clientUserId - Demo client user ID
 * @returns Parsed components or null if invalid format
 */
export function parseDemoClientUserId(clientUserId: string): {
	privyUserId: string
	visualizationType: VisualizationType
	persona: PersonaType
	environment: "sandbox" | "production"
} | null {
	// Split by last three colons to handle privyUserId containing colons
	const lastColonIdx = clientUserId.lastIndexOf(":")
	if (lastColonIdx === -1) return null

	const environment = clientUserId.slice(lastColonIdx + 1) as "sandbox" | "production"
	let remaining = clientUserId.slice(0, lastColonIdx)

	// Backwards compatibility: if environment is not 'sandbox' or 'production',
	// assume it's the old 3-part format and treat last part as persona
	if (environment !== "sandbox" && environment !== "production") {
		// Old format: {privyUserId}:{visualizationType}:{persona}
		const persona = environment as PersonaType
		remaining = clientUserId.slice(0, lastColonIdx)

		const secondLastColonIdx = remaining.lastIndexOf(":")
		if (secondLastColonIdx === -1) return null

		const visualizationType = remaining.slice(secondLastColonIdx + 1) as VisualizationType
		const privyUserId = remaining.slice(0, secondLastColonIdx)

		// Validate persona and visualizationType
		if (!DEMO_PERSONAS[persona]) return null
		if (!["ecommerce", "creators", "gig-workers"].includes(visualizationType)) return null

		return {
			privyUserId,
			visualizationType,
			persona,
			environment: "sandbox", // Default to sandbox for old format
		}
	}

	// New format: {privyUserId}:{visualizationType}:{persona}:{environment}
	const secondLastColonIdx = remaining.lastIndexOf(":")
	if (secondLastColonIdx === -1) return null

	const persona = remaining.slice(secondLastColonIdx + 1) as PersonaType
	remaining = remaining.slice(0, secondLastColonIdx)

	const thirdLastColonIdx = remaining.lastIndexOf(":")
	if (thirdLastColonIdx === -1) return null

	const visualizationType = remaining.slice(thirdLastColonIdx + 1) as VisualizationType
	const privyUserId = remaining.slice(0, thirdLastColonIdx)

	// Validate persona and visualizationType
	if (!DEMO_PERSONAS[persona]) return null
	if (!["ecommerce", "creators", "gig-workers"].includes(visualizationType)) return null

	return {
		privyUserId,
		visualizationType,
		persona,
		environment,
	}
}

/**
 * Get persona profile by type
 */
export function getPersonaProfile(persona: PersonaType): PersonaProfile {
	return DEMO_PERSONAS[persona]
}

/**
 * Get all available personas
 */
export function getAllPersonas(): PersonaProfile[] {
	return Object.values(DEMO_PERSONAS)
}
