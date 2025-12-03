/**
 * Client Onboarding Store
 * Manages multi-step form state for client registration
 *
 * Stores:
 * - Current step and progress
 * - Company information (including customer tier - CRITICAL for AI)
 * - Strategy priorities (drag & drop ranking)
 * - Banking information (optional)
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type CustomerTier = "0-1000" | "1000-10000" | "10000-100000" | "100000-1000000" | "1000000+"
export type RiskTolerance = "conservative" | "moderate" | "aggressive"
export type WalletType = "MANAGED" | "USER_OWNED"

export interface StrategyPriority {
	id: string // 'defi', 'cefi', 'lp', 'hedge', 'arbitrage'
	rank: number // 1-5 (1 = highest priority)
}

export interface BankAccount {
	currency: string
	bank_name: string
	account_number: string
	account_name: string
	swift_code?: string
	bank_details?: Record<string, unknown>
}

interface CompanyInfo {
	companyName: string
	businessType: string
	description: string
	websiteUrl: string
	customerTier: CustomerTier
	estimatedAUM: string
	industry: string
}

interface Strategies {
	priorities: StrategyPriority[]
	riskTolerance: RiskTolerance
}

interface BankingInfo {
	configured: boolean
	accounts: BankAccount[]
}

interface OnboardingState {
	// Step tracking
	currentStep: number
	completedSteps: number[]

	// Form data
	companyInfo: CompanyInfo
	strategies: Strategies
	bankingInfo: BankingInfo

	// Actions
	setCompanyInfo: (info: Partial<CompanyInfo>) => void
	setStrategies: (strategies: Partial<Strategies>) => void
	setBankingInfo: (banking: Partial<BankingInfo>) => void
	addBankAccount: (account: BankAccount) => void
	removeBankAccount: (index: number) => void
	nextStep: () => void
	previousStep: () => void
	goToStep: (step: number) => void
	resetOnboarding: () => void

	// Validation
	isStepValid: (step: number) => boolean
}

const initialCompanyInfo: CompanyInfo = {
	companyName: "",
	businessType: "",
	description: "",
	websiteUrl: "",
	customerTier: "0-1000",
	estimatedAUM: "",
	industry: "",
}

const initialStrategies: Strategies = {
	priorities: [
		{ id: "defi", rank: 1 },
		{ id: "lp", rank: 2 },
		{ id: "cefi", rank: 3 },
		{ id: "hedge", rank: 4 },
		{ id: "arbitrage", rank: 5 },
	],
	riskTolerance: "moderate",
}

const initialBankingInfo: BankingInfo = {
	configured: false,
	accounts: [],
}

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set, get) => ({
			// Initial state
			currentStep: 0,
			completedSteps: [],

			companyInfo: initialCompanyInfo,
			strategies: initialStrategies,
			bankingInfo: initialBankingInfo,

			// Actions
			setCompanyInfo: (info) =>
				set((state) => ({
					companyInfo: { ...state.companyInfo, ...info },
				})),

			setStrategies: (strategies) =>
				set((state) => ({
					strategies: { ...state.strategies, ...strategies },
				})),

			setBankingInfo: (banking) =>
				set((state) => ({
					bankingInfo: { ...state.bankingInfo, ...banking },
				})),

			addBankAccount: (account) =>
				set((state) => ({
					bankingInfo: {
						...state.bankingInfo,
						configured: true,
						accounts: [...state.bankingInfo.accounts, account],
					},
				})),

			removeBankAccount: (index) =>
				set((state) => {
					const newAccounts = state.bankingInfo.accounts.filter((_, i) => i !== index)
					return {
						bankingInfo: {
							...state.bankingInfo,
							accounts: newAccounts,
							configured: newAccounts.length > 0, // Only if more than 0 accounts left
						},
					}
				}),
			nextStep: () =>
				set((state) => {
					const nextStep = Math.min(state.currentStep + 1, 3)
					return {
						currentStep: nextStep,
						completedSteps: [...new Set([...state.completedSteps, state.currentStep])],
					}
				}),

			previousStep: () =>
				set((state) => ({
					currentStep: Math.max(0, state.currentStep - 1),
				})),

			goToStep: (step) =>
				set(() => ({
					currentStep: step,
				})),

			resetOnboarding: () =>
				set({
					currentStep: 0,
					completedSteps: [],
					companyInfo: initialCompanyInfo,
					strategies: initialStrategies,
					bankingInfo: initialBankingInfo,
				}),

			// Validation
			isStepValid: (step) => {
				const state = get()

				switch (step) {
					case 0: // Company Info
						return !!(
							state.companyInfo.companyName.trim() &&
							state.companyInfo.businessType.trim() &&
							state.companyInfo.industry.trim() &&
							state.companyInfo.customerTier &&
							state.companyInfo.estimatedAUM.trim()
						)

					case 1: // Strategies
						return state.strategies.priorities.length === 5

					case 2: // Banking (optional)
						return true // Always valid since it's optional

					default:
						return false
				}
			},
		}),
		{
			name: "proxify-onboarding",
			storage: createJSONStorage(() => localStorage),
		},
	),
)
