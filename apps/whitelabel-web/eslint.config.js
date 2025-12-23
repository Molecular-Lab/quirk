import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import baseConfig from '@quirk/eslint-config-base'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default tseslint.config(
	...baseConfig,
	{
		ignores: ['dist/**', 'node_modules/**', '.turbo/**', 'vite.config.ts', '*.config.js', '*.config.mjs'],
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
			
			// Disable overly strict rules for practical development
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for any types
			'@typescript-eslint/no-deprecated': 'warn', // Warn instead of error for deprecated APIs
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unnecessary-condition': 'warn',
			'@typescript-eslint/no-unnecessary-type-conversion': 'warn',
			'@typescript-eslint/restrict-plus-operands': 'warn',
			'@typescript-eslint/no-confusing-void-expression': 'warn',
			'@typescript-eslint/no-redundant-type-constituents': 'warn',
			'@typescript-eslint/only-throw-error': 'warn',
			'@typescript-eslint/prefer-promise-reject-errors': 'warn',
			'no-console': 'warn', // Warn instead of error for console statements
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'import/order': 'warn', // Warn for import ordering issues
			'object-shorthand': 'warn',
			'turbo/no-undeclared-env-vars': 'warn', // Disable for development
		},
	},
)
