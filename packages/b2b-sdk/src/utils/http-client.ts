/**
 * HTTP client for making API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

import { handleApiError } from "./errors"

export interface HttpClientConfig {
	baseURL: string
	apiKey: string
	timeout?: number
	maxRetries?: number
}

export class HttpClient {
	private client: AxiosInstance

	constructor(config: HttpClientConfig) {
		// Note: maxRetries can be implemented for retry logic if needed

		this.client = axios.create({
			baseURL: config.baseURL,
			timeout: config.timeout ?? 30000,
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": config.apiKey,
			},
		})

		// Response interceptor for error handling
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				handleApiError(error)
			},
		)
	}

	/**
	 * Make a GET request
	 */
	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const response: AxiosResponse<T> = await this.client.get(url, config)
		return response.data
	}

	/**
	 * Make a POST request
	 */
	async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const response: AxiosResponse<T> = await this.client.post(url, data, config)
		return response.data
	}

	/**
	 * Make a PUT request
	 */
	async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const response: AxiosResponse<T> = await this.client.put(url, data, config)
		return response.data
	}

	/**
	 * Make a PATCH request
	 */
	async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const response: AxiosResponse<T> = await this.client.patch(url, data, config)
		return response.data
	}

	/**
	 * Make a DELETE request
	 */
	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const response: AxiosResponse<T> = await this.client.delete(url, config)
		return response.data
	}

	/**
	 * Build query string from params object
	 */
	buildQueryString(params: Record<string, unknown>): string {
		const query = new URLSearchParams()

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				// Handle primitive types
				if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
					query.append(key, String(value))
				}
			}
		})

		const queryString = query.toString()
		return queryString ? `?${queryString}` : ""
	}
}
