import path from 'node:path'
import { fileURLToPath } from 'node:url'
import baseConfig from '@proxify/eslint-config-base'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
	...baseConfig,
	{
		ignores: ['eslint.config.mjs'],
	},
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
	},
]
