/**
 * B2B Vault Router
 * Routes for vault management operations
 */

import { Router } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { B2BVaultController } from '../controllers/b2b-vault.controller';

export function createB2BVaultRouter(container: DIContainer): Router {
  const router = Router();
  const controller = new B2BVaultController(container);

  // Create/get vault
  router.post('/', (req, res) => controller.getOrCreateVault(req, res));

  // Get vault by ID
  router.get('/:vaultId', (req, res) => controller.getVaultById(req, res));

  // List client vaults
  router.get('/client/:clientId', (req, res) => controller.listClientVaults(req, res));

  // Get vault by token
  router.get('/client/:clientId/token/:chain/:tokenAddress', (req, res) =>
    controller.getVaultByToken(req, res)
  );

  // Update index with yield (FLOW 7)
  router.post('/:vaultId/index/update', (req, res) => controller.updateIndexWithYield(req, res));

  // Get vaults ready for staking
  router.get('/ready-for-staking/list', (req, res) => controller.getVaultsReadyForStaking(req, res));

  // Mark funds as staked
  router.post('/:vaultId/stake', (req, res) => controller.markFundsAsStaked(req, res));

  return router;
}
