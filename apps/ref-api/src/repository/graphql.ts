import { TypedDocumentNode } from "@graphql-typed-document-node/core"
import axios, { isAxiosError } from "axios"
import { print } from "graphql"

import { Logger } from "@/logger"

export class SubgraphRepository {
	private readonly endpoint: string
	private readonly apiKey: string | undefined
	private readonly env: "LOCAL" | "DEV" | "PROD"

	constructor(init: { endpoint: string; apiKey: string | undefined }) {
		this.endpoint = init.endpoint
		this.apiKey = init.apiKey

		if (init.endpoint.includes("localhost")) {
			this.env = "LOCAL"
		} else if (init.endpoint.includes("api.studio.thegraph.com")) {
			this.env = "DEV"
		} else {
			this.env = "PROD"
		}

		if (this.env === "PROD" && !this.apiKey) {
			throw new Error("API key is required for production environment")
		}
	}

	private get authHeader(): string | undefined {
		if (this.env === "PROD") {
			return `Bearer ${this.apiKey}`
		}
		return undefined
	}

	async execute<TResult, TVariables>(
		query: TypedDocumentNode<TResult, TVariables>,
		...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
	): Promise<TResult> {
		try {
			Logger.info("[Subgraph] Executing subgraph query", {
				query: print(query),
				variables: variables,
				endpoint: this.endpoint,
			})
			const response = await axios.post<{ data: TResult }>(
				this.endpoint,
				{
					query: print(query),
					variables: variables,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/graphql-response+json",
						Authorization: this.authHeader,
					},
				},
			)

			return response.data.data
		} catch (error) {
			if (isAxiosError(error)) {
				throw error
			}
			throw new Error(`Unexpected error: ${error}`)
		}
	}
}
