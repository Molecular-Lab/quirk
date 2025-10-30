import eslintConfig from "eslint-config-base"
import reactPlugin from "eslint-plugin-react"
import reactHookPlugin from "eslint-plugin-react-hooks"
import reactRefreshPlugin from "eslint-plugin-react-refresh"
import tailwind from "eslint-plugin-tailwindcss"

export default [
	...eslintConfig,
	reactPlugin.configs.flat.recommended,
	...tailwind.configs["flat/recommended"],
	{
		settings: {
			react: {
				version: "detect",
			},
			tailwindcss: {
				callees: ["classnames", "clsx", "ctl", "cva", "tv", "cn"],
			},
		},
	},
	{
		plugins: {
			react: reactPlugin,
			"react-hooks": reactHookPlugin,
			"react-refresh": reactRefreshPlugin,
		},
		rules: {
			...reactHookPlugin.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
			"react/self-closing-comp": "warn",
		},
	},
]
