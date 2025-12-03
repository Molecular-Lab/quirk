/**
 * Vault Resource - Vault Management Endpoints
 */

import { HttpClient } from '../utils/http-client'
import type {
  Vault,
  CreateVaultRequest,
  UpdateVaultIndexRequest,
  MarkStakedRequest,
} from '../types'

export class VaultResource {
  constructor(private http: HttpClient) {}

  /**
   * 2.1 Create or Get Vault
   * Create new vault or retrieve existing vault
   */
  async createOrGet(data: CreateVaultRequest): Promise<Vault> {
    return this.http.post<Vault>('/api/v1/vaults', data)
  }

  /**
   * 2.2 Get Vault by ID
   * Retrieve vault by ID
   */
  async getById(id: string): Promise<Vault> {
    return this.http.get<Vault>(`/api/v1/vaults/${id}`)
  }

  /**
   * 2.3 List Client Vaults
   * List all vaults for a client
   */
  async listByClient(clientId: string): Promise<Vault[]> {
    return this.http.get<Vault[]>(`/api/v1/vaults/client/${clientId}`)
  }

  /**
   * 2.4 Get Vault by Token
   * Get specific vault by token details
   */
  async getByToken(
    clientId: string,
    tokenSymbol: string,
    chainId: number
  ): Promise<Vault> {
    return this.http.get<Vault>(
      `/api/v1/vaults/token/${clientId}/${tokenSymbol}/${chainId}`
    )
  }

  /**
   * 2.5 Update Vault Index with Yield
   * Update vault index with yield distribution
   */
  async updateIndex(
    vaultId: string,
    data: UpdateVaultIndexRequest
  ): Promise<{ newIndex: string; yieldPerShare: string }> {
    return this.http.post(`/api/v1/vaults/${vaultId}/index/update`, data)
  }

  /**
   * 2.6 Get Vaults Ready for Staking
   * Get vaults with pending balance ready to stake
   */
  async getReadyForStaking(): Promise<Vault[]> {
    return this.http.get<Vault[]>('/api/v1/vaults/ready-for-staking')
  }

  /**
   * 2.7 Mark Funds as Staked
   * Mark pending funds as staked
   */
  async markStaked(
    vaultId: string,
    data: MarkStakedRequest
  ): Promise<{ success: boolean; message: string }> {
    return this.http.post(`/api/v1/vaults/${vaultId}/mark-staked`, data)
  }
}
