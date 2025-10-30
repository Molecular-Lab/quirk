import eslintPluginTurbo from "eslint-plugin-turbo"
import prettierPlugin from "eslint-plugin-prettier"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import importPlugin from "eslint-plugin-import"
import unusedImportsPlugin from "eslint-plugin-unused-imports"
import autofixPlugin from "eslint-plugin-autofix"
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort"
import tsLint from "typescript-eslint"
import eslintJs from "@eslint/js"

export default [
	eslintPluginTurbo.configs["flat/recommended"],
	eslintJs.configs.recommended,
	...tsLint.configs.strictTypeChecked,
	...tsLint.configs.stylisticTypeChecked,
	eslintPluginPrettierRecommended,
	importPlugin.flatConfigs.recommended,
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		settings: {
			"import/ignore": ["node_modules"],
			"import/parsers": {
				"@typescript-eslint/parser": [".ts", ".tsx"],
			},
		},
		ignores: [
			"dist/",
			"node_modules/",
			".turbo/",
			"eslint.config.mjs",
			".prettierrc.js",
			"jest.config.js",
			"postcss.config.js",
			"tailwind.config.js",
			"**/*.json",
		],
	},
	{
		plugins: {
			prettier: prettierPlugin,
			"simple-import-sort": simpleImportSortPlugin,
			autofix: autofixPlugin,
			"unused-imports": unusedImportsPlugin,
			"@typescript-eslint": tsLint.plugin,
		},
		rules: {
			"prettier/prettier": [
				"warn",
				{},
				{
					usePrettierrc: true,
				},
			],
			"autofix/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					ignoreRestSiblings: true,
					destructuredArrayIgnorePattern: "^_",
					args: "none",
				},
			],
			"@typescript-eslint/no-empty-object-type": ["off"],
			"@typescript-eslint/no-unsafe-assignment": ["off"],
			"@typescript-eslint/no-unused-expressions": ["error"],
			"@typescript-eslint/no-unnecessary-condition": [
				"error",
				{
					allowConstantLoopConditions: "only-allowed-literals",
				},
			],
			"@typescript-eslint/no-explicit-any": ["error"],
			"@typescript-eslint/no-floating-promises": ["warn"],
			"@typescript-eslint/restrict-template-expressions": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: {
						arguments: false,
						attributes: false,
					},
				},
			],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-empty-interface": [
				"off",
				{
					allowSingleExtends: true,
				},
			],
			"sort-imports": [
				"error",
				{
					ignoreDeclarationSort: true,
				},
			],
			"import/order": [
				"error",
				{
					alphabetize: {
						order: "asc",
						orderImportKind: "asc",
						caseInsensitive: true,
					},
					pathGroups: [
						{
							pattern: "{react,react-*,react-*/**}",
							group: "external",
							position: "before",
						},
						{
							pattern: "@alphatrace/**",
							group: "internal",
							position: "before",
						},
						{
							pattern: "@/**",
							group: "internal",
						},
					],
					pathGroupsExcludedImportTypes: ["react"],
					groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
					"newlines-between": "always",
				},
			],
			"import/newline-after-import": "error",
			"import/no-unresolved": "off",
			"import/no-deprecated": "warn",
			"import/named": "warn",
			"import/first": "warn",
			"unused-imports/no-unused-imports": "error",
			"simple-import-sort/exports": "error",
			"no-console": "warn",
			"object-shorthand": ["warn", "consistent"],
			eqeqeq: "error",
		},
	},
]
