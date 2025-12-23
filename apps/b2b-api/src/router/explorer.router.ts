/**
 * Explorer Router - transparency/explorer endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@quirk/b2b-api-core";
import type { ExplorerService } from "../service/explorer.service";
import { logger } from "../logger";

export const createExplorerRouter = (
	s: ReturnType<typeof initServer>,
	explorerService: ExplorerService
) => {
	return s.router(b2bContract.explorer, {
		// GET /explorer/:clientId - Public transparency page
		getPublicExplorer: async ({ params }) => {
			try {
				logger.info("Getting public explorer data", { clientId: params.clientId });

				const data = await explorerService.getPublicExplorer(params.clientId);

				if (!data) {
					return {
						status: 404 as const,
						body: { error: "Client not found" },
					};
				}

				return {
					status: 200 as const,
					body: {
						success: true,
						data,
					},
				};
			} catch (error: any) {
				logger.error("Failed to get public explorer", { error, clientId: params.clientId });
				return {
					status: 500 as const,
					body: { error: "Failed to get public explorer data" },
				};
			}
		},

		// GET /explorer/:clientId/:clientUserId - Private user report
		getPrivateExplorer: async ({ params }) => {
			try {
				logger.info("Getting private explorer data", {
					clientId: params.clientId,
					clientUserId: params.clientUserId,
				});

				const data = await explorerService.getPrivateExplorer(
					params.clientId,
					params.clientUserId
				);

				if (!data) {
					return {
						status: 404 as const,
						body: { error: "User not found" },
					};
				}

				return {
					status: 200 as const,
					body: {
						success: true,
						data,
					},
				};
			} catch (error: any) {
				logger.error("Failed to get private explorer", {
					error,
					clientId: params.clientId,
					clientUserId: params.clientUserId,
				});
				return {
					status: 500 as const,
					body: { error: "Failed to get private explorer data" },
				};
			}
		},
	});
};
