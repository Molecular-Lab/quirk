/**
 * DeFi Protocol Abstraction Interface
 * Provides a unified interface for fetching wrapped token data from different protocols
 */

import { Decimal } from 'decimal.js';

export type ProtocolName = 'AAVE' | 'COMPOUND' | 'MORPHO' | 'CURVE' | 'UNISWAP';

export interface WrappedTokenBalance {
  protocol: ProtocolName;
  wrappedTokenAddress: string; // aUSDC, cUSDC, etc.
  wrappedTokenSymbol: string; // 'aUSDC', 'cUSDC'
  wrappedBalance: string; // Raw balance (with decimals)
  exchangeRate: string; // How much real token per 1 wrapped token
  realValue: string; // Calculated: wrappedBalance × exchangeRate
  decimals: number; // Token decimals (6 for USDC, 8 for cTokens, 18 for most)
}

/**
 * Base interface that all DeFi protocol clients must implement
 */
export interface IDeFiProtocolClient {
  /**
   * Protocol name (AAVE, COMPOUND, etc.)
   */
  readonly protocolName: ProtocolName;

  /**
   * Get wrapped token balance for a custodial wallet
   *
   * @param custodialWallet - Client's custodial wallet address
   * @param tokenAddress - Underlying token address (e.g., USDC)
   * @returns Wrapped token balance info with exchange rate
   *
   * @example
   * // AAVE
   * const balance = await aaveClient.getWrappedBalance('0xABC...', '0xUSDC...')
   * // Returns: { wrappedBalance: '605000000000', exchangeRate: '1008333000000000000', realValue: '610041.47' }
   */
  getWrappedBalance(custodialWallet: string, tokenAddress: string): Promise<WrappedTokenBalance>;

  /**
   * Get exchange rate from wrapped token to real token
   *
   * @param wrappedTokenAddress - Wrapped token contract (aUSDC, cUSDC)
   * @returns Exchange rate (1 wrapped = X real tokens)
   *
   * @example
   * // AAVE: 1 aUSDC = 1.008333 USDC
   * const rate = await aaveClient.getExchangeRate('0xaUSDC...')
   * // Returns: '1008333000000000000' (scaled by 1e18)
   */
  getExchangeRate(wrappedTokenAddress: string): Promise<string>;

  /**
   * Calculate real value from wrapped balance and exchange rate
   *
   * @param wrappedBalance - Wrapped token balance
   * @param exchangeRate - Exchange rate from wrapped to real
   * @param decimals - Token decimals
   * @returns Real token value
   */
  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string;
}

/**
 * AAVE Protocol Client (aTokens)
 *
 * Exchange Rate: Uses convertToAssets(1e18)
 * Formula: aUSDC.convertToAssets(1e18) returns USDC per 1 aUSDC
 */
export class AaveProtocolClient implements IDeFiProtocolClient {
  readonly protocolName: ProtocolName = 'AAVE';

  constructor(
    private readonly getATokenContract: (tokenAddress: string) => any // You inject your viem/ethers client getter
  ) {}

  async getWrappedBalance(custodialWallet: string, tokenAddress: string): Promise<WrappedTokenBalance> {
    // Get aToken contract (you'll inject this)
    const aToken = this.getATokenContract(tokenAddress);

    // Fetch wrapped balance
    const wrappedBalance = await aToken.balanceOf(custodialWallet);

    // Get exchange rate (convertToAssets)
    const exchangeRate = await this.getExchangeRate(aToken.address);

    // Calculate real value
    const realValue = this.calculateRealValue(wrappedBalance.toString(), exchangeRate, 6); // USDC = 6 decimals

    return {
      protocol: 'AAVE',
      wrappedTokenAddress: aToken.address,
      wrappedTokenSymbol: 'aUSDC', // TODO: Get from contract
      wrappedBalance: wrappedBalance.toString(),
      exchangeRate,
      realValue,
      decimals: 6,
    };
  }

  async getExchangeRate(wrappedTokenAddress: string): Promise<string> {
    const aToken = this.getATokenContract(wrappedTokenAddress);

    // AAVE: convertToAssets(1e18) returns USDC per 1 aUSDC
    const rate = await aToken.convertToAssets(BigInt(1e18));

    return rate.toString();
  }

  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string {
    const balance = new Decimal(wrappedBalance);
    const rate = new Decimal(exchangeRate);

    // AAVE formula: (wrappedBalance × exchangeRate) / 1e18
    const realValue = balance.times(rate).dividedBy(new Decimal(10).pow(18));

    // Convert to human-readable (divide by token decimals)
    const humanValue = realValue.dividedBy(new Decimal(10).pow(decimals));

    return humanValue.toFixed(6);
  }
}

/**
 * Compound Protocol Client (cTokens)
 *
 * Exchange Rate: Uses exchangeRateStored()
 * Formula: cUSDC.exchangeRateStored() returns USDC per 1 cUSDC
 * Note: cTokens use 8 decimals, USDC uses 6
 */
export class CompoundProtocolClient implements IDeFiProtocolClient {
  readonly protocolName: ProtocolName = 'COMPOUND';

  constructor(
    private readonly getCTokenContract: (tokenAddress: string) => any // You inject your viem/ethers client getter
  ) {}

