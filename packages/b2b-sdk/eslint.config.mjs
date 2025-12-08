import baseConfig from '../eslint-config-base/eslint.config.mjs'

export default [
	...baseConfig,
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		ignores: ['dist/', 'node_modules/', '.turbo/'],
	},
]
