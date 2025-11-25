import eslintConfig from "eslint-config-base"

export default [
	...eslintConfig,
	{
		ignores: ["dist", "node_modules", "**/*.config.mjs", "**/*.config.ts", "**/*.config.js"],
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
