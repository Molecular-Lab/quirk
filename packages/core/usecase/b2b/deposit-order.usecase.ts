/**
 * Deposit Order Use Case - For Operations Dashboard
 * Handles deposit order creation and listing (separate from main deposit flow)
 */

import type { DepositOrderRepository } from '../../repository/postgres/deposit-order.repository';
import type { UserRepository } from '../../repository/postgres/end_user.repository';
import type { ClientRepository } from '../../repository/postgres/client.repository';

export interface CreateDepositOrderRequest {
  orderId: string;
  clientId: string;
  userId: string;
  fiatAmount: string;
  fiatCurrency: string;
  chain: string;
  tokenSymbol: string;
  tokenAddress?: string;
  onRampProvider?: string;
  paymentUrl?: string;
  expiresAt?: Date;
}

export class DepositOrderUseCase {
  constructor(
    private readonly depositOrderRepo: DepositOrderRepository,
    private readonly userRepo: UserRepository,
    private readonly clientRepo: ClientRepository
  ) {}

  /**
   * Create deposit order for Operations Dashboard tracking
   */
  async createDepositOrder(request: CreateDepositOrderRequest) {
    // Validate client exists
    const client = await this.clientRepo.getById(request.clientId);
    if (!client || !client.isActive) {
      throw new Error('Invalid or inactive client');
    }

    // Get or create end user
    const user = await this.userRepo.getOrCreate(
      request.clientId,
      request.userId,
      'custodial',
      undefined
    );

    // Create deposit order
    const order = await this.depositOrderRepo.create({
      orderId: request.orderId,
      clientId: request.clientId,
      userId: user.id,
      fiatAmount: request.fiatAmount,
      fiatCurrency: request.fiatCurrency,
      cryptoAmount: null,
      chain: request.chain,
      tokenSymbol: request.tokenSymbol,
      tokenAddress: request.tokenAddress || null,
      onRampProvider: request.onRampProvider || 'proxify_gateway',
      paymentUrl: request.paymentUrl || null,
      qrCode: null,
      status: 'pending',
      transactionHash: null,
      gatewayFee: null,
      proxifyFee: null,
      networkFee: null,
      totalFees: null,
      expiresAt: request.expiresAt || null,
    });

    if (!order) {
      throw new Error('Failed to create deposit order');
    }

    return order;
  }

  /**
   * Get deposit order by order ID
   */
  async getDepositOrderByOrderId(orderId: string) {
    return await this.depositOrderRepo.getByOrderId(orderId);
  }

  /**
   * List all pending deposit orders (for Operations Dashboard)
   */
  async listAllPendingOrders() {
    return await this.depositOrderRepo.listAllPending();
  }

  /**
   * List pending deposit orders for a specific client
   */
  async listPendingOrdersByClient(clientId: string) {
    return await this.depositOrderRepo.listPendingByClient(clientId);
  }

  /**
   * List deposit orders by client
   */
  async listOrdersByClient(clientId: string, limit?: number, offset?: number) {
    return await this.depositOrderRepo.listByClient(clientId, limit, offset);
  }

  /**
   * Complete deposit order (mock on-ramp simulation)
   */
  async completeDepositOrder(orderId: string, cryptoAmount: string, transactionHash: string) {
    const order = await this.depositOrderRepo.getByOrderId(orderId);

    if (!order) {
      throw new Error('Deposit order not found');
    }

    if (order.status !== 'pending') {
      throw new Error(`Deposit order is already ${order.status}`);
    }

    await this.depositOrderRepo.markCompleted(order.id, cryptoAmount, transactionHash);
  }

  /**
   * Fail deposit order
   */
  async failDepositOrder(orderId: string) {
    const order = await this.depositOrderRepo.getByOrderId(orderId);

    if (!order) {
      throw new Error('Deposit order not found');
    }

    await this.depositOrderRepo.markFailed(order.id);
  }
}
