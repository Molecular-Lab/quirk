/**
 * B2B Deposit Controller
 * HTTP handlers for deposit operations
 */

import type { Request, Response } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { logger } from '../config/logger';

export class B2BDepositController {
  constructor(private readonly container: DIContainer) {}

  /**
   * POST /api/v1/deposits
   * Create new deposit
   */
  async createDeposit(req: Request, res: Response): Promise<void> {
    try {
      const {
        clientId,
        userId,
        fiatCurrency,
        fiatAmount,
        cryptoCurrency,
        depositType,
        gatewayProvider,
        gatewayOrderId,
        paymentUrl,
      } = req.body;

      // Validation
      if (!clientId || !userId || !fiatCurrency || !fiatAmount || !cryptoCurrency) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
        return;
      }

      const deposit = await this.container.b2bDepositUseCase.createDeposit({
        clientId,
        userId,
        fiatCurrency,
        fiatAmount,
        cryptoCurrency,
        depositType: depositType || 'external',
        gatewayProvider,
        gatewayOrderId,
        paymentUrl,
      });

      logger.info(`✅ Deposit created: ${deposit.orderId}`, { clientId, userId, fiatAmount });

      res.status(201).json({
        success: true,
        data: deposit,
      });
    } catch (error) {
      logger.error('❌ Failed to create deposit', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create deposit',
      });
    }
  }

  /**
   * GET /api/v1/deposits/:orderId
   * Get deposit by order ID
   */
  async getDeposit(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const deposit = await this.container.b2bDepositUseCase.getDepositByOrderId(orderId);

      if (!deposit) {
        res.status(404).json({
          success: false,
          message: 'Deposit not found',
        });
        return;
      }

      res.json({
        success: true,
        data: deposit,
      });
    } catch (error) {
      logger.error('❌ Failed to get deposit', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get deposit',
      });
    }
  }

  /**
   * POST /api/v1/deposits/:orderId/complete
   * Mark deposit as completed
   */
  async completeDeposit(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { 
        chain,
        tokenAddress,
        tokenSymbol,
        cryptoAmount, 
        gatewayFee, 
        proxifyFee, 
        networkFee, 
        totalFees 
      } = req.body;

      if (!chain || !tokenAddress || !tokenSymbol || !cryptoAmount || !totalFees) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: chain, tokenAddress, tokenSymbol, cryptoAmount, totalFees',
        });
        return;
      }

      await this.container.b2bDepositUseCase.completeDeposit({
        orderId,
        chain,
        tokenAddress,
        tokenSymbol,
        cryptoAmount,
        gatewayFee: gatewayFee || '0',
        proxifyFee: proxifyFee || '0',
        networkFee: networkFee || '0',
        totalFees,
      });

      logger.info(`✅ Deposit completed: ${orderId}`);

      res.json({
        success: true,
        message: 'Deposit completed successfully',
      });
    } catch (error) {
      logger.error('❌ Failed to complete deposit', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to complete deposit',
      });
    }
  }

  /**
   * POST /api/v1/deposits/:orderId/fail
   * Mark deposit as failed
   */
  async failDeposit(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { errorMessage, errorCode } = req.body;

      if (!errorMessage) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: errorMessage',
        });
        return;
      }

      await this.container.b2bDepositUseCase.failDeposit(orderId, errorMessage, errorCode);

      logger.info(`✅ Deposit failed: ${orderId}`, { errorMessage });

      res.json({
        success: true,
        message: 'Deposit marked as failed',
      });
    } catch (error) {
      logger.error('❌ Failed to fail deposit', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark deposit as failed',
      });
    }
  }

  /**
   * GET /api/v1/deposits/client/:clientId
   * List deposits by client
   */
  async listDepositsByClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const deposits = await this.container.b2bDepositUseCase.listDepositsByClient(
        clientId,
        limit,
        offset
      );

      res.json({
        success: true,
        data: deposits,
        pagination: {
          limit,
          offset,
          total: deposits.length,
        },
      });
    } catch (error) {
      logger.error('❌ Failed to list deposits', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list deposits',
      });
    }
  }

  /**
   * GET /api/v1/deposits/client/:clientId/user/:userId
   * List deposits by user
   */
  async listDepositsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const deposits = await this.container.b2bDepositUseCase.listDepositsByUser(
        clientId,
        userId,
        limit
      );

      res.json({
        success: true,
        data: deposits,
      });
    } catch (error) {
      logger.error('❌ Failed to list user deposits', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list user deposits',
      });
    }
  }

  /**
   * GET /api/v1/deposits/client/:clientId/status/:status
   * List deposits by status
   */
  async listDepositsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, status } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const deposits = await this.container.b2bDepositUseCase.listDepositsByStatus(
        clientId,
        status,
        limit
      );

      res.json({
        success: true,
        data: deposits,
      });
    } catch (error) {
      logger.error('❌ Failed to list deposits by status', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list deposits by status',
      });
    }
  }
}
