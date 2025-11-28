/**
 * Deposit Order Service - For Operations Dashboard
 */

import type { DepositOrderUseCase, CreateDepositOrderRequest } from "@proxify/core";

export class DepositOrderService {
  constructor(private readonly depositOrderUseCase: DepositOrderUseCase) {}

  async createDepositOrder(request: CreateDepositOrderRequest) {
    return await this.depositOrderUseCase.createDepositOrder(request);
  }

  async getDepositOrderByOrderId(orderId: string) {
    return await this.depositOrderUseCase.getDepositOrderByOrderId(orderId);
  }

  async listAllPendingOrders() {
    return await this.depositOrderUseCase.listAllPendingOrders();
  }

  async listPendingOrdersByClient(clientId: string) {
    return await this.depositOrderUseCase.listPendingOrdersByClient(clientId);
  }

  async completeDepositOrder(orderId: string, cryptoAmount: string, transactionHash: string) {
    return await this.depositOrderUseCase.completeDepositOrder(orderId, cryptoAmount, transactionHash);
  }
}
