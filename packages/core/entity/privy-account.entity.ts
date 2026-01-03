/**
 * ============================================
 * PRIVY ACCOUNT ENTITY
 * ============================================
 * Description: Privy user identity layer
 * Purpose: One row per Privy user (auth/identity)
 * Created: 2025-11-23
 */

export interface PrivyAccountEntity {
	id: string
	privyOrganizationId: string
	privyWalletAddress: string
	privyEmail: string | null
	walletType: "MANAGED" | "USER_OWNED"
	createdAt: Date
	updatedAt: Date
}

export interface CreatePrivyAccountInput {
	privyOrganizationId: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: "MANAGED" | "USER_OWNED"
}

export interface UpdatePrivyAccountInput {
	privyEmail?: string
}
