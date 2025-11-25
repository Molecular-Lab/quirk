import { APIClient, ArkenClient } from "@proxify/api-core/client"

import { axiosClient } from "@/config/axios"

export const rabbitApiUrl = import.meta.env.VITE_RABBITSWAP_API_URL

export const apiClient = new APIClient(axiosClient, {
	rabbitApiUrl: rabbitApiUrl,
	coingeckoApiUrl: "https://api.coingecko.com/api/v3",
})
export default apiClient

export const arkenClient = new ArkenClient(axiosClient)
