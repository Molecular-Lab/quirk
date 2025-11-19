import eslintConfig from "eslint-config-base"

export default [
	...eslintConfig,
	{
		ignores: ["dist", "**/__generated__/*", "**/*.config.mjs", "**/*.config.ts", "**/*.config.js"],
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
]
