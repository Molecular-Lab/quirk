/**
 * User Resource - User Management Endpoints
 */

import { HttpClient } from '../utils/http-client'
import type {
  User,
  CreateUserRequest,
  UserPortfolio,
  UserBalance,
  PaginationParams,
} from '../types'

export class UserResource {
  constructor(private http: HttpClient) {}

  /**
   * 3.1 Create or Get User
   * Create new end-user or retrieve existing
   */
  async createOrGet(data: CreateUserRequest): Promise<User> {
    return this.http.post<User>('/api/v1/users', data)
  }

  /**
   * 3.2 Get User by ID
   * Retrieve user by internal ID
   */
  async getById(id: string): Promise<User> {
    return this.http.get<User>(`/api/v1/users/${id}`)
  }

  /**
   * 3.3 Get User by Client and Client User ID
   * Get user by client and user's client-side ID
   */
  async getByClientUserId(
    clientId: string,
    clientUserId: string
  ): Promise<User> {
    return this.http.get<User>(
      `/api/v1/users/client/${clientId}/user/${clientUserId}`
    )
  }

  /**
   * 3.4 List Users by Client
   * List all users for a client
   */
  async listByClient(
    clientId: string,
    params?: PaginationParams
  ): Promise<User[]> {
    const queryString = params ? this.http.buildQueryString(params) : ''
    return this.http.get<User[]>(`/api/v1/users/client/${clientId}${queryString}`)
  }

  /**
   * 3.5 Get User Portfolio
   * Get user portfolio across all vaults
   */
  async getPortfolio(userId: string): Promise<UserPortfolio> {
    return this.http.get<UserPortfolio>(`/api/v1/users/${userId}/portfolio`)
  }

  /**
   * 3.6 Get User Balance
   * Get user balance (simplified, aggregated)
   */
  async getBalance(
    userId: string,
    params?: { chain?: string; token?: string }
  ): Promise<UserBalance> {
    const queryString = params ? this.http.buildQueryString(params) : ''
    return this.http.get<UserBalance>(
      `/api/v1/users/${userId}/balance${queryString}`
    )
  }

  /**
   * 3.7 List User Vaults
   * List all vaults for user across chains/tokens
   */
  async listVaults(userId: string): Promise<{ vaults: any[] }> {
    return this.http.get(`/api/v1/users/${userId}/vaults`)
  }
}
