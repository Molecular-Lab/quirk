/**
 * B2B User Vault (Balance) Router
 * Routes for user balance queries
 */

import { Router } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { B2BUserVaultController } from '../controllers/b2b-user-vault.controller';

export function createB2BUserVaultRouter(container: DIContainer): Router {
  const router = Router();
  const controller = new B2BUserVaultController(container);

  // Get user balance/portfolio
  router.get('/client/:clientId/user/:userId', (req, res) => controller.getUserBalance(req, res));

  // List vault users
  router.get('/vault/:clientId/:chain/:tokenAddress/users', (req, res) =>
    controller.listVaultUsers(req, res)
  );

  return router;
}
