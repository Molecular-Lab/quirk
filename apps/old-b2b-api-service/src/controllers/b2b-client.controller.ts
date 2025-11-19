/**
 * B2B Client Controller
 * HTTP handlers for client operations
 */

import type { Request, Response } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { logger } from '../config/logger';

export class B2BClientController {
  constructor(private readonly container: DIContainer) {}

  /**
   * POST /api/v1/clients
   * Create new B2B client
   */
  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        companyName,
        businessType,
        description,
        websiteUrl,
        walletType,
        walletManagedBy,
        privyOrganizationId,
        privyWalletAddress,
        apiKeyHash,
        apiKeyPrefix,
        webhookUrls,
        webhookSecret,
        customStrategy,
        endUserYieldPortion,
        platformFee,
        performanceFee,
        isActive,
        isSandbox,
      } = req.body;

      //Validation
      if (!productId || !companyName || !businessType) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: productId, companyName, businessType',
        });
        return;
      }

      const client = await this.container.b2bClientUseCase.createClient({
        productId,
        companyName,
        businessType,
        description,
        websiteUrl,
        walletType,
        walletManagedBy,
        privyOrganizationId,
        privyWalletAddress,
        apiKeyHash,
        apiKeyPrefix,
        webhookUrls,
        webhookSecret,
        customStrategy,
        endUserYieldPortion,
        platformFee,
        performanceFee,
        isActive,
        isSandbox,
      });

      logger.info(`✅ Client created: ${client.id}`, { productId, companyName });

      res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error) {
      logger.error('❌ Failed to create client', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create client',
      });
    }
  }

  /**
   * GET /api/v1/clients/:productId
   * Get client by product ID
   */
  async getClient(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      const client = await this.container.b2bClientUseCase.getClientByProductId(productId);

      if (!client) {
        res.status(404).json({
          success: false,
          message: 'Client not found',
        });
        return;
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      logger.error('❌ Failed to get client', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get client',
      });
    }
  }

  /**
   * GET /api/v1/clients/:clientId/balance
   * Get client balance
   */
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;

      const balance = await this.container.b2bClientUseCase.getBalance(clientId);

      if (!balance) {
        res.status(404).json({
          success: false,
          message: 'Balance not found',
        });
        return;
      }

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      logger.error('❌ Failed to get balance', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get balance',
      });
    }
  }

  /**
   * POST /api/v1/clients/:clientId/balance/add
   * Add funds to client balance
   */
  async addFunds(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const { amount, source, reference } = req.body;

      if (!amount || !source) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: amount, source',
        });
        return;
      }

      await this.container.b2bClientUseCase.addFunds({
        clientId,
        amount,
        source,
        reference,
      });

      logger.info(`✅ Funds added: ${amount} to client ${clientId}`);

      res.json({
        success: true,
        message: 'Funds added successfully',
      });
    } catch (error) {
      logger.error('❌ Failed to add funds', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add funds',
      });
    }
  }

  /**
   * POST /api/v1/clients/:clientId/balance/reserve
   * Reserve funds
   */
  async reserveFunds(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const { amount, purpose, reference } = req.body;

      if (!amount || !purpose) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: amount, purpose',
        });
        return;
      }

      await this.container.b2bClientUseCase.reserveFunds({
        clientId,
        amount,
        purpose,
        reference,
      });

      logger.info(`✅ Funds reserved: ${amount} for client ${clientId}`);

      res.json({
        success: true,
        message: 'Funds reserved successfully',
      });
    } catch (error) {
      logger.error('❌ Failed to reserve funds', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reserve funds',
      });
    }
  }

  /**
   * GET /api/v1/clients/:clientId/stats
   * Get client statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;

      const stats = await this.container.b2bClientUseCase.getStats(clientId);

      if (!stats) {
        res.status(404).json({
          success: false,
          message: 'Stats not found',
        });
        return;
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('❌ Failed to get stats', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats',
      });
    }
  }

  /**
   * GET /api/v1/clients/active
   * List all active clients
   */
  async listActiveClients(_req: Request, res: Response): Promise<void> {
    try {
      const clients = await this.container.b2bClientUseCase.listActiveClients();

      res.json({
        success: true,
        data: clients,
      });
    } catch (error) {
      logger.error('❌ Failed to list clients', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list clients',
      });
    }
  }
}
