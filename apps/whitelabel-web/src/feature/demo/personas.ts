/**
 * Demo Persona Definitions
 *
 * Defines end-user personas (Bob, Alice) for demo testing
 * Each persona has unique characteristics, balances, and behavior patterns
 */

export type PersonaType = "bob" | "alice"

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
 * Generate product-scoped persona ID
 * Format: {persona}_{productName}_{visualizationType}
 *
 * Examples:
 * - bob_shopify_ecommerce
 * - alice_fastwork_creators
 *
 * @param persona - Persona type (bob/alice)
 * @param productName - Product name (e.g., "Shopify", "Fastwork")
 * @param visualizationType - Demo type (ecommerce/creators/gig-workers)
 */
export function generatePersonaUserId(
	persona: PersonaType,
	productName: string,
	visualizationType: string,
): string {
	// Normalize product name to lowercase and replace spaces
	const normalizedProduct = productName.toLowerCase().replace(/\s+/g, "_")
	return `${persona}_${normalizedProduct}_${visualizationType}`
}

/**
 * Parse persona user ID back to components
 *
 * @param userId - Product-scoped user ID
 * @returns Parsed components or null if invalid format
 */
export function parsePersonaUserId(userId: string): {
	persona: PersonaType
	productName: string
	visualizationType: string
} | null {
	const parts = userId.split("_")
	if (parts.length < 3) return null

	const persona = parts[0] as PersonaType
	if (!DEMO_PERSONAS[persona]) return null

	return {
		persona,
		productName: parts.slice(1, -1).join("_"),
		visualizationType: parts[parts.length - 1],
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
