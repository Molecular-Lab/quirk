/**
 * B2B Client Router
 * Routes for client management operations
 */

import { Router } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { B2BClientController } from '../controllers/b2b-client.controller';

export function createB2BClientRouter(container: DIContainer): Router {
  const router = Router();
  const controller = new B2BClientController(container);

  // Create client
  router.post('/', (req, res) => controller.createClient(req, res));

  // Get client by product ID
  router.get('/:productId', (req, res) => controller.getClient(req, res));

  // Get client balance
  router.get('/:clientId/balance', (req, res) => controller.getBalance(req, res));

  // Add funds to balance
  router.post('/:clientId/balance/add', (req, res) => controller.addFunds(req, res));

  // Reserve funds
  router.post('/:clientId/balance/reserve', (req, res) => controller.reserveFunds(req, res));

  // Get client statistics
  router.get('/:clientId/stats', (req, res) => controller.getStats(req, res));

  // List active clients
  router.get('/active/list', (req, res) => controller.listActiveClients(req, res));

  return router;
}
