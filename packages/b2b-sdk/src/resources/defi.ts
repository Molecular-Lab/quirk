/**
 * DeFi Resource - DeFi Protocol Endpoints
 */

import { HttpClient } from '../utils/http-client'
import type { ProtocolData, ProtocolsResponse } from '../types'

export class DeFiResource {
  constructor(private http: HttpClient) {}

  /**
   * 6.1 Get All Protocol Metrics
   * Get metrics for all DeFi protocols
   */
  async getAllProtocols(params: {
    token: string
    chainId: string
  }): Promise<ProtocolsResponse> {
    const queryString = this.http.buildQueryString(params)
    return this.http.get<ProtocolsResponse>(
      `/api/v1/defi/protocols${queryString}`
    )
  }

  /**
   * 6.2 Get AAVE Metrics
   * Get AAVE lending protocol metrics
   */
  async getAAVE(params: {
    token: string
    chainId: string
  }): Promise<ProtocolData> {
    const queryString = this.http.buildQueryString(params)
    return this.http.get<ProtocolData>(
      `/api/v1/defi/protocols/aave${queryString}`
    )
  }

  /**
   * 6.3 Get Compound Metrics
   * Get Compound lending protocol metrics
   */
  async getCompound(params: {
    token: string
    chainId: string
  }): Promise<ProtocolData> {
    const queryString = this.http.buildQueryString(params)
    return this.http.get<ProtocolData>(
      `/api/v1/defi/protocols/compound${queryString}`
    )
  }

  /**
   * 6.4 Get Morpho Metrics
   * Get Morpho lending protocol metrics
   */
  async getMorpho(params: {
    token: string
    chainId: string
  }): Promise<ProtocolData> {
    const queryString = this.http.buildQueryString(params)
    return this.http.get<ProtocolData>(
      `/api/v1/defi/protocols/morpho${queryString}`
    )
  }
}
