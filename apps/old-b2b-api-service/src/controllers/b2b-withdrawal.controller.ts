/**
 * B2B Withdrawal Controller
 * HTTP handlers for withdrawal operations
 */

import type { Request, Response } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { logger } from '../config/logger';

export class B2BWithdrawalController {
  constructor(private readonly container: DIContainer) {}

  /**
   * POST /api/v1/withdrawals
   * Request withdrawal (FLOW 8)
   */
  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const {
        clientId,
        userId,
        chain,
        tokenAddress,
        amount,
        orderId,
        destinationType,
        destinationDetails,
      } = req.body;

      if (!clientId || !userId || !chain || !tokenAddress || !amount || !orderId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: clientId, userId, chain, tokenAddress, amount, orderId',
        });
        return;
      }

      const withdrawal = await this.container.b2bWithdrawalUseCase.requestWithdrawal({
        clientId,
        userId,
        chain,
        tokenAddress,
        amount,
        orderId,
        destinationType: destinationType || 'client_balance',
        destinationDetails,
      });

      logger.info(`✅ Withdrawal requested: ${amount} for user ${userId}`, {
        orderId,
        chain,
        tokenAddress,
      });

      res.status(200).json({
        success: true,
        data: withdrawal,
      });
    } catch (error) {
      logger.error('❌ Failed to request withdrawal', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to request withdrawal',
      });
    }
  }

  /**
   * GET /api/v1/withdrawals/:orderId
   * Get withdrawal by order ID
   */
  async getWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const withdrawal = await this.container.b2bWithdrawalUseCase.getWithdrawalByOrderId(orderId);

      if (!withdrawal) {
        res.status(404).json({
          success: false,
          message: 'Withdrawal not found',
        });
        return;
      }

      res.json({
        success: true,
        data: withdrawal,
      });
    } catch (error) {
      logger.error('❌ Failed to get withdrawal', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get withdrawal',
      });
    }
  }

  /**
   * POST /api/v1/withdrawals/:orderId/complete
   * Complete withdrawal (payment gateway callback)
   */
  async completeWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { actualAmount } = req.body;

      await this.container.b2bWithdrawalUseCase.completeWithdrawal(orderId, actualAmount);

      logger.info(`✅ Withdrawal completed: ${orderId}`, { actualAmount });

      res.json({
        success: true,
        message: 'Withdrawal completed successfully',
      });
    } catch (error) {
      logger.error('❌ Failed to complete withdrawal', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to complete withdrawal',
      });
    }
  }

  /**
   * POST /api/v1/withdrawals/:orderId/fail
   * Mark withdrawal as failed
   */
  async failWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: reason',
        });
        return;
      }

      await this.container.b2bWithdrawalUseCase.failWithdrawal(orderId, reason);

      logger.info(`✅ Withdrawal marked as failed: ${orderId}`, { reason });

      res.json({
        success: true,
        message: 'Withdrawal marked as failed',
      });
    } catch (error) {
      logger.error('❌ Failed to mark withdrawal as failed', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update withdrawal',
      });
    }
  }

  /**
   * GET /api/v1/withdrawals/client/:clientId
   * List withdrawals by client
   */
  async listWithdrawalsByClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const { limit, offset } = req.query;

      const withdrawals = await this.container.b2bWithdrawalUseCase.listWithdrawalsByClient(
        clientId,
        limit ? parseInt(limit as string) : 100,
        offset ? parseInt(offset as string) : 0
      );

      res.json({
        success: true,
        data: withdrawals,
        count: withdrawals.length,
      });
    } catch (error) {
      logger.error('❌ Failed to list withdrawals', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list withdrawals',
      });
    }
  }

  /**
   * GET /api/v1/withdrawals/client/:clientId/user/:userId
   * List withdrawals by user
   */
  async listWithdrawalsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, userId } = req.params;
      const { limit } = req.query;

      const withdrawals = await this.container.b2bWithdrawalUseCase.listWithdrawalsByUser(
        clientId,
        userId,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        success: true,
        data: withdrawals,
        count: withdrawals.length,
      });
    } catch (error) {
      logger.error('❌ Failed to list withdrawals', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list withdrawals',
      });
    }
  }
}
