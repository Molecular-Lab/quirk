import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import baseConfig from '@proxify/eslint-config-base'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default tseslint.config(
	...baseConfig,
	{
		ignores: ['dist/**', 'node_modules/**', '.turbo/**', 'vite.config.ts'],
	},
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				project: ['./tsconfig.app.json', './tsconfig.node.json'],
				tsconfigRootDir: __dirname,
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactHooks.configs['recommended-latest'].rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
)
