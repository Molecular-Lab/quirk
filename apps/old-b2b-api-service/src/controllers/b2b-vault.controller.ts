/**
 * B2B Vault Controller
 * HTTP handlers for vault management operations
 */

import type { Request, Response } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { logger } from '../config/logger';

export class B2BVaultController {
  constructor(private readonly container: DIContainer) {}

  /**
   * POST /api/v1/vaults
   * Create or get vault for client
   */
  async getOrCreateVault(req: Request, res: Response): Promise<void> {
    try {
      const {
        clientId,
        chain,
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
      } = req.body;

      if (!clientId || !chain || !tokenAddress || !tokenSymbol) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: clientId, chain, tokenAddress, tokenSymbol',
        });
        return;
      }

      const vault = await this.container.b2bVaultUseCase.getOrCreateVault({
        clientId,
        chain,
        tokenAddress,
        tokenSymbol,
        tokenDecimals: tokenDecimals || 18,
      });

      logger.info(`✅ Vault retrieved/created for client ${clientId}`, {
        vaultId: vault.id,
        chain,
        tokenSymbol,
      });

      res.status(200).json({
        success: true,
        data: vault,
      });
    } catch (error) {
      logger.error('❌ Failed to get/create vault', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process vault',
      });
    }
  }

  /**
   * GET /api/v1/vaults/:vaultId
   * Get vault by ID
   */
  async getVaultById(req: Request, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;

      const vault = await this.container.b2bVaultUseCase.getVaultById(vaultId);

      if (!vault) {
        res.status(404).json({
          success: false,
          message: 'Vault not found',
        });
        return;
      }

      res.json({
        success: true,
        data: vault,
      });
    } catch (error) {
      logger.error('❌ Failed to get vault', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get vault',
      });
    }
  }

  /**
   * GET /api/v1/vaults/client/:clientId
   * List all vaults for a client
   */
  async listClientVaults(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;

      const vaults = await this.container.b2bVaultUseCase.listClientVaults(clientId);

      res.json({
        success: true,
        data: vaults,
        count: vaults.length,
      });
    } catch (error) {
      logger.error('❌ Failed to list vaults', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list vaults',
      });
    }
  }

  /**
   * GET /api/v1/vaults/client/:clientId/token/:chain/:tokenAddress
   * Get vault by client, chain, and token
   */
  async getVaultByToken(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, chain, tokenAddress } = req.params;

      const vault = await this.container.b2bVaultUseCase.getVaultByToken(
        clientId,
        chain,
        tokenAddress
      );

      if (!vault) {
        res.status(404).json({
          success: false,
          message: 'Vault not found',
        });
        return;
      }

      res.json({
        success: true,
        data: vault,
      });
    } catch (error) {
      logger.error('❌ Failed to get vault by token', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get vault',
      });
    }
  }

  /**
   * POST /api/v1/vaults/:vaultId/index/update
   * Update vault index with yield (FLOW 7)
   */
  async updateIndexWithYield(req: Request, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;
      const { yieldEarned } = req.body;

      if (!yieldEarned) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: yieldEarned',
        });
        return;
      }

      await this.container.b2bVaultUseCase.updateIndexWithYield(vaultId, yieldEarned);

      logger.info(`✅ Index updated for vault ${vaultId}`, { yieldEarned });

      res.json({
        success: true,
        message: 'Vault index updated successfully',
      });
    } catch (error) {
      logger.error('❌ Failed to update vault index', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update index',
      });
    }
  }

  /**
   * GET /api/v1/vaults/ready-for-staking
   * Get vaults ready for staking (pending balance >= threshold)
   */
  async getVaultsReadyForStaking(req: Request, res: Response): Promise<void> {
    try {
      const { minAmount } = req.query;

      const vaults = await this.container.b2bVaultUseCase.getVaultsReadyForStaking(
        minAmount as string
      );

      res.json({
        success: true,
        data: vaults,
        count: vaults.length,
      });
    } catch (error) {
      logger.error('❌ Failed to get vaults ready for staking', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get vaults',
      });
    }
  }

  /**
   * POST /api/v1/vaults/:vaultId/stake
   * Mark funds as staked (after DeFi deployment)
   */
  async markFundsAsStaked(req: Request, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;
      const { amount } = req.body;

      if (!amount) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: amount',
        });
        return;
      }

      await this.container.b2bVaultUseCase.markFundsAsStaked(vaultId, amount);

      logger.info(`✅ Marked ${amount} as staked for vault ${vaultId}`);

      res.json({
        success: true,
        message: 'Funds marked as staked',
      });
    } catch (error) {
      logger.error('❌ Failed to mark funds as staked', { error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark funds',
      });
    }
  }
}
