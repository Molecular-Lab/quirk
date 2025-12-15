import path from 'node:path'
import { fileURLToPath } from 'node:url'
import eslintConfig from "@proxify/eslint-config-base"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
	...eslintConfig,
	{
		ignores: ["dist", "node_modules", "**/*.config.mjs", "**/*.config.ts", "**/*.config.js"],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		rules: {
			"react/prop-types": "off",
			"tailwindcss/no-custom-classname": "off",
			"react-refresh/only-export-components": "off",
		},
	},
]
