/**
 * Registration Flow Types
 * Client onboarding with AI chat, strategy selection, and package configuration
 */

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: Date
}

export type StrategyType = 'conservative' | 'balanced' | 'aggressive'

export interface Strategy {
  id: string
  type: StrategyType
  name: string
  description: string
  expectedAPY: {
    min: number
    max: number
  }
  riskLevel: number // 1-10
  protocols: string[] // DeFi protocols used
  features: string[]
}

export interface ExecutionRatio {
  aave: number // 0-100
  uniswap: number // 0-100
  compound: number // 0-100
}

export type RevenueModel = 'basic' | 'standard' | 'enterprise'

export interface RevenuePackage {
  id: string
  model: RevenueModel
  name: string
  description: string
  features: string[]
  pricing: {
    managementFee: number // percentage
    performanceFee: number // percentage
    minimumDeposit: number // USD
  }
  limits: {
    maxUsers: number | null // null = unlimited
    maxTVL: number | null // null = unlimited
    apiCallsPerMonth: number | null
  }
}

export interface RegistrationState {
  step: 'chat' | 'strategy' | 'execution' | 'package' | 'complete'
  chatHistory: ChatMessage[]
  selectedStrategy: Strategy | null
  executionRatio: ExecutionRatio
  selectedPackage: RevenuePackage | null
  analyzedData?: {
    userGoals: string[]
    riskTolerance: string
    investmentHorizon: string
  }
}

export interface ClientRegistration {
  clientId: string
  businessName: string
  strategy: Strategy
  executionRatio: ExecutionRatio
  revenuePackage: RevenuePackage
  registrationDate: Date
  status: 'pending' | 'active' | 'suspended'
}
