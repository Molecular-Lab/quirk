/**
 * B2B User Router
 * Routes for end-user management operations
 */

import { Router } from 'express';
import type { DIContainer } from '../di/b2b-container';
import { B2BUserController } from '../controllers/b2b-user.controller';

export function createB2BUserRouter(container: DIContainer): Router {
  const router = Router();
  const controller = new B2BUserController(container);

  // Create/get user
  router.post('/', (req, res) => controller.getOrCreateUser(req, res));

  // Get user by client and user ID
  router.get('/client/:clientId/:userId', (req, res) =>
    controller.getUserByClientAndUserId(req, res)
  );

  // List users by client
  router.get('/client/:clientId', (req, res) => controller.listUsersByClient(req, res));

  // Get user portfolio
  router.get('/client/:clientId/:userId/portfolio', (req, res) =>
    controller.getUserPortfolio(req, res)
  );

  return router;
}
