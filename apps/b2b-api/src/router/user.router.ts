/**
 * User Router - B2B end-user endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { UserService } from "../service/user.service";
import { mapUserToDto, mapUsersToDto, mapUserPortfolioToDto } from "../mapper/user.mapper";
import { logger } from "../logger";

export const createUserRouter = (
	s: ReturnType<typeof initServer>,
	userService: UserService
) => {
	return s.router(b2bContract.user, {
		// POST /users - Get or create user
		getOrCreate: async ({ body }) => {
			try {
				const user = await userService.getOrCreateUser({
					clientId: body.clientId,
					userId: body.clientUserId,
					userType: "individual", // Default
					userWalletAddress: body.walletAddress,
				});

				return {
					status: 200 as const,
					body: mapUserToDto(user),
				};
			} catch (error) {
				logger.error("Failed to get or create user", { error, body });
				return {
					status: 400 as const,
					body: { error: "Failed to create user" },
				};
			}
		},

		// GET /users/:id - Get user by ID
		getById: async ({ params }) => {
			try {
				const user = await userService.getUserByClientAndUserId(
					params.id,
					params.id
				);

				if (!user) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapUserToDto(user),
				};
			} catch (error) {
				logger.error("Failed to get user by ID", { error, userId: params.id });
				return {
					status: 404 as const,
					body: { error: "User not found" },
				};
			}
		},

		// GET /users/client/:clientId/user/:clientUserId
		getByClientUserId: async ({ params }) => {
			try {
				const user = await userService.getUserByClientAndUserId(
					params.clientId,
					params.clientUserId
				);

				if (!user) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapUserToDto(user),
				};
			} catch (error) {
				logger.error("Failed to get user", { error, params });
				return {
					status: 404 as const,
					body: { error: "User not found" },
				};
			}
		},

		// GET /users/client/:clientId - List users
		listByClient: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;
				const offset = query?.offset ? parseInt(query.offset) : 0;

				const users = await userService.listUsersByClient(
					params.clientId,
					limit,
					offset
				);

				return {
					status: 200 as const,
					body: mapUsersToDto(users),
				};
			} catch (error) {
				logger.error("Failed to list users", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /users/:userId/portfolio
		getPortfolio: async ({ params }) => {
			try {
				const portfolio = await userService.getUserPortfolio(params.userId);

				if (!portfolio) {
					return {
						status: 404 as const,
						body: { error: "Portfolio not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapUserPortfolioToDto(portfolio),
				};
			} catch (error) {
				logger.error("Failed to get portfolio", { error, userId: params.userId });
				return {
					status: 404 as const,
					body: { error: "Portfolio not found" },
				};
			}
		},
	});
};
