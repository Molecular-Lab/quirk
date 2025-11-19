/**
 * B2B Deposit Router
 * Routes for deposit operations
 */

import { Router } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { B2BDepositController } from '../controllers/b2b-deposit.controller';

export function createB2BDepositRouter(container: DIContainer): Router {
  const router = Router();
  const controller = new B2BDepositController(container);

  // Create deposit
  router.post('/', (req, res) => controller.createDeposit(req, res));

  // Get deposit by order ID
  router.get('/:orderId', (req, res) => controller.getDeposit(req, res));

  // Complete deposit
  router.post('/:orderId/complete', (req, res) => controller.completeDeposit(req, res));

  // Fail deposit
  router.post('/:orderId/fail', (req, res) => controller.failDeposit(req, res));

  // List deposits by client
  router.get('/client/:clientId', (req, res) => controller.listDepositsByClient(req, res));

  // List deposits by user
  router.get('/client/:clientId/user/:userId', (req, res) => controller.listDepositsByUser(req, res));

  // List deposits by status
  router.get('/client/:clientId/status/:status', (req, res) => controller.listDepositsByStatus(req, res));

  return router;
}
