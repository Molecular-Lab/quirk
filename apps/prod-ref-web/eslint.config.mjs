import eslintConfig from "eslint-config-custom-react"

export default [
	...eslintConfig,
	{
		ignores: [
			"dist",
			"node_modules",
			"**/*.config.ts",
			"**/*.config.mjs",
			"**/*.config.ts",
			"**/*.config.js",
			"public",
		],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: "./tsconfig.json",
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
