import baseConfig from './packages/eslint-config-base/eslint.config.mjs'

export default [
	...baseConfig,
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/.turbo/**',
			'**/build/**',
			'**/.next/**',
			'**/coverage/**',
			'**/*.config.js',
			'**/*.config.ts',
			'**/*.config.mjs',
		],
	},
]
