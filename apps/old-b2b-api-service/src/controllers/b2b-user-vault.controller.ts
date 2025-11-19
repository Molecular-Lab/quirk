/**
 * B2B User Vault (Balance) Controller
 * HTTP handlers for user balance queries
 */

import type { Request, Response } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { logger } from '../config/logger';

export class B2BUserVaultController {
  constructor(private readonly container: DIContainer) {}

  /**
   * GET /api/v1/balances/client/:clientId/user/:userId
   * Get user's balance across all vaults (portfolio view)
   */
  async getUserBalance(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, userId } = req.params;
      const { chain, tokenAddress } = req.query;

      if (chain && tokenAddress) {
        // Get balance for specific vault
        const balance = await this.container.b2bUserVaultUseCase.getUserBalance(
          userId,
          clientId,
          chain as string,
          tokenAddress as string
        );

        if (!balance) {
          res.status(404).json({
            success: false,
            message: 'User vault not found',
          });
          return;
        }

        res.json({
          success: true,
          data: balance,
        });
      } else {
        // Get complete portfolio
        const portfolio = await this.container.b2bUserVaultUseCase.getUserPortfolio(
          userId,
          clientId
        );

        if (!portfolio) {
          res.status(404).json({
            success: false,
            message: 'User portfolio not found',
          });
          return;
        }

        res.json({
          success: true,
          data: portfolio,
        });
      }
    } catch (error) {
      logger.error('❌ Failed to get user balance', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get balance',
      });
    }
  }

  /**
   * GET /api/v1/balances/vault/:clientId/:chain/:tokenAddress/users
   * List all users with balances in a specific vault
   */
  async listVaultUsers(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, chain, tokenAddress } = req.params;
      const { limit } = req.query;

      const users = await this.container.b2bUserVaultUseCase.listVaultUsers(
        clientId,
        chain,
        tokenAddress,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      logger.error('❌ Failed to list vault users', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list users',
      });
    }
  }
}
