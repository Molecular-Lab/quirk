/**
 * Type-safe raw API client using ts-rest
 */

import { type AppRouter, type ClientArgs, type InitClientReturn, initClient } from "@ts-rest/core";
import { type AxiosInstance, type Method, isAxiosError } from "axios";

export type RawAPIClient<T extends AppRouter> = InitClientReturn<T, ClientArgs>;

export function initRawAPIClient<T extends AppRouter>(
	axiosClient: AxiosInstance,
	apiURL: string,
	contract: T
): RawAPIClient<T> {
	const client = initClient(contract, {
		baseUrl: apiURL,
		baseHeaders: {},
		jsonQuery: true,
		api: async (args) => {
			try {
				const result = await axiosClient.request({
					method: args.method as Method,
					url: args.path,
					headers: {
						...args.headers,
					},
					data: args.body,
					params: (args as any).query,
				});
				return { status: result.status, body: result.data, headers: result.headers as any };
			} catch (error) {
				if (isAxiosError(error) && error.response) {
					return {
						status: error.response.status,
						body: error.response.data,
						headers: error.response.headers,
					};
				}
				throw error;
			}
		},
	});
	return client;
}
