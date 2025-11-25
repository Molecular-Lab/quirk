/**
 * B2B User Controller
 * HTTP handlers for end-user management operations
 */

import type { Request, Response } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { logger } from '../config/logger';

export class B2BUserController {
  constructor(private readonly container: DIContainer) {}

  /**
   * POST /api/v1/users
   * Create or get end-user (idempotent)
   */
  async getOrCreateUser(req: Request, res: Response): Promise<void> {
    try {
      const {
        clientId,
        userId,
        userType,
        userWalletAddress,
      } = req.body;

      if (!clientId || !userId || !userType) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: clientId, userId, userType',
        });
        return;
      }

      const user = await this.container.b2bUserUseCase.getOrCreateUser({
        clientId,
        userId,
        userType,
        userWalletAddress,
      });

      logger.info(`✅ User retrieved/created: ${userId}`, { clientId, userType });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('❌ Failed to get/create user', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process user',
      });
    }
  }

  /**
   * GET /api/v1/users/client/:clientId/:userId
   * Get user by client ID and external user ID
   */
  async getUserByClientAndUserId(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, userId } = req.params;

      const user = await this.container.b2bUserUseCase.getUserByClientAndUserId(
        clientId,
        userId
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('❌ Failed to get user', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user',
      });
    }
  }

  /**
   * GET /api/v1/users/client/:clientId
   * List all users for a client
   */
  async listUsersByClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const { limit, offset } = req.query;

      const users = await this.container.b2bUserUseCase.listUsersByClient(
        clientId,
        limit ? parseInt(limit as string) : 100,
        offset ? parseInt(offset as string) : 0
      );

      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      logger.error('❌ Failed to list users', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list users',
      });
    }
  }

  /**
   * GET /api/v1/users/client/:clientId/:userId/portfolio
   * Get user's complete portfolio across all vaults
   */
  async getUserPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, userId } = req.params;

      // First get the end_user internal ID
      const user = await this.container.b2bUserUseCase.getUserByClientAndUserId(
        clientId,
        userId
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const portfolio = await this.container.b2bUserUseCase.getUserPortfolio(user.id);

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
    } catch (error) {
      logger.error('❌ Failed to get user portfolio', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get portfolio',
      });
    }
  }
}
