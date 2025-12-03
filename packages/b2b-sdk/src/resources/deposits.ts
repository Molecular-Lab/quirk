/**
 * Deposit Resource - Deposit Endpoints (Fiat & Crypto)
 */

import { HttpClient } from '../utils/http-client'
import type {
  Deposit,
  CreateFiatDepositRequest,
  MockConfirmFiatDepositRequest,
  BatchCompleteDepositsRequest,
  CompleteFiatDepositRequest,
  InitiateCryptoDepositRequest,
  CompleteCryptoDepositRequest,
  DepositStats,
  PendingDepositsResponse,
  PaginationParams,
  DepositStatus,
} from '../types'

export class DepositResource {
  constructor(private http: HttpClient) {}

  // ==================== FLOW 4A: FIAT DEPOSITS ====================

  /**
   * 4.1 Create Fiat Deposit
   * Initiate fiat deposit from client's traditional bank account
   */
  async createFiat(data: CreateFiatDepositRequest): Promise<Deposit> {
    return this.http.post<Deposit>('/api/v1/deposits/fiat', data)
  }

  /**
   * 4.2 Mock Confirm Fiat Deposit (DEMO)
   * Simulate bank payment confirmation (demo/testing only)
   */
  async mockConfirmFiat(
    orderId: string,
    data: MockConfirmFiatDepositRequest
  ): Promise<{
    success: boolean
    orderId: string
    status: string
    cryptoAmount: string
    mockNote: string
  }> {
    return this.http.post(`/api/v1/deposits/fiat/${orderId}/mock-confirm`, data)
  }

  /**
   * 4.3 Batch Complete Deposits
   * Complete multiple orders and transfer USDC to custodial wallet
   */
  async batchComplete(data: BatchCompleteDepositsRequest): Promise<{
    success: boolean
    completedOrders: number
    totalUSDC: string
    custodialWallet: string
    mockNote: string
  }> {
    return this.http.post('/api/v1/deposits/batch-complete', data)
  }

  /**
   * 4.4 Complete Fiat Deposit (Webhook)
   * Complete fiat deposit (called by webhook after on-ramp)
   */
  async completeFiat(
    orderId: string,
    data: CompleteFiatDepositRequest
  ): Promise<{
    success: boolean
    orderId: string
    sharesMinted: string
  }> {
    return this.http.post(`/api/v1/deposits/fiat/${orderId}/complete`, data)
  }

  // ==================== FLOW 4B: CRYPTO DEPOSITS ====================

  /**
   * 4.5 Initiate Crypto Deposit
   * Start crypto deposit (returns custodial wallet address)
   */
  async initiateCrypto(data: InitiateCryptoDepositRequest): Promise<{
    orderId: string
    status: string
    custodialWalletAddress: string
    chain: string
    tokenAddress: string
    tokenSymbol: string
    expectedAmount: string
    expiresAt: string
    createdAt: string
  }> {
    return this.http.post('/api/v1/deposits/crypto/initiate', data)
  }

  /**
   * 4.6 Complete Crypto Deposit
   * Verify on-chain transfer and mint shares
   */
  async completeCrypto(
    orderId: string,
    data: CompleteCryptoDepositRequest
  ): Promise<{
    orderId: string
    status: string
    cryptoAmount: string
    sharesMinted: string
    transactionHash: string
    verifiedAt: string
  }> {
    return this.http.post(`/api/v1/deposits/crypto/${orderId}/complete`, data)
  }

  // ==================== SHARED QUERY ENDPOINTS ====================

  /**
   * 4.7 List Pending Deposits
   * List pending deposits (Operations Dashboard)
   */
  async listPending(): Promise<PendingDepositsResponse> {
    return this.http.get<PendingDepositsResponse>('/api/v1/deposits/pending')
  }

  /**
   * 4.8 Get Deposit Stats
   * Get deposit statistics
   */
  async getStats(clientId: string): Promise<DepositStats> {
    return this.http.get<DepositStats>(`/api/v1/deposits/stats/${clientId}`)
  }

  /**
   * 4.9 List Deposits by Client
   * List deposits for specific client
   */
  async listByClient(
    clientId: string,
    params?: PaginationParams & { status?: DepositStatus }
  ): Promise<Deposit[]> {
    const queryString = params ? this.http.buildQueryString(params) : ''
    return this.http.get<Deposit[]>(
      `/api/v1/deposits/client/${clientId}${queryString}`
    )
  }

  /**
   * 4.10 List Deposits by User
   * List deposits for specific user
   */
  async listByUser(
    userId: string,
    params?: PaginationParams
  ): Promise<Deposit[]> {
    const queryString = params ? this.http.buildQueryString(params) : ''
    return this.http.get<Deposit[]>(
      `/api/v1/deposits/user/${userId}${queryString}`
    )
  }

  /**
   * 4.11 Get Deposit by Order ID
   * Retrieve specific deposit details
   */
  async getByOrderId(orderId: string): Promise<Deposit> {
    return this.http.get<Deposit>(`/api/v1/deposits/${orderId}`)
  }
}
