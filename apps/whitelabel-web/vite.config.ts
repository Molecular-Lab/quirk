import tanstackRouterPlugin from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouterPlugin({
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
			autoCodeSplitting: true,
		}),
		react(),
		tsconfigPaths(),
		nodePolyfills({
			include: ["crypto"],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
		}),
	],
})
