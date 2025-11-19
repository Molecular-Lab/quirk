import deepMerge from "deepmerge"

import config from "@rabbitswap/ui/tailwind"

/** @type {import('tailwindcss').Config} */
export default {
	...deepMerge(config, {
		darkMode: ["class"],
		content: [
			"./pages/**/*.{ts,tsx}",
			"./components/**/*.{ts,tsx}",
			"./app/**/*.{ts,tsx}",
			"./src/**/*.{ts,tsx}",
			"./node_modules/@rabbitswap/ui/src/**/*.{ts,tsx}",
		],
		prefix: "",
		theme: {
			container: {
				center: true,
				padding: "2rem",
				screens: {
					"2xl": "1400px",
				},
			},
		},
	}),
}
