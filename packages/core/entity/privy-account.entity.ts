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
	walletType: "custodial" | "non-custodial"
	createdAt: Date
	updatedAt: Date
}

export interface CreatePrivyAccountInput {
	privyOrganizationId: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: "custodial" | "non-custodial"
}

export interface UpdatePrivyAccountInput {
	privyEmail?: string
}
