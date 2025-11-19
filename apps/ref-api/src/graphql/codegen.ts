import { CodegenConfig } from "@graphql-codegen/cli"

import { ENV } from "../env"

/**
 * https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
 */
const config: CodegenConfig = {
	schema: ENV.SUBGRAPH.ENDPOINT,
	documents: ["./src/**/*.ts"],
	generates: {
		"./src/graphql/__generated__/": {
			preset: "client",
			presetConfig: {
				gqlTagName: "gql",
			},
		},
		"./src/graphql/__generated__/types.ts": {
			plugins: ["typescript", "typescript-operations"],
		},
	},
	config: {
		scalars: {
			BigInt: {
				input: "string",
				output: "string",
			},
			BigFloat: {
				input: "string",
				output: "string",
			},
			BigDecimal: {
				input: "string",
				output: "string",
			},
		},
	},
	ignoreNoDocuments: true,
}

export default config
