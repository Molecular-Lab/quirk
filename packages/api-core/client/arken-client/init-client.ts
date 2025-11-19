import { AppRouter, ClientArgs, InitClientReturn, initClient } from "@ts-rest/core"
import { AxiosInstance, Method, isAxiosError } from "axios"

export const ARKEN_API_URL = "https://api.arken.finance"

export type ArkenAPIClient<T extends AppRouter> = InitClientReturn<T, ClientArgs>

export function initArkenAPIClient<T extends AppRouter>(axiosClient: AxiosInstance, contract: T): ArkenAPIClient<T> {
	const client = initClient(contract, {
		baseUrl: ARKEN_API_URL,
		baseHeaders: {},
		jsonQuery: true,
		api: async (args) => {
			try {
				const result = await axiosClient.request({
					method: args.method as Method,
					url: args.path,
					headers: args.headers,
					data: args.body,
				})
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return { status: result.status, body: result.data, headers: result.headers as any }
			} catch (error) {
				if (isAxiosError(error) && error.response) {
					return {
						status: error.response.status,
						body: error.response.data,
						headers: error.response.headers,
					}
				}
				throw error
			}
		},
	})
	return client
}