  async getWrappedBalance(custodialWallet: string, tokenAddress: string): Promise<WrappedTokenBalance> {
    const cToken = this.getCTokenContract(tokenAddress);

    // Fetch wrapped balance (cTokens use 8 decimals)
    const wrappedBalance = await cToken.balanceOf(custodialWallet);

    // Get exchange rate
    const exchangeRate = await this.getExchangeRate(cToken.address);

    // Calculate real value
    const realValue = this.calculateRealValue(wrappedBalance.toString(), exchangeRate, 8); // cTokens = 8 decimals

    return {
      protocol: 'COMPOUND',
      wrappedTokenAddress: cToken.address,
      wrappedTokenSymbol: 'cUSDC',
      wrappedBalance: wrappedBalance.toString(),
      exchangeRate,
      realValue,
      decimals: 8,
    };
  }

  async getExchangeRate(wrappedTokenAddress: string): Promise<string> {
    const cToken = this.getCTokenContract(wrappedTokenAddress);

    // Compound: exchangeRateStored() returns rate with 18 decimals
    const rate = await cToken.exchangeRateStored();

    return rate.toString();
  }

  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string {
    const balance = new Decimal(wrappedBalance);
    const rate = new Decimal(exchangeRate);

    // Compound formula: (cTokenBalance × exchangeRate) / 1e18
    const realValueRaw = balance.times(rate).dividedBy(new Decimal(10).pow(18));

    // Convert to USDC (6 decimals)
    // cToken is 8 decimals, so we need to adjust
    const realValue = realValueRaw.dividedBy(new Decimal(10).pow(decimals - 6));

    return realValue.toFixed(6);
  }
}

/**
 * Morpho Protocol Client (Vault Shares)
 *
 * Exchange Rate: Uses convertToAssets(1e18)
 * Formula: Similar to AAVE
 */
export class MorphoProtocolClient implements IDeFiProtocolClient {
  readonly protocolName: ProtocolName = 'MORPHO';

  constructor(
    private readonly getMorphoVaultContract: (tokenAddress: string) => any
  ) {}

  async getWrappedBalance(custodialWallet: string, tokenAddress: string): Promise<WrappedTokenBalance> {
    const vault = this.getMorphoVaultContract(tokenAddress);

    // Fetch share balance
    const wrappedBalance = await vault.balanceOf(custodialWallet);

    // Get exchange rate
    const exchangeRate = await this.getExchangeRate(vault.address);

    // Calculate real value
    const realValue = this.calculateRealValue(wrappedBalance.toString(), exchangeRate, 18); // Shares = 18 decimals

    return {
      protocol: 'MORPHO',
      wrappedTokenAddress: vault.address,
      wrappedTokenSymbol: 'mUSDC',
      wrappedBalance: wrappedBalance.toString(),
      exchangeRate,
      realValue,
      decimals: 18,
    };
  }

  async getExchangeRate(wrappedTokenAddress: string): Promise<string> {
    const vault = this.getMorphoVaultContract(wrappedTokenAddress);

    // Morpho: convertToAssets(1e18) returns USDC per 1 share
    const rate = await vault.convertToAssets(BigInt(1e18));

    return rate.toString();
  }

  calculateRealValue(wrappedBalance: string, exchangeRate: string, decimals: number): string {
    const balance = new Decimal(wrappedBalance);
    const rate = new Decimal(exchangeRate);

    // Morpho formula: (shares × exchangeRate) / 1e18
    const realValue = balance.times(rate).dividedBy(new Decimal(10).pow(18));

    // Convert to USDC (6 decimals)
    const humanValue = realValue.dividedBy(new Decimal(10).pow(decimals - 6));

    return humanValue.toFixed(6);
  }
}

/**
 * Protocol Client Registry
 * Manages all protocol clients and provides easy access
 */
export class ProtocolClientRegistry {
  private clients: Map<ProtocolName, IDeFiProtocolClient> = new Map();

  /**
   * Register a protocol client
   */
  register(client: IDeFiProtocolClient): void {
    this.clients.set(client.protocolName, client);
  }

  /**
   * Get protocol client by name
   */
  get(protocolName: ProtocolName): IDeFiProtocolClient {
    const client = this.clients.get(protocolName);
    if (!client) {
      throw new Error(`Protocol client not registered: ${protocolName}`);
    }
    return client;
  }

  /**
   * Get all registered clients
   */
  getAll(): IDeFiProtocolClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Check if protocol is registered
   */
  has(protocolName: ProtocolName): boolean {
    return this.clients.has(protocolName);
  }
}

/**
 * Example Usage:
 *
 * // Setup (you do this once in your app initialization)
 * const registry = new ProtocolClientRegistry();
 *
 * registry.register(new AaveProtocolClient((addr) => getATokenContract(addr)));
 * registry.register(new CompoundProtocolClient((addr) => getCTokenContract(addr)));
 * registry.register(new MorphoProtocolClient((addr) => getMorphoVault(addr)));
 *
 * // Then inject registry into VaultIndexService
 * const indexService = new VaultIndexService(vaultRepo, wrappedTokenRepo, registry);
 *
 * // Service will automatically use correct client for each protocol
 * await indexService.syncWrappedTokenBalances(vaultId);
 */
