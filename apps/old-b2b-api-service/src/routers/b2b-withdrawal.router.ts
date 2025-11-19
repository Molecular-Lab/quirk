/**
 * B2B Withdrawal Router
 * Routes for withdrawal operations
 */

import { Router } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { B2BWithdrawalController } from '../controllers/b2b-withdrawal.controller';

export function createB2BWithdrawalRouter(container: DIContainer): Router {
  const router = Router();
  const controller = new B2BWithdrawalController(container);

  // Request withdrawal
  router.post('/', (req, res) => controller.requestWithdrawal(req, res));

  // Get withdrawal by order ID
  router.get('/:orderId', (req, res) => controller.getWithdrawal(req, res));

  // Complete withdrawal
  router.post('/:orderId/complete', (req, res) => controller.completeWithdrawal(req, res));

  // Fail withdrawal
  router.post('/:orderId/fail', (req, res) => controller.failWithdrawal(req, res));

  // List withdrawals by client
  router.get('/client/:clientId', (req, res) => controller.listWithdrawalsByClient(req, res));

  // List withdrawals by user
  router.get('/client/:clientId/user/:userId', (req, res) =>
    controller.listWithdrawalsByUser(req, res)
  );

  return router;
}
